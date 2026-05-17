import { emailShell, emailButton, emailColors, plainTextShell } from "../components";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface AccessRequestNotificationProps {
  requesterEmail: string;
  sessionName: string;
  sessionUrl: string;
  workspaceName: string;
}

export function accessRequestNotificationEmailHtml({
  requesterEmail,
  sessionName,
  sessionUrl,
  workspaceName,
}: AccessRequestNotificationProps): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;line-height:1.3;">
      New access request
    </h1>
    <p style="margin:0 0 8px;">
      <strong style="color:${emailColors.textHeading};">${escapeHtml(requesterEmail)}</strong> is requesting access to view the session <strong style="color:${emailColors.textHeading};">${escapeHtml(sessionName)}</strong>.
    </p>
    ${emailButton("Review request", escapeHtml(sessionUrl))}
    <p style="margin:0;font-size:13px;color:${emailColors.textMuted};">
      Open the session and use the Share menu to approve or reject this request. ${escapeHtml(workspaceName)}
    </p>
  `;

  return emailShell(body, {
    preheader: `${requesterEmail} requested access to ${sessionName}.`,
  });
}

export function accessRequestNotificationEmailText({
  requesterEmail,
  sessionName,
  sessionUrl,
  workspaceName,
}: AccessRequestNotificationProps): string {
  return plainTextShell(`New access request

${requesterEmail} is requesting access to view the session ${sessionName}.

Review request: ${sessionUrl}

Open the session and use the Share menu to approve or reject this request. ${workspaceName}`);
}
