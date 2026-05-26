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
 * Preference-gated templates now thread `unsubscribeUrl` end-to-end:
 * dispatcher → htmlBuilder/textBuilder → template → emailShellV2 /
 * plainTextShellV2. The previous architecture relied on the shell defaulting
 * to a `{{UNSUBSCRIBE_URL}}` placeholder which this layer substituted at send
 * time; the placeholder default has been removed (transactional emails were
 * shipping it literally), so the URL must flow through as data.
 *
 * substituteUnsub is retained as a no-op safety net: if a template forgets to
 * forward the URL but happens to embed the legacy placeholder string in its
 * own markup, this still rewrites it. Modern templates render the URL
 * directly and the substitution finds nothing to replace.
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
  /** Resend dashboard tag (template family). See sendEmailOrLog. */
  templateName?: string;
  /** Optional second Resend tag for category-level filtering. */
  templateCategory?: string;
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
      unsubscribeUrl,
      templateName: params.templateName,
      templateCategory: params.templateCategory ?? category,
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
  templateName?: string;
  templateCategory?: string;
}): Promise<EmailSendResult> {
  const user = await getUserByIdRepo(params.uid);
  if (!user) {
    return { sent: false, reason: "user-not-found" };
  }
  return sendEmailWithPreferences({ ...params, user });
}
