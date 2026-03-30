/**
 * Permission tier for a session and share link access.
 * Stored on `Session.accessLevel`.
 */
export type AccessLevel = "view" | "comment" | "resolve";

export const ACCESS_LEVELS: readonly AccessLevel[] = ["view", "comment", "resolve"];

export function requireAccessLevel(raw: unknown): AccessLevel {
  if (raw === "view" || raw === "comment" || raw === "resolve") return raw;
  throw new Error(
    `Invalid accessLevel: expected view|comment|resolve, got ${JSON.stringify(raw)}`,
  );
}

/** Strict parse for optional API body fields — returns null only when the field must be rejected with 400, not thrown. */
export function parseAccessLevelStrict(raw: unknown): AccessLevel | null {
  if (raw === "view" || raw === "comment" || raw === "resolve") return raw;
  return null;
}
