import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailHeadingV2,
  emailParagraphV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface PaymentFailedProps {
  workspaceName: string;
  portalUrl: string;
  /** Phase-5 optional: recipient first name for the greeting. Falls back to "there". */
  firstName?: string;
  /** Phase-5 optional: card brand (e.g. "Visa"). Copy degrades when absent. */
  cardBrand?: string;
  /** Phase-5 optional: last 4 of the card. Copy degrades when absent. */
  cardLast4?: string;
  /** Phase-5 optional: next retry date. Copy degrades when absent. */
  retryDate?: string;
  /** Phase-5 optional: plan display name. Defaults to "Business". */
  planName?: string;
}

/**
 * "We tried to charge Visa ending in 4242 for your Business plan" — degrades
 * to a generic line. `escape` is applied to interpolated values so the same
 * builder is safe for both HTML and plain-text callers (plain-text passes the
 * identity function).
 */
function chargeLine(
  props: PaymentFailedProps,
  escape: (s: string) => string
): string {
  const plan = escape(props.planName ?? "Business");
  if (props.cardBrand && props.cardLast4) {
    return `We tried to charge ${escape(props.cardBrand)} ending in ${escape(props.cardLast4)} for your ${plan} plan and it didn't go through. Most of the time this is an expired card or a temporary hold from your bank — easy to fix.`;
  }
  return `We tried to charge your card for your ${plan} plan and it didn't go through. Most of the time this is an expired card or a temporary hold from your bank — easy to fix.`;
}

/** Retry sentence — names the date when known, otherwise stays generic. */
function retryLine(retryDate?: string): string {
  return retryDate
    ? `We'll try again automatically over the next few days. If the next attempt fails on ${retryDate}, your workspace will drop to the free plan and new captures will pause. Everything you've already captured stays accessible either way.`
    : `We'll try again automatically over the next few days. If the next attempt fails, your workspace will drop to the free plan and new captures will pause. Everything you've already captured stays accessible either way.`;
}

export function paymentFailedEmailHtml(props: PaymentFailedProps): string {
  const { portalUrl, firstName } = props;
  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";

  return emailShellV2({
    preheader: "Quick fix — usually just an expired card.",
    content: emailCardV2({
      content: `
        ${emailHeadingV2("We couldn't process your payment")}
        ${emailParagraphV2(`Hey ${greetingName},`)}
        ${emailParagraphV2(chargeLine(props, escapeEmailHtml))}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "Update payment method", href: portalUrl, align: "full" })
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(retryLine(props.retryDate))}
        ${emailParagraphV2(
          "If something's not adding up, just reply — comes straight to me.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Ishaq, Founder, Annote")}
      `,
    }),
  });
}

export function paymentFailedEmailText(props: PaymentFailedProps): string {
  const { portalUrl, firstName } = props;
  const greetingName = firstName ?? "there";

  return plainTextShellV2({
    body: `Hey ${greetingName},

${chargeLine(props, (s) => s)}

Update payment method: ${portalUrl}

${retryLine(props.retryDate)}

If something's not adding up, just reply — comes straight to me.

— Ishaq, Founder, Annote`,
  });
}
