import "server-only";

import { getAccessContext } from "@/lib/access/getAccessContext";
import type { AccessContext } from "@/lib/access/resolveAccess";
import type { Feedback } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import { getFeedbackByIdRepo } from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import type { AuthorizedRequestUser } from "@/lib/server/auth/authorize";
import { tryGetAuthUser, UnauthorizedError } from "@/lib/server/auth/authorize";
import { extractShareToken } from "@/lib/server/shareTokenFromRequest";

export type RequestIdentity =
  | { type: "USER"; userId: string }
  | { type: "SHARE"; shareToken: string };

export type ResolvedAccessIdentity =
  | { type: "SHARE"; shareToken: string }
  | { type: "USER"; user: AuthorizedRequestUser; shareToken?: string }
  | { type: "NONE" };

/**
 * Application identity can combine Firebase `user` with an optional share link token.
 * When both exist, identity remains {@link RequestIdentity} `USER` and `shareToken` is still passed into {@link getAccessContext}.
 */
export async function resolveAccessIdentity(
  req: Request,
  options?: {
    /** When set (e.g. after `withAuthorization`), skips {@link tryGetAuthUser}. Use `null` to force no user. */
    authenticatedUser?: AuthorizedRequestUser | null;
    bodyShareToken?: string | null;
  }
): Promise<ResolvedAccessIdentity> {
  const shareToken = extractShareToken(req, options?.bodyShareToken ?? undefined);
  const authUser =
    options?.authenticatedUser !== undefined
      ? options.authenticatedUser
      : await tryGetAuthUser(req);
  if (authUser) {
    return shareToken
      ? { type: "USER", user: authUser, shareToken }
      : { type: "USER", user: authUser };
  }
  if (shareToken) {
    return { type: "SHARE", shareToken };
  }
  return { type: "NONE" };
}

/** For optional-auth session routes: never throws; viewer may be absent (session baseline / public). */
export async function resolveOptionalSessionViewer(
  req: Request,
  options?: { bodyShareToken?: string | null }
): Promise<{
  viewerUser: AuthorizedRequestUser | null;
  tokenString: string | undefined;
}> {
  const id = await resolveAccessIdentity(req, {
    bodyShareToken: options?.bodyShareToken,
  });
  if (id.type === "SHARE") {
    return { viewerUser: null, tokenString: id.shareToken };
  }
  if (id.type === "USER") {
    return { viewerUser: id.user, tokenString: id.shareToken };
  }
  return { viewerUser: null, tokenString: undefined };
}

export interface RequestContext {
  /** Authenticated Firebase uid when identity is USER; null for SHARE-only access. */
  userId: string | null;

  identity: RequestIdentity;

  userWorkspaceId: string;

  feedback?: Feedback | null;

  session?: Session | null;

  sessionWorkspaceId?: string;

  access: AccessContext | null;
}

export async function buildRequestContext(params: {
  req: Request;
  /**
   * When the route already verified the user (`withAuthorization`, `requireAuth`, etc.).
   * Omit to resolve from the request via {@link tryGetAuthUser}.
   */
  authenticatedUser?: AuthorizedRequestUser | null;
  /** When provided (e.g. viewer workspace from withAuthorization), skips getUserWorkspaceIdRepo */
  userWorkspaceId?: string;
  feedbackId?: string;
  sessionId?: string;
  /** When provided (including null), skips getFeedbackByIdRepo for feedbackId */
  feedback?: Feedback | null;
  /** When provided (including null), skips session reads for the resolved path */
  session?: Session | null;
  /** POST body field `shareToken` (merged with query/header in {@link extractShareToken}). */
  bodyShareToken?: string | null;
}): Promise<RequestContext> {
  const { feedbackId, sessionId } = params;

  const identityRes = await resolveAccessIdentity(params.req, {
    authenticatedUser: params.authenticatedUser,
    bodyShareToken: params.bodyShareToken,
  });

  if (identityRes.type === "NONE") {
    throw new UnauthorizedError();
  }

  const identity: RequestIdentity =
    identityRes.type === "SHARE"
      ? { type: "SHARE", shareToken: identityRes.shareToken }
      : { type: "USER", userId: identityRes.user.uid };

  const viewerUser: AuthorizedRequestUser | null =
    identityRes.type === "USER" ? identityRes.user : null;
  const tokenString =
    identityRes.type === "SHARE"
      ? identityRes.shareToken
      : identityRes.type === "USER"
        ? identityRes.shareToken
        : undefined;

  const userId = viewerUser?.uid ?? null;

  const usePreloadedFeedback = params.feedback !== undefined;
  const usePreloadedSession = params.session !== undefined;

  const trimmedPreloaded =
    typeof params.userWorkspaceId === "string"
      ? params.userWorkspaceId.trim()
      : "";

  const workspacePromise =
    viewerUser == null
      ? Promise.resolve("")
      : trimmedPreloaded !== ""
        ? Promise.resolve(trimmedPreloaded)
        : getUserWorkspaceIdRepo(viewerUser.uid);

  const hasExplicitSessionId =
    typeof sessionId === "string" && sessionId.trim() !== "";
  const explicitSessionId = hasExplicitSessionId ? sessionId.trim() : "";

  const skipFeedbackRepo = usePreloadedFeedback || !feedbackId;
  const skipSessionExplicitRepo = hasExplicitSessionId && usePreloadedSession;

  const [userWorkspaceId, feedbackFetched, sessionFromExplicit] =
    await Promise.all([
      workspacePromise,
      skipFeedbackRepo
        ? Promise.resolve(null)
        : getFeedbackByIdRepo(feedbackId!),
      hasExplicitSessionId && !skipSessionExplicitRepo
        ? getSessionByIdRepo(explicitSessionId)
        : Promise.resolve(null),
    ]);

  const feedback = usePreloadedFeedback ? params.feedback! : feedbackFetched;

  let session: Session | null;

  if (hasExplicitSessionId) {
    session = usePreloadedSession ? params.session! : sessionFromExplicit;
  } else if (feedback) {
    const sid = feedback.sessionId;
    if (usePreloadedSession) {
      session = params.session!;
    } else {
      session = await getSessionByIdRepo(sid);
    }
  } else {
    session = usePreloadedSession ? params.session! : null;
  }

  const sessionWorkspaceId =
    session && typeof session.workspaceId === "string"
      ? session.workspaceId.trim()
      : undefined;

  const sidForAccess =
    explicitSessionId ||
    (session?.id ? String(session.id).trim() : "") ||
    (feedback?.sessionId ? String(feedback.sessionId).trim() : "");

  let access: AccessContext | null = null;
  if (sidForAccess) {
    const trimmedWs = userWorkspaceId.trim();
    const accessUser =
      viewerUser == null
        ? null
        : { uid: viewerUser.uid, email: viewerUser.email };
    const { access: resolved } = await getAccessContext({
      sessionId: sidForAccess,
      user: accessUser,
      session,
      tokenString,
      viewerWorkspaceIdOverride: trimmedWs !== "" ? trimmedWs : undefined,
    });
    access = resolved;
  }

  return {
    userId,
    identity,
    userWorkspaceId,
    feedback,
    session,
    sessionWorkspaceId,
    access,
  };
}
