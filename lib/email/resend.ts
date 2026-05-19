import "server-only";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// WS-007 FIX: explicit guard + dev logging
if (!RESEND_API_KEY) {
  console.warn(
    "[Resend] RESEND_API_KEY is not set. " +
    "Emails will be logged to console in development."
  );
}

export const resend = RESEND_API_KEY
  ? new Resend(RESEND_API_KEY)
  : null;

function extractFirstUrl(html: string): string | null {
  const m = html.match(/href="(https?:\/\/[^"]+)"/);
  return m?.[1] ?? null;
}

/**
 * Email sender configuration.
 *
 * Behavior:
 * - If RESEND_API_KEY is unset, emails are logged to the console (never sent).
 * - If EMAIL_DEV_LOG=true (and NODE_ENV !== "production"), emails are logged
 *   to the console even when the API key is set. Useful for inspecting outgoing
 *   email content during development without sending real emails.
 * - Otherwise, emails are sent via Resend (including from localhost).
 *
 * EMAIL_DEV_LOG is ignored in production (NODE_ENV === "production") as a
 * safety guard against accidentally silencing production email.
 */
const REPLY_TO = "ishaq@annote.ai";

/**
 * From-address variants.
 * - "system"  — transactional/system email (password reset, verification,
 *   invites, access requests). Impersonal sender so it reads as automated.
 * - "founder" — lifecycle/billing email written in the founder's voice
 *   (subscription confirmation/cancellation, payment failed, workspace
 *   deletion). Sender carries the founder name so replies feel personal.
 */
export type FromVariant = "system" | "founder";

function getFromAddress(variant: FromVariant = "system"): string {
  const email = "noreply@annote.ai";
  return variant === "founder"
    ? `Ishaq from Annote <${email}>`
    : `Annote <${email}>`;
}

export async function sendEmailOrLog(params: {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative — sent alongside html for deliverability + accessibility. */
  text?: string;
  /** Reply-to override. Defaults to ishaq@annote.ai so replies reach a human. */
  replyTo?: string;
  /**
   * Which from-name to send under. Defaults to "system" (transactional).
   * Lifecycle/billing emails pass "founder".
   */
  fromVariant?: FromVariant;
}): Promise<void> {
  // Determine if we should log instead of sending.
  const isProduction = process.env.NODE_ENV === "production";
  const logModeRequested = process.env.EMAIL_DEV_LOG === "true";
  const shouldLogOnly = !resend || (logModeRequested && !isProduction);

  if (shouldLogOnly) {
    const link = extractFirstUrl(params.html);
    console.log(
      `\n📧 [DEV EMAIL — not sent]\n` +
      `   To:      ${params.to}\n` +
      `   Subject: ${params.subject}\n` +
      (link ? `   🔗 Link: ${link}\n` : `   (no link found in body)\n`)
    );
    return;
  }
  // Unreachable when resend is null (that implies shouldLogOnly above),
  // but this guard restores TypeScript's non-null narrowing for resend.
  if (!resend) return;
  const { error } = await resend.emails.send({
    from: getFromAddress(params.fromVariant),
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: params.replyTo ?? REPLY_TO,
  });
  if (error) {
    console.error("[Resend] send failed", { to: params.to, subject: params.subject, error });
    throw new Error(`Email send failed: ${error.message ?? "unknown"}`);
  }
}
