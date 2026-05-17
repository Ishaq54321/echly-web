import "server-only";

import {
  getAccessContext,
  type AccessContextRequestAwareness,
} from "@/lib/access/getAccessContext";
import type { AccessContext } from "@/lib/access/resolveAccess";
import type { Feedback } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import { getFeedbackByIdRepo } from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { getUserProfileForRequestContextRepo } from "@/lib/repositories/usersRepository.server";
import type { AuthorizedRequestUser } from "@/lib/server/auth/authorize";
import {
  AuthorizationError,
  tryGetAuthUser,
  toAuthorizationResponse,
  UnauthorizedError,
} from "@/lib/server/auth/authorize";
import type { IdentityType, SystemContext } from "@/lib/server/systemContext";

export type ResolvedAccessIdentity =
  | { type: "USER"; user: AuthorizedRequestUser }
  | { type: "NONE" };

/**
 * Single identity model:
 * - USER when authenticated
 * - NONE otherwise
 */
export async function resolveAccessIdentity(
  req: Request,
  options?: {
    /** When set (e.g. after `withAuthorization`), skips {@link tryGetAuthUser}. Use `null` to force no user. */
    authenticatedUser?: AuthorizedRequestUser | null;
  }
): Promise<ResolvedAccessIdentity> {
  const authUser =
    options?.authenticatedUser !== undefined
      ? options.authenticatedUser
      : await tryGetAuthUser(req);
  if (authUser) {
    return { type: "USER", user: authUser };
  }
  return { type: "NONE" };
}

/** For optional-auth session routes: never throws; viewer may be absent (session baseline / public). */
export async function resolveOptionalSessionViewer(
  req: Request
): Promise<{
  viewerUser: AuthorizedRequestUser | null;
}> {
  const id = await resolveAccessIdentity(req);
  if (id.type === "USER") {
    return { viewerUser: id.user };
  }
  return { viewerUser: null };
}

export interface RequestContext extends SystemContext {
  feedback?: Feedback | null;

  session?: Session | null;

  sessionWorkspaceId?: string;

  access: AccessContext | null;

  /** From {@link getAccessContext}; resolve-access request awareness for UI only. */
  accessRequest: AccessContextRequestAwareness | null;
}

