/**
 * Link + invite permission tier for a session.
 * Stored on `Session.accessLevel` and `session_shares.permission`.
 */
export type AccessLevel = "view" | "comment" | "resolve";

export const ACCESS_LEVELS: readonly AccessLevel[] = ["view", "comment", "resolve"];

/** Accept Firestore values; map legacy `"edit"` → `"resolve"`; unknown → `"view"`. */
export function normalizeAccessLevel(raw: unknown): AccessLevel {
  if (raw === "resolve" || raw === "comment" || raw === "view") return raw;
  if (raw === "edit") return "resolve";
  return "view";
}

/** Strict parse for API request bodies. Rejects unknown strings. */
export function parseAccessLevelStrict(raw: unknown): AccessLevel | null {
  if (raw === "view" || raw === "comment" || raw === "resolve") return raw;
  if (raw === "edit") return "resolve";
  return null;
}
