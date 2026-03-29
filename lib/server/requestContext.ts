import "server-only";

import { getAccessContext } from "@/lib/access/getAccessContext";
import type { ResolvedAccess } from "@/lib/access/resolveAccess";
import type { Feedback } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import { getFeedbackByIdRepo } from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

export interface RequestContext {
  userId: string;

  userWorkspaceId: string;

  feedback?: Feedback | null;

  session?: Session | null;

  sessionWorkspaceId?: string;

  access: ResolvedAccess | null;
}

export async function buildRequestContext(params: {
  userId: string;
  userEmail?: string | null;
  /** When provided (e.g. viewer workspace from withAuthorization), skips getUserWorkspaceIdRepo */
  userWorkspaceId?: string;
  feedbackId?: string;
  sessionId?: string;
  /** When provided (including null), skips getFeedbackByIdRepo for feedbackId */
  feedback?: Feedback | null;
  /** When provided (including null), skips session reads for the resolved path */
  session?: Session | null;
  tokenString?: string;
}): Promise<RequestContext> {
  const { userId, userEmail, feedbackId, sessionId } = params;

  const usePreloadedFeedback = params.feedback !== undefined;
  const usePreloadedSession = params.session !== undefined;

  const trimmedPreloaded =
    typeof params.userWorkspaceId === "string"
      ? params.userWorkspaceId.trim()
      : "";

  const workspacePromise =
    trimmedPreloaded !== ""
      ? Promise.resolve(trimmedPreloaded)
      : getUserWorkspaceIdRepo(userId);

  const hasExplicitSessionId =
    typeof sessionId === "string" && sessionId.trim() !== "";
  const explicitSessionId = hasExplicitSessionId ? sessionId.trim() : "";

  const skipFeedbackRepo = usePreloadedFeedback || !feedbackId;
  const skipSessionExplicitRepo =
    hasExplicitSessionId && usePreloadedSession;

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
    session = usePreloadedSession
      ? params.session!
      : sessionFromExplicit;
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

  let access: ResolvedAccess | null = null;
  if (sidForAccess) {
    const trimmedWs = userWorkspaceId.trim();
    const { access: resolved } = await getAccessContext({
      sessionId: sidForAccess,
      user: { uid: userId, email: userEmail ?? undefined },
      session,
      tokenString: params.tokenString,
      viewerWorkspaceIdOverride: trimmedWs !== "" ? trimmedWs : null,
    });
    access = resolved;
  }

  return {
    userId,
    userWorkspaceId,
    feedback,
    session,
    sessionWorkspaceId,
    access,
  };
}
