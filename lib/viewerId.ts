const STORAGE_KEY = "echly_viewer_id";

/**
 * Returns a stable viewer id for Loom-style view counting.
 * - If user is authenticated, use user.id.
 * - If anonymous, use a fingerprint stored in localStorage (one per browser).
 */
export function getViewerId(authenticatedUserId: string | null | undefined): string {
  if (authenticatedUserId?.trim()) return authenticatedUserId;
  if (typeof window === "undefined") return "";
  let stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    stored = "anon_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, stored);
  }
  return stored;
}
