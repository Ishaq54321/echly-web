import { emailShell, emailButton, emailColors, plainTextShell } from "../components";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;line-height:1.3;">
      Your invitation to ${escapeHtml(workspaceName)} expires in ${expiresInDays} days
    </h1>
    <p style="margin:0 0 8px;">
      Accept your invitation before it expires to join the workspace.
    </p>
    ${emailButton("Accept invitation", acceptUrl)}
    <p style="margin:0;font-size:13px;color:${emailColors.textMuted};">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
  `;

  return emailShell(body, {
    preheader: `Your invitation to ${workspaceName} expires in ${expiresInDays} days.`,
  });
}

export function workspaceInviteReminderText({
  workspaceName,
  acceptUrl,
  expiresInDays,
}: WorkspaceInviteReminderProps): string {
  return plainTextShell(`Your invitation to ${workspaceName} expires in ${expiresInDays} days

Accept your invitation before it expires to join the workspace.

Accept invitation: ${acceptUrl}

If you didn't expect this invitation, you can safely ignore this email.`);
}
