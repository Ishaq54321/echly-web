import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailHeadingV2,
  emailParagraphV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface SessionOpenedProps {
  /**
   * The viewer who opened the session — their display name, or email when no
   * name is available (e.g. "Sarah" or "sarah@example.com"). Caller resolves
   * this via displayName() in lib/email/helpers.
   */
  recipientName: string;
  /** The shared session's name. */
  sessionName: string;
  /** Public URL to open the session. */
  sessionUrl: string;
}

/**
 * Subject line for this email. Exported so Phase-5 wiring and the dev preview
 * derive it from one place (the subject is dynamic on recipientName).
 */
export function sessionOpenedSubject(recipientName: string): string {
  return `${recipientName} just opened your session`;
}

export function sessionOpenedEmailHtml({
  recipientName,
  sessionName,
  sessionUrl,
}: SessionOpenedProps): string {
  const safeRecipient = escapeEmailHtml(recipientName);
  const safeSession = escapeEmailHtml(sessionName);

  return emailShellV2({
    preheader: `"${sessionName}" — opened a moment ago.`,
    content: emailCardV2({
      content: `
        ${emailHeadingV2(`${safeRecipient} just opened your session`)}
        ${emailParagraphV2(
          `${safeRecipient} just opened the session you shared: &ldquo;${safeSession}.&rdquo;`
        )}
        ${emailParagraphV2(
          "That's the moment Annote pays off — when the work you captured leaves your screen and lands on someone else's. Comments, replies, and resolutions will show up in your dashboard as they happen."
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "Open the session", href: sessionUrl })
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function sessionOpenedEmailText({
  recipientName,
  sessionName,
  sessionUrl,
}: SessionOpenedProps): string {
  return plainTextShellV2({
    body: `${recipientName} just opened the session you shared: "${sessionName}."

That's the moment Annote pays off — when the work you captured leaves your screen and lands on someone else's. Comments, replies, and resolutions will show up in your dashboard as they happen.

Open the session: ${sessionUrl}

— Annote`,
  });
}
