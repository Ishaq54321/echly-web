export function workspaceDeletedConfirmationHtml({
  workspaceName,
  purgeDate,
}: {
  workspaceName: string;
  purgeDate: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your workspace has been scheduled for deletion</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
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
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;line-height:1.3;">
                Your workspace <em>${escapeHtml(workspaceName)}</em> has been scheduled for deletion
              </h1>
              <p style="margin:0 0 16px;font-size:15px;color:#6b7280;">
                Your workspace will be permanently deleted on <strong>${escapeHtml(purgeDate)}</strong>.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
                All sessions, feedback, and members will be permanently removed.
                To cancel, reply to this email or contact support within 30 days.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                If you did not request this deletion, please contact support immediately.
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
