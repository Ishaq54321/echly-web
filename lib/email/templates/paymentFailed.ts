export function paymentFailedEmailHtml(params: {
  workspaceName: string;
  portalUrl: string;
}): string {
  const { workspaceName, portalUrl } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Action needed: Payment failed for Annote</title>
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
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#15101F;letter-spacing:-0.3px;">Action needed: Payment failed</h1>
          <p style="margin:0 0 16px;font-size:15px;color:#54495F;line-height:1.6;">
            We were unable to process your payment for the Annote Business plan on <strong>${workspaceName}</strong>. This may be because your card has expired or has insufficient funds.
          </p>
          <div style="margin:0 0 20px;padding:16px;background:#FEF2F2;border-radius:10px;border-left:3px solid #E5484D;">
            <p style="margin:0;font-size:14px;color:var(--color-danger);line-height:1.5;">
              We'll retry your payment automatically. If payment continues to fail, your workspace will be downgraded to the free Starter plan. Please update your payment method to avoid any interruption.
            </p>
          </div>
          <a href="${portalUrl}" style="display:inline-block;background:#5A49BF;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:13px 26px;border-radius:10px;">
            Update Payment Method
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
