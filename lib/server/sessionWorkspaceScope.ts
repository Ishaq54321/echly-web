import "server-only";
import type { Session } from "@/lib/domain/session";

/** Strict workspace scope: only `workspaceId` (no legacy session.userId). */
export function sessionWorkspaceId(session: Session | null | undefined): string | null {
  const w = typeof session?.workspaceId === "string" ? session.workspaceId.trim() : "";
  return w ? w : null;
}
