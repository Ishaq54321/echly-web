import { emailShell, emailButton, emailColors, plainTextShell } from "../components";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface WorkspaceInviteProps {
  invitedByName: string;
  workspaceName: string;
  role: string;
  acceptUrl: string;
  expiresInDays: number;
}

export function workspaceInviteEmailHtml({
  invitedByName,
  workspaceName,
  role,
  acceptUrl,
  expiresInDays,
}: WorkspaceInviteProps): string {
  const roleLabel = role === "OWNER" ? "Owner" : "Member";

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;line-height:1.3;">
      ${escapeHtml(invitedByName)} invited you to join ${escapeHtml(workspaceName)}
    </h1>
    <p style="margin:0 0 8px;">
      You'll join as <strong style="color:${emailColors.textHeading};">${escapeHtml(roleLabel)}</strong>.
    </p>
    ${emailButton("Accept invitation", acceptUrl)}
    <p style="margin:0;font-size:13px;color:${emailColors.textMuted};">
      This invitation expires in ${expiresInDays} days. If you didn't expect this invitation, you can safely ignore this email.
    </p>
  `;

  return emailShell(body, {
    preheader: `${invitedByName} invited you to join ${workspaceName}.`,
  });
}

export function workspaceInviteEmailText({
  invitedByName,
  workspaceName,
  role,
  acceptUrl,
  expiresInDays,
}: WorkspaceInviteProps): string {
  const roleLabel = role === "OWNER" ? "Owner" : "Member";

  return plainTextShell(`${invitedByName} invited you to join ${workspaceName}

You'll join as ${roleLabel}.

Accept invitation: ${acceptUrl}

This invitation expires in ${expiresInDays} days. If you didn't expect this invitation, you can safely ignore this email.`);
}
