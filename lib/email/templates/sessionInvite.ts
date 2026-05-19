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

interface SessionInviteProps {
  invitedByName: string;
  sessionName: string;
  /** Kept for signature stability — callers still pass it; new copy doesn't surface the workspace. */
  workspaceName: string;
  /** Kept for signature stability — callers still pass it; new copy doesn't surface access level. */
  accessLevel: "view" | "resolve";
  sessionUrl: string;
  requiresAccount?: boolean;
  /**
   * Phase-5 optional: the inviter's email, shown in parens after their name.
   * Callers don't pass this yet; copy degrades to name-only when absent.
   */
  invitedByEmail?: string;
}

function accountLine(requiresAccount: boolean): string {
  return requiresAccount
    ? "You'll need a free Annote account to view it (takes ten seconds)."
    : "You don't need an account to view it. The link opens straight to the session.";
}

export function sessionInviteEmailHtml({
  invitedByName,
  sessionName,
  sessionUrl,
  requiresAccount = false,
  invitedByEmail,
}: SessionInviteProps): string {
  const safeInviter = escapeEmailHtml(invitedByName);
  const safeSession = escapeEmailHtml(sessionName);
  const inviterWithEmail = invitedByEmail
    ? `${safeInviter} (${escapeEmailHtml(invitedByEmail)})`
    : safeInviter;

  return emailShellV2({
    preheader: requiresAccount
      ? "Click to open — free account required."
      : "Click to open — no account needed.",
    content: emailCardV2({
      content: `
        ${emailHeadingV2(`${safeInviter} shared an Annote session with you`)}
        ${emailParagraphV2(
          `${inviterWithEmail} shared a session with you on Annote: &ldquo;${safeSession}.&rdquo;`
        )}
        ${emailParagraphV2(
          `Annote is a tool for capturing feedback on websites. ${safeInviter} recorded their thoughts directly on the pages in question, and the session below collects them as tickets — screenshots, voice notes, and context, all in one place.`
        )}
        ${emailParagraphV2(accountLine(requiresAccount))}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(emailButtonV2({ label: "Open the session", href: sessionUrl }))}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          `If anything looks off or you'd rather not receive these, you can let ${safeInviter} know directly — this came from them, not from a list.`,
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function sessionInviteEmailText({
  invitedByName,
  sessionName,
  sessionUrl,
  requiresAccount = false,
  invitedByEmail,
}: SessionInviteProps): string {
  const inviterWithEmail = invitedByEmail
    ? `${invitedByName} (${invitedByEmail})`
    : invitedByName;

  return plainTextShellV2({
    body: `${inviterWithEmail} shared a session with you on Annote: "${sessionName}."

Annote is a tool for capturing feedback on websites. ${invitedByName} recorded their thoughts directly on the pages in question, and the session below collects them as tickets — screenshots, voice notes, and context, all in one place.

${accountLine(requiresAccount)}

Open the session: ${sessionUrl}

If anything looks off or you'd rather not receive these, you can let ${invitedByName} know directly — this came from them, not from a list.

— Annote`,
  });
}
