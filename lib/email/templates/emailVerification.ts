export function emailVerificationHtml({
  verifyUrl,
  userName,
}: {
  verifyUrl: string;
  userName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Verify your email — Echly</title>
</head>
<body style="margin:0;padding:0;background:#F8F8F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F8;padding:40px 0;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr>
        <td style="padding:28px 36px 24px;border-bottom:1px solid #F0F1F3;">
          <span style="font-size:22px;font-weight:700;color:#1775E0;letter-spacing:-0.3px;">Echly</span>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:36px 36px 28px;">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111;letter-spacing:-0.3px;">Verify your email</h1>
          <p style="margin:0 0 12px;font-size:15px;color:#444;line-height:1.6;">
            Hi ${userName}, please verify your email to finish setting up your Echly account. Click the button below to continue.
          </p>
          <p style="margin:0 0 28px;font-size:14px;color:#777;line-height:1.6;">
            This link expires in 1 hour. If you didn't create an Echly account, you can safely ignore this email.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;background:#1775E0;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:10px;letter-spacing:0.1px;">
            Verify email
          </a>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:20px 36px 28px;border-top:1px solid #F0F1F3;">
          <p style="margin:0 0 4px;font-size:13px;color:#999;">This link expires in 1 hour.</p>
          <p style="margin:0;font-size:13px;color:#BBB;">© Echly — Agency feedback made simple</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
