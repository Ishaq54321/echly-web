import "server-only";
import type { UserDoc } from "@/lib/repositories/usersRepository.server";

/**
 * Email category gate (Phase 3).
 *
 * Every non-transactional email MUST pass through canSendEmail() before it is
 * sent. Transactional email (password reset, verification, billing receipts,
 * security alerts) ignores preferences entirely and always sends — see the
 * "transactional" branch below and CAN-SPAM (transactional/relationship email
 * is exempt from opt-out requirements).
 *
 * Preferences are stored on users/{uid}.emailPreferences. The field is
 * optional: existing users won't have it, and a missing field or missing key
 * means that category is still ENABLED (opt-out model, default all-true).
 */

/**
 * Preference categories shipped to users.
 *
 * Previously included `digest` and `marketing` as forward-looking placeholders.
 * Both were removed (2026-05): nothing read them, the unsubscribe page UI was
 * the only writer, and they showed up in the "all" unsubscribe path as dead
 * flags. Existing Firestore docs may still carry the fields; the runtime
 * reader ignores unknown keys via the spread overlay below, so no migration
 * is required.
 */
export const DEFAULT_EMAIL_PREFERENCES = {
  lifecycle: true,
  notifications: true,
} as const;

export type EmailPreferences = {
  -readonly [K in keyof typeof DEFAULT_EMAIL_PREFERENCES]: boolean;
};

/** Non-transactional categories users can opt out of. */
export type OptOutCategory = keyof typeof DEFAULT_EMAIL_PREFERENCES;

/** All categories canSendEmail accepts, including the always-on bucket. */
export type EmailCategory = OptOutCategory | "transactional";

/**
 * Resolve a user's effective preferences, layering any stored opt-outs over
 * the all-enabled defaults. Safe to call with a user whose emailPreferences is
 * undefined (returns all-true).
 */
export function getEmailPreferences(user: UserDoc): EmailPreferences {
  return { ...DEFAULT_EMAIL_PREFERENCES, ...user.emailPreferences };
}

/**
 * The gate. Returns true if an email of `category` may be sent to this user.
 *
 * - "transactional" → always true (account security / relationship email).
 * - any opt-out category → true unless the user has explicitly disabled it.
 */
export function canSendEmail(user: UserDoc, category: EmailCategory): boolean {
  if (category === "transactional") return true;
  return getEmailPreferences(user)[category];
}
