export function emailChangeEmailHtml({
  newEmail,
  confirmUrl,
  userName,
}: {
  newEmail: string;
  confirmUrl: string;
  userName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Confirm your new email address</title>
</head>
<body style="margin:0;padding:0;background:#F8F8F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F8;padding:40px 0;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr>
        <td style="padding:28px 36px 24px;border-bottom:1px solid #FAFAF7;">
          <span style="font-size:22px;font-weight:700;color:#5A49BF;letter-spacing:-0.3px;">Annote</span>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:36px 36px 28px;">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#15101F;letter-spacing:-0.3px;">Confirm your email change</h1>
          <p style="margin:0 0 12px;font-size:15px;color:#54495F;line-height:1.6;">
            Hi ${userName}, you requested to change your email address to <strong>${newEmail}</strong>. Click the button below to confirm this change.
          </p>
          <p style="margin:0 0 28px;font-size:14px;color:#8A8096;line-height:1.6;padding:14px 16px;background:#FFEDD5;border-radius:8px;border-left:3px solid #F77E2C;">
            If you didn't request this change, you can safely ignore this email. Your current email address will remain unchanged.
          </p>
          <a href="${confirmUrl}" style="display:inline-block;background:#5A49BF;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:10px;letter-spacing:0.1px;">
            Confirm new email
          </a>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:20px 36px 28px;border-top:1px solid #FAFAF7;">
          <p style="margin:0 0 4px;font-size:13px;color:#8A8096;">This link expires in 24 hours.</p>
          <p style="margin:0;font-size:13px;color:#B5AEBE;">© Annote — Agency feedback made simple</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
