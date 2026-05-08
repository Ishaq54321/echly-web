export function subscriptionCancelledEmailHtml(params: {
  workspaceName: string;
  upgradeUrl: string;
}): string {
  const { workspaceName, upgradeUrl } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Your Annote Business subscription has ended</title>
</head>
<body style="margin:0;padding:0;background:#F8F8F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F8;padding:40px 0;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
      <tr>
        <td style="padding:28px 36px 24px;border-bottom:1px solid #FAFAF7;">
          <span style="font-size:22px;font-weight:700;color:#5A49BF;letter-spacing:-0.3px;">Annote</span>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 36px 28px;">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#15101F;letter-spacing:-0.3px;">Your Business subscription has ended</h1>
          <p style="margin:0 0 16px;font-size:15px;color:#54495F;line-height:1.6;">
            Your workspace <strong>${workspaceName}</strong> has been moved to the Starter (free) plan.
          </p>
          <div style="margin:0 0 20px;padding:16px;background:#FFEDD5;border-radius:10px;border-left:3px solid #F77E2C;">
            <p style="margin:0;font-size:14px;color:#9B573E;line-height:1.5;">
              Your feedback tickets are now limited to 50 per month and you can have up to 5 members. Unlimited feedback, sessions, and advanced features require a Business plan.
            </p>
          </div>
          <p style="margin:0 0 24px;font-size:15px;color:#54495F;line-height:1.6;">
            You can re-upgrade at any time to restore unlimited access.
          </p>
          <a href="${upgradeUrl}" style="display:inline-block;background:#5A49BF;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:13px 26px;border-radius:10px;">
            Re-upgrade to Business
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 36px 28px;border-top:1px solid #FAFAF7;">
          <p style="margin:0;font-size:13px;color:#B5AEBE;">© Annote — Agency feedback made simple</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
