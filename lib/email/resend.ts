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

const DEV_LOG_FORCED = process.env.EMAIL_DEV_LOG === "true";

function extractFirstUrl(html: string): string | null {
  const m = html.match(/href="(https?:\/\/[^"]+)"/);
  return m?.[1] ?? null;
}

// Dev/localhost fallback: log email to console.
// Logs when no API key is configured OR when EMAIL_DEV_LOG=true is set.
// With API key set and EMAIL_DEV_LOG unset, real emails are sent (even in dev).
export async function sendEmailOrLog(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend || DEV_LOG_FORCED || process.env.NODE_ENV === "development") {
    const link = extractFirstUrl(params.html);
    console.log(
      `\n📧 [DEV EMAIL — not sent]\n` +
      `   To:      ${params.to}\n` +
      `   Subject: ${params.subject}\n` +
      (link ? `   🔗 Link: ${link}\n` : `   (no link found in body)\n`)
    );
    return;
  }
  const { error } = await resend.emails.send({
    from: "Echly <noreply@echly.com>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  if (error) {
    console.error("[Resend] send failed", { to: params.to, subject: params.subject, error });
    throw new Error(`Email send failed: ${error.message ?? "unknown"}`);
  }
}
