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

/**
 * From-address variants.
 * - "system"  — transactional/system email (password reset, verification,
 *   invites, access requests). Impersonal sender so it reads as automated,
 *   but the mailbox is monitored so replies still reach a human.
 * - "founder" — lifecycle/billing email written in the founder's voice
 *   (subscription confirmation/cancellation, payment failed, workspace
 *   deletion, welcome). Sender carries the founder name so replies feel
 *   personal.
 *
 * Both addresses are real Google Workspace mailboxes that route into the
 * same inbox; replies follow the From header naturally (we no longer override
 * Reply-To), so a recipient who hits "Reply" lands where they expect.
 */
export type FromVariant = "system" | "founder";

function getFromAddress(variant: FromVariant = "system"): string {
  return variant === "founder"
    ? "Ishaq from Annote <ishaq@annote.ai>"
    : "Annote <hello@annote.ai>";
}

// Resend's tracking (open + click) is configured at the domain level in the
// Resend dashboard, not per-send via the SDK. The CreateEmailOptions surface
// in resend@^6 does NOT expose `tracking` / `open_tracking` / `click_tracking`
// fields. Click tracking is intentionally routed through the verified
// `links.annote.ai` subdomain so rewritten URLs match the sending domain;
// open tracking is intentionally off (pixel tracking is a spam signal and
// produces unreliable data due to Apple Mail Privacy Protection). Do not
// turn open tracking on in the dashboard.

/** Resend tag values must match /^[A-Za-z0-9_-]+$/. Strip everything else. */
function sanitizeTagValue(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 256);
}

export async function sendEmailOrLog(params: {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative — sent alongside html for deliverability + accessibility. */
  text?: string;
  /**
   * Reply-to override. Unset by default; Resend falls back to the From header,
   * which is the natural behavior we want (replies land in the same mailbox
   * the email came from). Pass an explicit value only when a single email
   * needs to route replies somewhere else.
   */
  replyTo?: string;
  /**
   * Which from-name to send under. Defaults to "system" (transactional).
   * Lifecycle/billing emails pass "founder".
   */
  fromVariant?: FromVariant;
  /**
   * Real, signed unsubscribe URL for preference-gated mail. When present, the
   * email is treated as a bulk/lifecycle send: the shell footer renders an
   * "Unsubscribe" link and the message carries `List-Unsubscribe` +
   * `List-Unsubscribe-Post` headers (Gmail/Yahoo Feb-2024 bulk-sender rules).
   *
   * Transactional callers (password reset, billing, workspace invites) leave
   * this undefined — those emails are exempt from unsubscribe requirements
   * (CAN-SPAM transactional carve-out) and matching how Stripe/Linear/Notion
   * handle transactional mail.
   */
  unsubscribeUrl?: string;
  /**
   * Resend dashboard tag — emitted as `tags: [{ name: "template", value }]`
   * so we can filter sends by template family in the Resend Logs UI. Every
   * dispatcher passes a stable camelCase identifier (e.g. "newComment",
   * "renewalReceipt") matching the audit's template names. Resend tag values
   * are limited to [A-Za-z0-9_-]; values are sanitized defensively.
   */
  templateName?: string;
  /**
   * Optional second tag for coarse filtering: "transactional" | "lifecycle" |
   * "notifications". Mirrors lib/email/preferences.ts categories.
   */
  templateCategory?: string;
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

  const headers: Record<string, string> = {};
  if (params.unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${params.unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  const tags: Array<{ name: string; value: string }> = [];
  if (params.templateName) {
    tags.push({ name: "template", value: sanitizeTagValue(params.templateName) });
  }
  if (params.templateCategory) {
    tags.push({ name: "category", value: sanitizeTagValue(params.templateCategory) });
  }

  const { error } = await resend.emails.send({
    from: getFromAddress(params.fromVariant),
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: params.replyTo,
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
    ...(tags.length > 0 ? { tags } : {}),
  });
  if (error) {
    console.error("[Resend] send failed", { to: params.to, subject: params.subject, error });
    throw new Error(`Email send failed: ${error.message ?? "unknown"}`);
  }
}
