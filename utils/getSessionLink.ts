import { SESSION_FEEDBACK_PATH, buildSessionPath } from "@/utils/sessionUrl";

// Re-exported so existing importers (workspaceStore, GlobalSearch, dashboard
// page, GlobalNavBar) keep their `@/utils/getSessionLink` import path while the
// constant's single source of truth lives in the neutral utils/sessionUrl.ts
// module shared with server-side email code.
export { SESSION_FEEDBACK_PATH };

export function getSessionLink(sessionId: string | undefined | null): string {
  const id = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!id) return "";
  const path = buildSessionPath(id);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
