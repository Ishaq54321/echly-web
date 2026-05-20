import {
  emailShellV2,
  emailCardV2,
  emailParagraphV2,
  emailSignoffV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface WorkspaceDeletedMemberProps {
  memberFirstName: string;
  workspaceName: string;
  ownerName: string;
  /** Pre-formatted long-date string (e.g. "June 18, 2026"). */
  deletionDate: string;
}

export function workspaceDeletedMemberSubject(workspaceName: string): string {
  return `Workspace ${workspaceName} scheduled for deletion`;
}

export function workspaceDeletedMemberHtml({
  memberFirstName,
  workspaceName,
  ownerName,
  deletionDate,
}: WorkspaceDeletedMemberProps): string {
  const safeFirst = escapeEmailHtml(memberFirstName);
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safeOwner = escapeEmailHtml(ownerName);
  const safeDate = escapeEmailHtml(deletionDate);

  return emailShellV2({
    preheader: `${ownerName} scheduled ${workspaceName} for deletion on ${deletionDate}.`,
    category: "Workspace update",
    title: `Your workspace ${workspaceName} has been scheduled for deletion`,
    metadata: `Deletion: ${safeDate}`,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${safeFirst},`)}
        ${emailParagraphV2(
          `${safeOwner} has scheduled &ldquo;${safeWorkspace}&rdquo; for deletion. After ${safeDate}, the workspace and all its captures, tickets, and members will be permanently removed.`
        )}
        ${emailParagraphV2(
          `Until then, you can still access your work. After that, the workspace and its data are gone.`
        )}
        ${emailParagraphV2(
          `If you need to keep anything, export it before ${safeDate}.`
        )}
        ${emailParagraphV2(
          `If this was a mistake, contact ${safeOwner} — they can restore it before ${safeDate}.`
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function workspaceDeletedMemberText({
  memberFirstName,
  workspaceName,
  ownerName,
  deletionDate,
}: WorkspaceDeletedMemberProps): string {
  return plainTextShellV2({
    body: `Hey ${memberFirstName},

${ownerName} has scheduled "${workspaceName}" for deletion. After ${deletionDate}, the workspace and all its captures, tickets, and members will be permanently removed.

Until then, you can still access your work. After that, the workspace and its data are gone.

If you need to keep anything, export it before ${deletionDate}.

If this was a mistake, contact ${ownerName} — they can restore it before ${deletionDate}.

— Annote`,
  });
}
