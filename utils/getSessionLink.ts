/**
 * Canonical shareable path for the session feedback board.
 * Must stay in sync with `app/(app)/dashboard/[sessionId]/page.tsx`.
 */
export const SESSION_FEEDBACK_PATH = "/dashboard";

export function getSessionLink(sessionId: string | undefined | null): string {
  const id = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!id) return "";
  const path = `${SESSION_FEEDBACK_PATH}/${id}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
