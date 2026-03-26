/**
 * Link + invite permission tier for a session.
 * Stored on `Session.accessLevel` and `session_shares.permission`.
 */
export type AccessLevel = "view" | "comment" | "resolve";

export const ACCESS_LEVELS: readonly AccessLevel[] = ["view", "comment", "resolve"];

const ORDER: Record<AccessLevel, number> = {
  view: 0,
  comment: 1,
  resolve: 2,
};

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

/**
 * Whether an actor with `effectiveLevel` may perform an action that needs `requiredLevel`.
 * - view: baseline (caller should still ensure the user may open the session)
 * - comment: comment + resolve tiers
 * - resolve: resolve tier only
 */
export function hasPermission(effectiveLevel: AccessLevel, requiredLevel: AccessLevel): boolean {
  if (requiredLevel === "view") return true;
  return ORDER[effectiveLevel] >= ORDER[requiredLevel];
}
