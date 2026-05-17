import { emailShell, emailButton, emailColors, plainTextShell } from "../components";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface AccessRequestResultProps {
  approved: boolean;
  sessionName: string;
  sessionUrl: string;
  workspaceName: string;
}

export function accessRequestResultEmailHtml({
  approved,
  sessionName,
  sessionUrl,
  workspaceName,
}: AccessRequestResultProps): string {
  if (approved) {
    const body = `
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;line-height:1.3;">
        Access granted
      </h1>
      <p style="margin:0 0 8px;">
        Your request to access <strong style="color:${emailColors.textHeading};">${escapeHtml(sessionName)}</strong> has been approved. You can now view and resolve feedback.
      </p>
      ${emailButton("Open session", escapeHtml(sessionUrl))}
      <p style="margin:0;font-size:13px;color:${emailColors.textMuted};">
        ${escapeHtml(workspaceName)}
      </p>
    `;

    return emailShell(body, {
      preheader: `You now have access to ${sessionName}.`,
    });
  }

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;line-height:1.3;">
      Request not approved
    </h1>
    <p style="margin:0 0 8px;">
      Your request to access <strong style="color:${emailColors.textHeading};">${escapeHtml(sessionName)}</strong> was not approved. Reach out to the session owner if you think this was a mistake.
    </p>
    <p style="margin:0;font-size:13px;color:${emailColors.textMuted};">
      ${escapeHtml(workspaceName)}
    </p>
  `;

  return emailShell(body, {
    preheader: `Access request for ${sessionName}.`,
  });
}

export function accessRequestResultEmailText({
  approved,
  sessionName,
  sessionUrl,
  workspaceName,
}: AccessRequestResultProps): string {
  if (approved) {
    return plainTextShell(`Access granted

Your request to access ${sessionName} has been approved. You can now view and resolve feedback.

Open session: ${sessionUrl}

${workspaceName}`);
  }

  return plainTextShell(`Request not approved

Your request to access ${sessionName} was not approved. Reach out to the session owner if you think this was a mistake.

${workspaceName}`);
}
