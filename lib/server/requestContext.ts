import "server-only";

import type { AccessLevel } from "@/lib/domain/accessLevel";
import { hasPermission } from "@/lib/domain/accessLevel";
import type { Feedback } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import { getEffectiveAccessLevel } from "@/lib/permissions/sessionEffectiveAccess";
import { getSessionSharePermissionForEmailRepo } from "@/lib/repositories/sessionSharesRepository";
import { getFeedbackByIdRepo } from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

export interface RequestContext {
  userId: string;

  userWorkspaceId: string;

  feedback?: any;
  session?: any;

  sessionWorkspaceId?: string;

  canAccess: boolean;
  accessLevel?: string;

  /** When canAccess is false and requiredTicketAccess was set; same strings as requireTicketActorPermission */
  permissionError?: string;
}

export async function buildRequestContext(params: {
  userId: string;
  userEmail?: string | null;
  /** When provided (e.g. verified workspace from withAuthorization), skips getUserWorkspaceIdRepo */
  userWorkspaceId?: string;
  feedbackId?: string;
  sessionId?: string;
  /** When set, applies the same rules as requireTicketActorPermission (single workspace read in this builder) */
  requiredTicketAccess?: AccessLevel;
  /** When provided (including null), skips getFeedbackByIdRepo for feedbackId */
  feedback?: Feedback | null;
  /** When provided (including null), skips session reads for the resolved path */
  session?: Session | null;
}): Promise<RequestContext> {
  const {
    userId,
    userEmail,
    feedbackId,
    sessionId,
    requiredTicketAccess,
  } = params;

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

  const shareExplicitPromise =
    hasExplicitSessionId && userEmail
      ? getSessionSharePermissionForEmailRepo(explicitSessionId, userEmail)
      : Promise.resolve(null as AccessLevel | null);

  const skipFeedbackRepo = usePreloadedFeedback || !feedbackId;
  const skipSessionExplicitRepo =
    hasExplicitSessionId && usePreloadedSession;

  const [userWorkspaceId, feedbackFetched, sessionFromExplicit, invitedIfExplicit] =
    await Promise.all([
      workspacePromise,
      skipFeedbackRepo
        ? Promise.resolve(null)
        : getFeedbackByIdRepo(feedbackId!),
      hasExplicitSessionId && !skipSessionExplicitRepo
        ? getSessionByIdRepo(explicitSessionId)
        : Promise.resolve(null),
      shareExplicitPromise,
    ]);

  const feedback = usePreloadedFeedback ? params.feedback! : feedbackFetched;

  let session: Session | null;
  let invitedPermission: AccessLevel | null = null;

  if (hasExplicitSessionId) {
    session = usePreloadedSession
      ? params.session!
      : sessionFromExplicit;
    if (userEmail) {
      invitedPermission = invitedIfExplicit;
    }
  } else if (feedback) {
    const sid = feedback.sessionId;
    if (usePreloadedSession) {
      session = params.session!;
      invitedPermission = userEmail
        ? await getSessionSharePermissionForEmailRepo(sid, userEmail)
        : null;
    } else {
      const [sessionFb, invitedFb] = await Promise.all([
        getSessionByIdRepo(sid),
        userEmail
          ? getSessionSharePermissionForEmailRepo(sid, userEmail)
          : Promise.resolve(null as AccessLevel | null),
      ]);
      session = sessionFb;
      invitedPermission = invitedFb;
    }
  } else {
    session = usePreloadedSession ? params.session! : null;
  }

  const sessionWorkspaceId =
    session && typeof session.workspaceId === "string"
      ? session.workspaceId.trim()
      : undefined;

  let canAccess = false;
  let accessLevel: string | undefined;
  let permissionError: string | undefined;

  if (requiredTicketAccess != null) {
    if (!feedback || !session) {
      canAccess = false;
      permissionError = "Forbidden";
    } else {
      const actorOk =
        feedback.workspaceId === userWorkspaceId ||
        session.workspaceId === userWorkspaceId ||
        invitedPermission != null;

      const effective = getEffectiveAccessLevel({
        session,
        viewerWorkspaceId: userWorkspaceId,
        invitedPermission,
      });
      accessLevel = effective;

      if (!actorOk) {
        canAccess = false;
        permissionError = "Forbidden";
      } else if (!hasPermission(effective, requiredTicketAccess)) {
        canAccess = false;
        permissionError = "Insufficient permission";
      } else {
        canAccess = true;
      }
    }
  } else if (userWorkspaceId && sessionWorkspaceId) {
    canAccess = userWorkspaceId === sessionWorkspaceId;
  }

  return {
    userId,
    userWorkspaceId,
    feedback,
    session,
    sessionWorkspaceId,
    canAccess,
    accessLevel,
    ...(permissionError != null ? { permissionError } : {}),
  };
}
