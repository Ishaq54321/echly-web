import { emailShell, emailButton, emailColors, plainTextShell } from "../components";

interface PaymentFailedProps {
  workspaceName: string;
  portalUrl: string;
}

export function paymentFailedEmailHtml(props: PaymentFailedProps): string {
  const { workspaceName, portalUrl } = props;

  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;">
      We couldn't charge your card
    </h1>

    <p style="margin:0 0 16px;">
      Your latest payment for <strong style="color:${emailColors.textHeading};">${workspaceName}</strong> didn't go through. This usually means the card has expired or hit its limit.
    </p>

    <p style="margin:0 0 24px;">
      No rush — we'll try again over the next few days. To skip the wait, update your payment method now.
    </p>

    ${emailButton("Update payment method", portalUrl)}

    <p style="margin:24px 0 0;font-size:13px;color:${emailColors.textMuted};">
      If we can't process payment after a few attempts, your workspace will move to the Starter plan. Just reply to this email if you run into anything.
    </p>

    <p style="margin:24px 0 0;color:${emailColors.textMuted};">
      — Ishaq, Annote
    </p>
  `;

  return emailShell(body, {
    preheader: `Update your payment method for ${workspaceName}.`,
  });
}

export function paymentFailedEmailText(props: PaymentFailedProps): string {
  const { workspaceName, portalUrl } = props;

  return plainTextShell(`We couldn't charge your card

Your latest payment for ${workspaceName} didn't go through. This usually means the card has expired or hit its limit.

No rush — we'll try again over the next few days. To skip the wait, update your payment method now.

Update payment method: ${portalUrl}

If we can't process payment after a few attempts, your workspace will move to the Starter plan. Just reply to this email if you run into anything.

— Ishaq, Annote`);
}
