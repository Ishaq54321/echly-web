import {
  emailShellV2,
  emailCardV2,
  emailParagraphV2,
  emailSignoffV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface OwnershipTransferredOldProps {
  previousOwnerFirstName: string;
  workspaceName: string;
  newOwnerName: string;
  newOwnerEmail: string;
}

export function ownershipTransferredOldSubject(workspaceName: string): string {
  return `You're no longer the owner of ${workspaceName}`;
}

export function ownershipTransferredOldHtml({
  previousOwnerFirstName,
  workspaceName,
  newOwnerName,
  newOwnerEmail,
}: OwnershipTransferredOldProps): string {
  const safeFirst = escapeEmailHtml(previousOwnerFirstName);
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safeNewName = escapeEmailHtml(newOwnerName);
  const safeNewEmail = escapeEmailHtml(newOwnerEmail);

  return emailShellV2({
    preheader: `Ownership of ${workspaceName} transferred to ${newOwnerName}.`,
    category: "Workspace update",
    title: `You're no longer the owner of ${workspaceName}`,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${safeFirst},`)}
        ${emailParagraphV2(
          `Workspace ownership for &ldquo;${safeWorkspace}&rdquo; has been transferred to ${safeNewName} (${safeNewEmail}). They now control billing, member management, and workspace settings.`
        )}
        ${emailParagraphV2(`You're still a member of the workspace unless they remove you.`)}
        ${emailParagraphV2(
          `If you didn't initiate this transfer, contact ${safeNewName} immediately. If you can't reach them, reply to this email.`
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function ownershipTransferredOldText({
  previousOwnerFirstName,
  workspaceName,
  newOwnerName,
  newOwnerEmail,
}: OwnershipTransferredOldProps): string {
  return plainTextShellV2({
    body: `Hey ${previousOwnerFirstName},

Workspace ownership for "${workspaceName}" has been transferred to ${newOwnerName} (${newOwnerEmail}). They now control billing, member management, and workspace settings.

You're still a member of the workspace unless they remove you.

If you didn't initiate this transfer, contact ${newOwnerName} immediately. If you can't reach them, reply to this email.

— Annote`,
  });
}
