function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function accessRequestNotificationEmailHtml({
  requesterEmail,
  sessionName,
  sessionUrl,
  workspaceName,
}: {
  requesterEmail: string;
  sessionName: string;
  sessionUrl: string;
  workspaceName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(requesterEmail)} requested access to ${escapeHtml(sessionName)}</title>
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
                New access request
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#54495F;">
                <strong style="color:#15101F;">${escapeHtml(requesterEmail)}</strong> is requesting access to view the session <strong style="color:#15101F;">${escapeHtml(sessionName)}</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td>
                    <a href="${escapeHtml(sessionUrl)}"
                       style="display:inline-block;padding:14px 28px;background:#5A49BF;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Review request
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#8A8096;">
                Open the session and use the Share menu to approve or reject this request.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #FAFAF7;">
              <p style="margin:0;font-size:13px;color:#8A8096;">
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
