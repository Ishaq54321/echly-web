function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function accessRequestResultEmailHtml({
  approved,
  sessionName,
  sessionUrl,
  workspaceName,
}: {
  approved: boolean;
  sessionName: string;
  sessionUrl: string;
  workspaceName: string;
}): string {
  if (approved) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You now have access to ${escapeHtml(sessionName)}</title>
</head>
<body style="margin:0;padding:0;background:#F8F8F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
          <tr>
            <td style="background:#1775E0;padding:28px 40px;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">Echly</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1C1917;line-height:1.3;">
                Access granted
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#78716C;">
                Your request to access <strong style="color:#1C1917;">${escapeHtml(sessionName)}</strong> has been approved. You can now view and resolve feedback.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td>
                    <a href="${escapeHtml(sessionUrl)}"
                       style="display:inline-block;padding:14px 28px;background:#1775E0;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Open session
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#A8A29E;">
                ${escapeHtml(workspaceName)}
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Access request for ${escapeHtml(sessionName)}</title>
</head>
<body style="margin:0;padding:0;background:#F8F8F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
          <tr>
            <td style="background:#1775E0;padding:28px 40px;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">Echly</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1C1917;line-height:1.3;">
                Request not approved
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#78716C;">
                Your request to access <strong style="color:#1C1917;">${escapeHtml(sessionName)}</strong> was not approved. Reach out to the session owner if you think this was a mistake.
              </p>
              <p style="margin:0;font-size:13px;color:#A8A29E;">
                ${escapeHtml(workspaceName)}
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
