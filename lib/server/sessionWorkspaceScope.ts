import "server-only";
import type { Session } from "@/lib/domain/session";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

/** Strict workspace scope: only `workspaceId` (no legacy session.userId). */
export function sessionWorkspaceId(session: Session | null | undefined): string | null {
  const w = typeof session?.workspaceId === "string" ? session.workspaceId.trim() : "";
  return w ? w : null;
}

/** True when the signed-in user's `users/{uid}.workspaceId` matches the session workspace. */
export async function userWorkspaceMatchesSession(
  uid: string,
  session: Session | null | undefined
): Promise<boolean> {
  if (!session) return false;
  const wid = await getUserWorkspaceIdRepo(uid);
  const sw = sessionWorkspaceId(session);
  return sw != null && wid === sw;
}
