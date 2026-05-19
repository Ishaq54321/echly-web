// Shared formatting helpers for Phase 4 event-driven email templates.

/**
 * Truncate a comment body to a preview-friendly length. Collapses internal
 * whitespace (newlines, runs of spaces) to single spaces so it renders on one
 * line in a subject preheader / quoted block, and appends an ellipsis when
 * clipped.
 */
export function commentExcerpt(text: string, maxLen: number = 120): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 1).trim() + "…";
}

/**
 * Resolve a human display name for a user, preferring the friendliest field
 * available. Falls back to the email local-part, then a generic "there" so a
 * template never renders an empty name even with a sparse user doc.
 *
 * Fields are typed loose (string | null | undefined) because UserDoc stores
 * firstName/email as `string | null`.
 */
export function displayName(user: {
  displayName?: string | null;
  firstName?: string | null;
  email?: string | null;
}): string {
  if (user.displayName) return user.displayName;
  if (user.firstName) return user.firstName;
  if (user.email) {
    const local = user.email.split("@")[0];
    if (local) return local;
  }
  return "there";
}

/**
 * First-name-style greeting target for founder-voice emails. Same precedence
 * as displayName but tuned for "Hey {x}," — prefers firstName over a full
 * display name, then email local-part, then "there".
 */
export function greetingName(user: {
  firstName?: string | null;
  displayName?: string | null;
  email?: string | null;
}): string {
  if (user.firstName) return user.firstName;
  if (user.displayName) return user.displayName;
  if (user.email) {
    const local = user.email.split("@")[0];
    if (local) return local;
  }
  return "there";
}
