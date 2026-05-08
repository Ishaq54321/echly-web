export function workspaceInviteEmailHtml({
  invitedByName,
  workspaceName,
  role,
  acceptUrl,
  expiresInDays,
}: {
  invitedByName: string;
  workspaceName: string;
  role: string;
  acceptUrl: string;
  expiresInDays: number;
}): string {
  const roleLabel = role === "OWNER" ? "Owner" : "Member";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to join ${workspaceName}</title>
</head>
<body style="margin:0;padding:0;background:#F8F8F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
          <tr>
            <td style="background:#5A49BF;padding:28px 40px;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">Annote</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#15101F;line-height:1.3;">
                ${escapeHtml(invitedByName)} invited you to join ${escapeHtml(workspaceName)}
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#54495F;">
                You'll join as <strong>${escapeHtml(roleLabel)}</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td>
                    <a href="${acceptUrl}"
                       style="display:inline-block;padding:14px 28px;background:#5A49BF;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Accept invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#8A8096;">
                This invitation expires in ${expiresInDays} days.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #FAFAF7;">
              <p style="margin:0;font-size:13px;color:#8A8096;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
