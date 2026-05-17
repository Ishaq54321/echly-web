import { emailShell, emailButton, emailInfoRow, emailColors, plainTextShell } from "../components";

interface SubscriptionConfirmationProps {
  workspaceName: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  nextBillingDate: Date;
  settingsUrl: string;
  /** Monthly price per seat — from catalog, no hardcoded fallback. */
  pricePerSeat: number;
  /** Annual price per seat (monthly equivalent) — from catalog, no hardcoded fallback. */
  annualPricePerSeat: number;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function subscriptionConfirmationEmailHtml(props: SubscriptionConfirmationProps): string {
  const { workspaceName, seatCount, billingCycle, nextBillingDate, settingsUrl, pricePerSeat, annualPricePerSeat } = props;

  const isAnnual = billingCycle === "annual";
  const seatLabel = seatCount === 1 ? "seat" : "seats";

  const monthlyTotal = seatCount * pricePerSeat;
  const annualTotal = seatCount * annualPricePerSeat * 12;

  const billingLine = isAnnual
    ? `${seatCount} ${seatLabel} × $${annualPricePerSeat.toFixed(2)}/seat per month, billed annually`
    : `${seatCount} ${seatLabel} × $${pricePerSeat}/seat per month`;

  const totalLine = isAnnual
    ? `$${annualTotal.toFixed(2)}/year`
    : `$${monthlyTotal.toFixed(2)}/month`;

  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;">
      You're on Business
    </h1>

    <p style="margin:0 0 24px;">
      Your workspace <strong style="color:${emailColors.textHeading};">${workspaceName}</strong> is now on Business. You've unlocked unlimited team members, 1,500 AI improvements a month, and unlimited feedback tickets.
    </p>

    <div style="background-color:${emailColors.surfaceSubtle};border:1px solid ${emailColors.border};border-radius:8px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:${emailColors.textMuted};text-transform:uppercase;letter-spacing:0.05em;">
        What you're paying
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        ${emailInfoRow("Billing", billingLine)}
        ${emailInfoRow("Total", totalLine)}
        ${emailInfoRow("Next charge", formatDate(nextBillingDate))}
      </table>
    </div>

    <p style="margin:0 0 24px;font-size:13px;color:${emailColors.textMuted};">
      Paddle will send a receipt for each charge separately.
    </p>

    ${emailButton("Open billing settings", settingsUrl)}

    <p style="margin:24px 0 0;">
      If anything looks off, just reply to this email.
    </p>

    <p style="margin:24px 0 0;color:${emailColors.textMuted};">
      — Ishaq, Annote
    </p>
  `;

  return emailShell(body, {
    preheader: `Your workspace ${workspaceName} is now on Business.`,
  });
}

export function subscriptionConfirmationEmailText(props: SubscriptionConfirmationProps): string {
  const { workspaceName, seatCount, billingCycle, nextBillingDate, settingsUrl, pricePerSeat, annualPricePerSeat } = props;

  const isAnnual = billingCycle === "annual";
  const seatLabel = seatCount === 1 ? "seat" : "seats";
  const monthlyTotal = seatCount * pricePerSeat;
  const annualTotal = seatCount * annualPricePerSeat * 12;

  const billingLine = isAnnual
    ? `${seatCount} ${seatLabel} × $${annualPricePerSeat.toFixed(2)}/seat per month, billed annually`
    : `${seatCount} ${seatLabel} × $${pricePerSeat}/seat per month`;

  const totalLine = isAnnual
    ? `$${annualTotal.toFixed(2)}/year`
    : `$${monthlyTotal.toFixed(2)}/month`;

  return plainTextShell(`You're on Business

Your workspace ${workspaceName} is now on Business. You've unlocked unlimited team members, 1,500 AI improvements a month, and unlimited feedback tickets.

What you're paying
${billingLine}
Total: ${totalLine}
Next charge: ${formatDate(nextBillingDate)}

Paddle will send a receipt for each charge separately.

Open billing settings: ${settingsUrl}

If anything looks off, just reply to this email.

— Ishaq, Annote`);
}
