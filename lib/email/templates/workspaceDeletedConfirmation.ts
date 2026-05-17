import { emailShell, emailColors, plainTextShell } from "../components";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface WorkspaceDeletedConfirmationProps {
  workspaceName: string;
  purgeDate: string;
}

export function workspaceDeletedConfirmationHtml({
  workspaceName,
  purgeDate,
}: WorkspaceDeletedConfirmationProps): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;line-height:1.3;">
      Your workspace <em>${escapeHtml(workspaceName)}</em> is scheduled for deletion
    </h1>
    <p style="margin:0 0 16px;">
      Your workspace will be permanently deleted on <strong style="color:${emailColors.textHeading};">${escapeHtml(purgeDate)}</strong>.
    </p>
    <p style="margin:0 0 8px;">
      All sessions, feedback, and members will be permanently removed. To cancel, reply to this email or contact support within 30 days.
    </p>
    <p style="margin:0;font-size:13px;color:${emailColors.textMuted};">
      If you did not request this deletion, please contact support immediately.
    </p>
  `;

  return emailShell(body, {
    preheader: `${workspaceName} will be permanently deleted on ${purgeDate}.`,
  });
}

export function workspaceDeletedConfirmationText({
  workspaceName,
  purgeDate,
}: WorkspaceDeletedConfirmationProps): string {
  return plainTextShell(`Your workspace ${workspaceName} is scheduled for deletion

Your workspace will be permanently deleted on ${purgeDate}.

All sessions, feedback, and members will be permanently removed. To cancel, reply to this email or contact support within 30 days.

If you did not request this deletion, please contact support immediately.`);
}
