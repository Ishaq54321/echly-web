import { emailShell, emailButton, emailColors, plainTextShell } from "../components";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface SessionInviteProps {
  invitedByName: string;
  sessionName: string;
  workspaceName: string;
  accessLevel: "view" | "resolve";
  sessionUrl: string;
  requiresAccount?: boolean;
}

export function sessionInviteEmailHtml({
  invitedByName,
  sessionName,
  workspaceName,
  accessLevel,
  sessionUrl,
  requiresAccount = false,
}: SessionInviteProps): string {
  const accessLabel =
    accessLevel === "resolve" ? "view and resolve feedback on" : "view feedback on";

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;line-height:1.3;">
      ${escapeHtml(invitedByName)} invited you to a session
    </h1>
    <p style="margin:0 0 4px;font-size:18px;font-weight:600;color:${emailColors.textHeading};">
      ${escapeHtml(sessionName)}
    </p>
    <p style="margin:0 0 8px;">
      You can ${escapeHtml(accessLabel)} this session.
    </p>
    ${emailButton("Open session", escapeHtml(sessionUrl))}
    ${
      requiresAccount
        ? `<p style="margin:0 0 8px;font-size:13px;color:${emailColors.textMuted};">You'll need to create a free account to access this session.</p>`
        : ""
    }
    <p style="margin:0;font-size:13px;color:${emailColors.textMuted};">
      This is a session in ${escapeHtml(workspaceName)}. If you didn't expect this invitation, you can safely ignore this email.
    </p>
  `;

  return emailShell(body, {
    preheader: `${invitedByName} invited you to view ${sessionName}.`,
  });
}

export function sessionInviteEmailText({
  invitedByName,
  sessionName,
  workspaceName,
  accessLevel,
  sessionUrl,
  requiresAccount = false,
}: SessionInviteProps): string {
  const accessLabel =
    accessLevel === "resolve" ? "view and resolve feedback on" : "view feedback on";

  return plainTextShell(`${invitedByName} invited you to a session

${sessionName}

You can ${accessLabel} this session.

Open session: ${sessionUrl}
${requiresAccount ? "\nYou'll need to create a free account to access this session.\n" : ""}
This is a session in ${workspaceName}. If you didn't expect this invitation, you can safely ignore this email.`);
}
