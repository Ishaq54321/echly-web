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

// Dev/localhost fallback: log email to console
export async function sendEmailOrLog(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend || process.env.NODE_ENV === "development") {
    console.log(
      "\n📧 [DEV EMAIL — not sent]\n" +
      `To: ${params.to}\n` +
      `Subject: ${params.subject}\n` +
      `Preview: ${params.html.slice(0, 200)}...\n`
    );
    const urlMatch = params.html.match(/href="(http[^"]*\/invite\/[^"]+)"/);
    if (urlMatch?.[1]) {
      console.log(`🔗 [DEV INVITE LINK] ${urlMatch[1]}\n`);
    }
    return;
  }
  await resend.emails.send({
    from: "Echly <noreply@echly.com>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