export async function buildRequestContext(params: {
  req: Request;
  /**
   * When the route already verified the user (`withAuthorization`, `requireAuth`, etc.).
   * Omit to resolve from the request via {@link tryGetAuthUser}.
   */
  authenticatedUser?: AuthorizedRequestUser | null;
  /** When provided (e.g. viewer workspace from withAuthorization), skips reading workspace from the user doc */
  userWorkspaceId?: string;
  feedbackId?: string;
  sessionId?: string;
  /** When provided (including null), skips getFeedbackByIdRepo for feedbackId */
  feedback?: Feedback | null;
  /** When provided (including null), skips session reads for the resolved path */
  session?: Session | null;
  /** Pre-fetched user profile from withAuthorization; when present, skips the users/{uid} Firestore read. */
  preloadedUserProfile?: { email: string | null; workspaceId: string } | null;
  /**
   * Phase 28.X — Access context already resolved by an earlier
   * `buildRequestContext` call in the same request (threaded via
   * `withAuthorization`'s `ctx.preloaded`). When present, this is a hard
   * short-circuit: `getAccessContext` is NOT called again and these exact
   * values are reused. Eliminates the redundant 4-doc Firestore fan-out
   * the dedup cache routinely missed under real latency. Requires the
   * caller to also pass `feedback`/`session` (it does — same preload).
   */
  preloadedAccess?: {
    access: AccessContext | null;
    accessRequest: AccessContextRequestAwareness | null;
    sessionWorkspaceId?: string;
    userId?: string | null;
  };
  /**
   * When true, anonymous requests without a share token are allowed; `identityType` is `NONE`
   * and access is resolved with `user: null` (e.g. GET session overview).
   */
  optionalAuth?: boolean;
}): Promise<RequestContext> {
  const { feedbackId, sessionId } = params;

  const identityRes = await resolveAccessIdentity(params.req, {
    authenticatedUser: params.authenticatedUser,
  });

  if (identityRes.type === "NONE") {
    if (!params.optionalAuth) {
      throw new UnauthorizedError();
    }
  }

  const identityType: IdentityType =
    identityRes.type === "USER" ? "USER" : "NONE";

  const viewerUser: AuthorizedRequestUser | null =
    identityRes.type === "USER" ? identityRes.user : null;

  const userId = viewerUser == null ? null : viewerUser.uid;

  const usePreloadedFeedback = params.feedback !== undefined;
  const usePreloadedSession = params.session !== undefined;

  const trimmedPreloaded =
    typeof params.userWorkspaceId === "string"
      ? params.userWorkspaceId.trim()
      : "";

  const userProfilePromise =
    viewerUser == null
      ? Promise.resolve(null)
      : params.preloadedUserProfile != null
        ? Promise.resolve(params.preloadedUserProfile)
        : trimmedPreloaded !== ""
          ? getUserProfileForRequestContextRepo(viewerUser.uid, trimmedPreloaded)
          : getUserProfileForRequestContextRepo(viewerUser.uid, undefined);

  const hasExplicitSessionId =
    typeof sessionId === "string" && sessionId.trim() !== "";
  const explicitSessionId = hasExplicitSessionId ? sessionId.trim() : "";

  const skipFeedbackRepo = usePreloadedFeedback || !feedbackId;
  const skipSessionExplicitRepo = hasExplicitSessionId && usePreloadedSession;

  const [userProfile, feedbackFetched, sessionFromExplicit] =
    await Promise.all([
      userProfilePromise,
      skipFeedbackRepo
        ? Promise.resolve(null)
        : getFeedbackByIdRepo(feedbackId!),
      hasExplicitSessionId && !skipSessionExplicitRepo
        ? getSessionByIdRepo(explicitSessionId)
        : Promise.resolve(null),
    ]);

  const userWorkspaceIdRaw =
    userProfile != null && typeof userProfile.workspaceId === "string"
      ? userProfile.workspaceId.trim()
      : "";

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

  const sidForAccess =
    explicitSessionId ||
    (session?.id ? String(session.id).trim() : "") ||
    (feedback?.sessionId ? String(feedback.sessionId).trim() : "");

  const workspaceId: string | null =
    viewerUser != null
      ? (userWorkspaceIdRaw.trim() !== ""
          ? userWorkspaceIdRaw.trim()
          : null)
      : null;

  let access: AccessContext | null = null;
  let accessRequest: AccessContextRequestAwareness | null = null;
  let sessionOut: Session | null = session;
  if (params.preloadedAccess !== undefined) {
    // Phase 28.X hard short-circuit — reuse the access context resolved by
    // the earlier buildRequestContext call (resolveTicketWorkspaceId). No
    // getAccessContext fan-out. Not a cache: if preloaded access exists, it
    // is authoritative for this request.
    console.log(
      "[PERF] buildRequestContext: using preloaded access — skipped getAccessContext"
    );
    access = params.preloadedAccess.access;
    accessRequest = params.preloadedAccess.accessRequest;
    sessionOut = session;
  } else if (sidForAccess) {
    const accessContextInput: SystemContext = {
      userId,
      workspaceId,
      identityType,
    };
    const resolved = await getAccessContext({
      sessionId: sidForAccess,
      context: accessContextInput,
      session,
      ...(userProfile != null ? { preloadedUserFields: userProfile } : {}),
    });
    access = resolved.access;
    sessionOut = resolved.session;
    accessRequest = resolved.request;
  }

  const sessionWorkspaceId =
    sessionOut != null && typeof sessionOut.workspaceId === "string"
      ? sessionOut.workspaceId.trim()
      : undefined;

  return {
    userId,
    workspaceId,
    identityType,
    feedback,
    session: sessionOut,
    sessionWorkspaceId,
    access,
    accessRequest,
  };
}

export async function tryBuildRequestContext(
  params: Parameters<typeof buildRequestContext>[0]
): Promise<
  { ok: true; ctx: RequestContext } | { ok: false; response: Response }
> {
  try {
    const ctx = await buildRequestContext(params);
    return { ok: true, ctx };
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof AuthorizationError) {
      return { ok: false, response: toAuthorizationResponse(e) };
    }
    throw e;
  }
}
