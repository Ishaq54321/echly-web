import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailParagraphV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface WorkspaceInviteReminderProps {
  workspaceName: string;
  acceptUrl: string;
  expiresInDays: number;
}

export function workspaceInviteReminderHtml({
  workspaceName,
  acceptUrl,
  expiresInDays,
}: WorkspaceInviteReminderProps): string {
  const safeWorkspace = escapeEmailHtml(workspaceName);

  const daysLabel = expiresInDays === 1 ? "1 day" : `${expiresInDays} days`;

  return emailShellV2({
    preheader: "Still time to join the workspace.",
    category: "Reminder",
    title: `Your invitation to '${workspaceName}' is still open`,
    metadata: `Expires in ${daysLabel}`,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(
          `Your invitation to join <strong>${safeWorkspace}</strong> on Annote expires in ${expiresInDays} days.`
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(emailButtonV2({ label: `Join ${safeWorkspace}`, href: acceptUrl }))}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          "If you've decided not to join, no action needed — the invite will expire automatically.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function workspaceInviteReminderText({
  workspaceName,
  acceptUrl,
  expiresInDays,
}: WorkspaceInviteReminderProps): string {
  return plainTextShellV2({
    body: `Your invitation to join ${workspaceName} on Annote expires in ${expiresInDays} days.

Join ${workspaceName}: ${acceptUrl}

If you've decided not to join, no action needed — the invite will expire automatically.

— Annote`,
  });
}
