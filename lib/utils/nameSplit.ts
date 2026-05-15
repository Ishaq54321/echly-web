export interface SplitName {
  firstName: string;
  lastName: string;
}

/**
 * Splits a full name on the FIRST space.
 * "Mary Jane Watson" → { firstName: "Mary", lastName: "Jane Watson" }
 * "Cher" → { firstName: "Cher", lastName: "" }
 * "" → { firstName: "", lastName: "" }
 * "  Bob  " → { firstName: "Bob", lastName: "" }
 */
export function splitFullName(fullName: string | null | undefined): SplitName {
  const trimmed = (fullName ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) return { firstName: trimmed, lastName: "" };
  return {
    firstName: trimmed.substring(0, firstSpace),
    lastName: trimmed.substring(firstSpace + 1).trim(),
  };
}

/**
 * Composes firstName + lastName into a display string.
 * Empty lastName: returns just firstName.
 * Empty firstName + non-empty lastName: returns just lastName (defensive).
 * Both empty: returns empty string.
 */
export function composeFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const f = (firstName ?? "").trim();
  const l = (lastName ?? "").trim();
  if (f && l) return `${f} ${l}`;
  return f || l || "";
}

/**
 * Standard fallback strings — use these everywhere, never inline strings.
 */
export const NAME_FALLBACK = {
  UNKNOWN: "Unknown user", // truly missing name (rare)
  ANONYMOUS: "Anonymous", // guest session viewers
  REMOVED: "Removed user", // deleted account placeholder
} as const;

/**
 * Resolves a user to their display name using the standard fallback ladder:
 *
 *   1. firstName + lastName (the canonical form)
 *   2. firstName alone OR lastName alone (whichever is present)
 *   3. authDisplayName (Firebase Auth displayName, often "First Last" from OAuth)
 *   4. Email local-part ("ishaq" from "ishaq@example.com")
 *   5. "Unknown user"
 *
 * Always returns a non-empty string. Pass null/undefined safely.
 *
 * Do NOT use this for anonymous session viewers — they have no user doc.
 * Use NAME_FALLBACK.ANONYMOUS directly for those.
 */
export interface ResolvableUser {
  firstName?: string | null;
  lastName?: string | null;
  authDisplayName?: string | null;
  displayName?: string | null; // legacy / member-doc field
  email?: string | null;
}

export function resolveUserName(
  user: ResolvableUser | null | undefined
): string {
  if (!user) return NAME_FALLBACK.UNKNOWN;

  // 1+2: firstName / lastName from user doc
  const fromFirstLast = composeFullName(user.firstName, user.lastName);
  if (fromFirstLast) return fromFirstLast;

  // 3: authDisplayName (or legacy displayName from member doc)
  const fromAuth = (user.authDisplayName ?? user.displayName ?? "").trim();
  if (fromAuth) return fromAuth;

  // 4: email local-part
  const email = (user.email ?? "").trim();
  if (email && email.includes("@")) {
    const local = email.split("@")[0];
    if (local) return local;
  }

  // 5: final fallback
  return NAME_FALLBACK.UNKNOWN;
}
