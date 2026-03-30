import "server-only";
import type { Session } from "@/lib/domain/session";

/** Workspace scope from the session document (`workspaceId` only). */
export function sessionWorkspaceId(session: Session | null | undefined): string | null {
  const w = typeof session?.workspaceId === "string" ? session.workspaceId.trim() : "";
  return w ? w : null;
}
