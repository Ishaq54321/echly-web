import "server-only";
import { sendEmailOrLog, type FromVariant } from "./resend";
import { canSendEmail, type OptOutCategory } from "./preferences";
import type { EmailSendResult } from "./types";
import {
  makeUnsubscribeToken,
  type UnsubscribeCategory,
} from "./unsubscribeToken";
import { getUserByIdRepo } from "@/lib/repositories/usersRepository.server";
import type { UserDoc } from "@/lib/repositories/usersRepository.server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

/**
 * The Phase 1 email shell renders the literal token "{{UNSUBSCRIBE_URL}}" in
 * the footer / plain-text trailer when no unsubscribeUrl is supplied (see
 * emailShellV2 / plainTextShellV2 defaults in components.ts). This wrapper
 * substitutes it with a real signed URL at send time, so individual templates
 * don't each need to thread the URL through their signatures.
 */
const UNSUB_PLACEHOLDER = "{{UNSUBSCRIBE_URL}}";

function buildUnsubscribeUrl(
  uid: string,
  category: UnsubscribeCategory
): string {
  const token = makeUnsubscribeToken(uid, category);
  return `${APP_URL}/unsubscribe?token=${encodeURIComponent(token)}`;
}

function substituteUnsub(body: string, url: string): string {
  return body.split(UNSUB_PLACEHOLDER).join(url);
}

/**
 * Preference-gated email send (Phase 3).
 *
 * Every NON-transactional email must go through this. It:
 *   1. checks canSendEmail() and silently skips if the user opted out,
 *   2. mints a signed unsubscribe token scoped to (uid, category),
 *   3. substitutes the {{UNSUBSCRIBE_URL}} placeholder in the rendered
 *      html/text with the real link,
 *   4. delegates to sendEmailOrLog (same dev-log / Resend behavior as
 *      every other send path).
 *
 * Transactional email (password reset, verification, billing, security)
 * must NOT use this — it uses sendEmailOrLog directly, and per the locked-in
 * decision (option a) those templates hide the unsubscribe link entirely
 * rather than rendering a non-functional one.
 *
 * `htmlBuilder` / `textBuilder` receive the resolved unsubscribe URL so
 * future templates can place it explicitly; existing Phase 2 templates can
 * ignore the argument and rely on placeholder substitution instead.
 */
export async function sendEmailWithPreferences(params: {
  user: Pick<UserDoc, "uid" | "email" | "emailPreferences">;
  category: OptOutCategory;
  subject: string;
  htmlBuilder: (unsubscribeUrl: string) => string;
  textBuilder?: (unsubscribeUrl: string) => string;
  fromVariant?: FromVariant;
  replyTo?: string;
}): Promise<EmailSendResult> {
  const { user, category, subject, htmlBuilder, textBuilder } = params;

  if (!user.email) {
    return { sent: false, reason: "no-email" };
  }

  if (!canSendEmail(user as UserDoc, category)) {
    console.log(
      `[email] Skipping ${category} email for ${user.email} (preference off)`
    );
    return { sent: false, reason: "preference-off" };
  }

  const unsubscribeUrl = buildUnsubscribeUrl(user.uid, category);

  const html = substituteUnsub(htmlBuilder(unsubscribeUrl), unsubscribeUrl);
  const text = textBuilder
    ? substituteUnsub(textBuilder(unsubscribeUrl), unsubscribeUrl)
    : undefined;

  try {
    await sendEmailOrLog({
      to: user.email,
      subject,
      html,
      text,
      fromVariant: params.fromVariant,
      replyTo: params.replyTo,
    });
    return { sent: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.error(`[email] send failed for ${user.email} (${category}):`, err);
    return { sent: false, reason };
  }
}

/**
 * Convenience overload for callers that only have a uid (e.g. cron / webhook
 * paths). Loads the user doc, then delegates. Returns { sent:false } if the
 * user is missing.
 */
export async function sendEmailWithPreferencesByUid(params: {
  uid: string;
  category: OptOutCategory;
  subject: string;
  htmlBuilder: (unsubscribeUrl: string) => string;
  textBuilder?: (unsubscribeUrl: string) => string;
  fromVariant?: FromVariant;
  replyTo?: string;
}): Promise<EmailSendResult> {
  const user = await getUserByIdRepo(params.uid);
  if (!user) {
    return { sent: false, reason: "user-not-found" };
  }
  return sendEmailWithPreferences({ ...params, user });
}
