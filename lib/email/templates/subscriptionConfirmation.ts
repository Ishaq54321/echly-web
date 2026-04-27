export function subscriptionConfirmationEmailHtml(params: {
  workspaceName: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  nextBillingDate: Date;
  settingsUrl: string;
}): string {
  const { workspaceName, seatCount, billingCycle, nextBillingDate, settingsUrl } = params;
  const pricePerSeat = billingCycle === "annual" ? 31.20 : 39;
  const total = (pricePerSeat * seatCount).toFixed(2);
  const cycle = "month";
  const billingNote = billingCycle === "annual" ? " (billed annually at $374.40/seat/year)" : "";
  const nextDate = nextBillingDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to Echly Business!</title>
</head>
<body style="margin:0;padding:0;background:#F8F8F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F8;padding:40px 0;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
      <tr>
        <td style="padding:28px 36px 24px;border-bottom:1px solid #F0F1F3;">
          <span style="font-size:22px;font-weight:700;color:#1775E0;letter-spacing:-0.3px;">Echly</span>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 36px 28px;">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111;letter-spacing:-0.3px;">Welcome to Echly Business!</h1>
          <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">
            Your workspace <strong>${workspaceName}</strong> has been upgraded to the Business plan. You now have access to unlimited feedback tickets, unlimited sessions, and all premium features.
          </p>
          <div style="margin:0 0 24px;padding:20px;background:#EBF4FF;border-radius:12px;border:1px solid #C3DFFE;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.5px;">Plan Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:14px;color:#666;padding:4px 0;">Plan</td>
                <td style="font-size:14px;color:#111;font-weight:600;text-align:right;">Business</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#666;padding:4px 0;">Seats</td>
                <td style="font-size:14px;color:#111;font-weight:600;text-align:right;">${seatCount} seat${seatCount !== 1 ? "s" : ""}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#666;padding:4px 0;">Billing</td>
                <td style="font-size:14px;color:#111;font-weight:600;text-align:right;">$${pricePerSeat}/seat/${cycle}${billingNote}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#666;padding:4px 0;">Total</td>
                <td style="font-size:14px;color:#111;font-weight:600;text-align:right;">$${total}/${cycle}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#666;padding:4px 0;">Next billing date</td>
                <td style="font-size:14px;color:#111;font-weight:600;text-align:right;">${nextDate}</td>
              </tr>
            </table>
          </div>
          <a href="${settingsUrl}" style="display:inline-block;background:#1775E0;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:13px 26px;border-radius:10px;">
            Go to Settings
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 36px 28px;border-top:1px solid #F0F1F3;">
          <p style="margin:0;font-size:13px;color:#BBB;">© Echly — Agency feedback made simple</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
