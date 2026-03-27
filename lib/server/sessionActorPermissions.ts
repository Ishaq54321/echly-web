import type { Session } from "@/lib/domain/session";
import type { Feedback } from "@/lib/domain/feedback";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { hasPermission } from "@/lib/domain/accessLevel";
import type { AuthUser } from "@/lib/server/auth";
import { getSessionSharePermissionForEmailRepo } from "@/lib/repositories/sessionSharesRepository";
import { getEffectiveAccessLevel } from "@/lib/permissions/sessionEffectiveAccess";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

export async function getEffectiveAccessLevelForActor(
  user: AuthUser,
  session: Session
): Promise<AccessLevel> {
  let invitedPermission: AccessLevel | null = null;
  if (user.email) {
    invitedPermission = await getSessionSharePermissionForEmailRepo(session.id, user.email);
  }
  const viewerWorkspaceId = await getUserWorkspaceIdRepo(user.uid);
  return getEffectiveAccessLevel({
    session,
    viewerWorkspaceId,
    invitedPermission,
  });
}

/**
 * Ticket APIs: session owner, ticket author, or explicit email share.
 */
export async function canAccessTicketForActor(
  user: AuthUser,
  ticket: Feedback,
  session: Session | null
): Promise<boolean> {
  if (!session) return false;
  const actorWorkspaceId = await getUserWorkspaceIdRepo(user.uid);
  if (ticket.workspaceId === actorWorkspaceId) return true;
  if (session.workspaceId === actorWorkspaceId) return true;
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
