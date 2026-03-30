/** Canonical path for the session feedback board (`/session/:sessionId`). */
export const SESSION_FEEDBACK_PATH = "/session";

export function getSessionLink(sessionId: string | undefined | null): string {
  const id = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!id) return "";
  const path = `${SESSION_FEEDBACK_PATH}/${id}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
