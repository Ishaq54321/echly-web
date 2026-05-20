import {
  emailShellV2,
  emailCardV2,
  emailParagraphV2,
  emailSignoffV2,
  escapeEmailHtml,
  plainTextShellV2,
  EMAIL_COLORS,
} from "../components";

interface MemberRemovedProps {
  removedFirstName: string;
  workspaceName: string;
  removerName: string;
  dashboardUrl: string;
}

export function memberRemovedSubject(workspaceName: string): string {
  return `You've been removed from ${workspaceName}`;
}

export function memberRemovedEmailHtml({
  removedFirstName,
  workspaceName,
  removerName,
  dashboardUrl,
}: MemberRemovedProps): string {
  const safeFirst = escapeEmailHtml(removedFirstName);
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safeRemover = escapeEmailHtml(removerName);

  const secondaryLink = `<tr><td style="padding:8px 0 0 0;font-size:14px;color:${EMAIL_COLORS.textSecondary};line-height:1.5;">If you have your own workspace, you can keep working there — <a href="${dashboardUrl}" style="color:${EMAIL_COLORS.linkColor};text-decoration:underline;">open dashboard</a>.</td></tr>`;

  return emailShellV2({
    preheader: `${removerName} removed you from ${workspaceName}.`,
    category: "Workspace update",
    title: `You've been removed from ${workspaceName}`,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${safeFirst},`)}
        ${emailParagraphV2(
          `You've been removed from &ldquo;${safeWorkspace}&rdquo; by ${safeRemover}. You no longer have access to the workspace's captures, tickets, or members.`
        )}
        ${emailParagraphV2(
          `If this was unexpected, contact ${safeRemover} or the workspace owner directly.`
        )}
        ${secondaryLink}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function memberRemovedEmailText({
  removedFirstName,
  workspaceName,
  removerName,
  dashboardUrl,
}: MemberRemovedProps): string {
  return plainTextShellV2({
    body: `Hey ${removedFirstName},

You've been removed from "${workspaceName}" by ${removerName}. You no longer have access to the workspace's captures, tickets, or members.

If this was unexpected, contact ${removerName} or the workspace owner directly.

If you have your own workspace, you can keep working there: ${dashboardUrl}

— Annote`,
  });
}
