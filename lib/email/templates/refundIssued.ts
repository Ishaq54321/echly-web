import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailParagraphV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface RefundIssuedProps {
  ownerFirstName: string;
  /** Pre-formatted currency string (e.g. "$24.99"). */
  amountFormatted: string;
  /** Card last4, omitted from copy when absent. */
  last4?: string;
  /** Human-readable refund reason, omitted from copy when absent. */
  refundReason?: string;
  receiptUrl?: string;
}

export function refundIssuedSubject(amountFormatted: string): string {
  return `Refund issued: ${amountFormatted}`;
}

function reasonLine(reason?: string): string {
  if (!reason) return "your recent invoice";
  return reason;
}

export function refundIssuedEmailHtml(props: RefundIssuedProps): string {
  const safeFirst = escapeEmailHtml(props.ownerFirstName);
  const safeAmount = escapeEmailHtml(props.amountFormatted);
  const cardSuffix = props.last4
    ? ` to your card ending in ${escapeEmailHtml(props.last4)}`
    : "";
  const safeReason = escapeEmailHtml(reasonLine(props.refundReason));

  const ctaBlock = props.receiptUrl
    ? `${emailSpacerV2({ height: 8 })}
       ${emailButtonRowV2(
         emailButtonV2({ label: "View receipt", href: props.receiptUrl })
       )}`
    : "";

  const metadata = props.refundReason
    ? `Reason: ${escapeEmailHtml(props.refundReason)}`
    : undefined;

  return emailShellV2({
    preheader: `We've refunded ${props.amountFormatted}.`,
    category: "Refund issued",
    title: `We've refunded ${props.amountFormatted}`,
    metadata,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${safeFirst},`)}
        ${emailParagraphV2(
          `We've issued a refund of ${safeAmount}${cardSuffix}. It should appear in 5-10 business days, depending on your bank.`
        )}
        ${emailParagraphV2(`The refund covers ${safeReason}.`)}
        ${emailParagraphV2(
          `If you didn't expect this, or have questions about the refund, just reply directly.`
        )}
        ${ctaBlock}
        ${emailSignoffV2("— Ishaq, Founder, Annote")}
      `,
    }),
  });
}

export function refundIssuedEmailText(props: RefundIssuedProps): string {
  const cardSuffix = props.last4 ? ` to your card ending in ${props.last4}` : "";
  const reason = reasonLine(props.refundReason);
  const ctaLine = props.receiptUrl ? `\nView receipt: ${props.receiptUrl}\n` : "";

  return plainTextShellV2({
    body: `Hey ${props.ownerFirstName},

We've issued a refund of ${props.amountFormatted}${cardSuffix}. It should appear in 5-10 business days, depending on your bank.

The refund covers ${reason}.

If you didn't expect this, or have questions about the refund, just reply directly.
${ctaLine}
— Ishaq, Founder, Annote`,
  });
}
