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

interface WorkspaceInviteProps {
  invitedByName: string;
  workspaceName: string;
  /** Kept for signature stability — callers still pass it; new copy doesn't surface the role. */
  role: string;
  acceptUrl: string;
  expiresInDays: number;
}

export function workspaceInviteEmailHtml({
  invitedByName,
  workspaceName,
  acceptUrl,
  expiresInDays,
}: WorkspaceInviteProps): string {
  const safeInviter = escapeEmailHtml(invitedByName);
  const safeWorkspace = escapeEmailHtml(workspaceName);

  return emailShellV2({
    preheader: "One click to join. No password setup required.",
    content: emailCardV2({
      content: `
        ${emailHeadingV2(`${safeInviter} invited you to ${safeWorkspace}`)}
        ${emailParagraphV2(
          `${safeInviter} invited you to join their workspace on Annote: <strong>${safeWorkspace}</strong>.`
        )}
        ${emailParagraphV2(
          "A workspace is the shared home for your team's feedback in Annote — captures, sessions, comments, and resolved tickets, all in one place. Once you're in, you can capture on any site, see what your teammates are working on, and reply to anything in their sessions."
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(emailButtonV2({ label: `Join ${safeWorkspace}`, href: acceptUrl }))}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          `If you weren't expecting this, you can ignore the email. The invite expires in ${expiresInDays} days.`,
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function workspaceInviteEmailText({
  invitedByName,
  workspaceName,
  acceptUrl,
  expiresInDays,
}: WorkspaceInviteProps): string {
  return plainTextShellV2({
    body: `${invitedByName} invited you to join their workspace on Annote: ${workspaceName}.

A workspace is the shared home for your team's feedback in Annote — captures, sessions, comments, and resolved tickets, all in one place. Once you're in, you can capture on any site, see what your teammates are working on, and reply to anything in their sessions.

Join ${workspaceName}: ${acceptUrl}

If you weren't expecting this, you can ignore the email. The invite expires in ${expiresInDays} days.

— Annote`,
  });
}
