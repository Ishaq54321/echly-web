import type { Session } from "@/lib/domain/session";
import type { Feedback } from "@/lib/domain/feedback";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { hasPermission } from "@/lib/domain/accessLevel";
import type { AuthUser } from "@/lib/server/auth";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getSessionSharePermissionForEmailRepo } from "@/lib/repositories/sessionSharesRepository";
import { getEffectiveAccessLevel } from "@/lib/permissions/sessionEffectiveAccess";

export async function getEffectiveAccessLevelForActor(
  user: AuthUser,
  session: Session
): Promise<AccessLevel> {
  const viewerWorkspaceId = await getUserWorkspaceIdRepo(user.uid);
  let invitedPermission: AccessLevel | null = null;
  if (user.email) {
    invitedPermission = await getSessionSharePermissionForEmailRepo(session.id, user.email);
  }
  return getEffectiveAccessLevel({
    session,
    viewerUserId: user.uid,
    viewerWorkspaceId,
    invitedPermission,
  });
}

/**
 * Ticket APIs: workspace members, session owner, ticket author, or explicit email share.
 */
export async function canAccessTicketForActor(
  user: AuthUser,
  ticket: Feedback,
  session: Session | null
): Promise<boolean> {
  if (!session) return false;
  if (ticket.userId === user.uid) return true;
  if (session.userId === user.uid) return true;
  const userWs = await getUserWorkspaceIdRepo(user.uid);
  if (session.workspaceId != null && userWs === session.workspaceId) return true;
  if (user.email) {
    const share = await getSessionSharePermissionForEmailRepo(session.id, user.email);
    if (share != null) return true;
  }
  return false;
}

export async function requireTicketActorPermission(
  user: AuthUser,
  ticket: Feedback,
  session: Session | null,
  required: AccessLevel
): Promise<
  | { ok: true; effective: AccessLevel }
  | { ok: false; status: number; message: string }
> {
  const access = await canAccessTicketForActor(user, ticket, session);
  if (!access || !session) {
    return { ok: false, status: 403, message: "Forbidden" };
  }
  const effective = await getEffectiveAccessLevelForActor(user, session);
  if (!hasPermission(effective, required)) {
    return { ok: false, status: 403, message: "Insufficient permission" };
  }
  return { ok: true, effective };
}
