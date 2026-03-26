import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";
import type { Session } from "@/lib/domain/session";

export type SessionAccessSlice = Pick<Session, "userId" | "workspaceId" | "accessLevel">;

/**
 * Effective tier for a viewer: owner + workspace peers are always `resolve`;
 * otherwise an email invite row, else the session link default (`accessLevel`).
 */
export function getEffectiveAccessLevel(params: {
  session: SessionAccessSlice | null | undefined;
  viewerUserId: string;
  viewerWorkspaceId?: string | null;
  invitedPermission?: AccessLevel | null;
}): AccessLevel {
  const { session, viewerUserId, viewerWorkspaceId, invitedPermission } = params;
  if (!session) return "view";
  if (session.userId != null && session.userId === viewerUserId) return "resolve";
  const sw = session.workspaceId ?? null;
  const vw = viewerWorkspaceId ?? null;
  if (sw != null && vw != null && sw === vw) return "resolve";
  if (invitedPermission != null) return normalizeAccessLevel(invitedPermission);
  return normalizeAccessLevel(session.accessLevel);
}
