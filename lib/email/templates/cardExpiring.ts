import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailHeadingV2,
  emailParagraphV2,
  emailSignoffV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface CardExpiringProps {
  workspaceName: string;
  cardBrand: string;
  cardLast4: string;
  expiryMonth: number;
  expiryYear: number;
  portalUrl: string;
  firstName?: string;
}

export function cardExpiringEmailHtml(props: CardExpiringProps): string {
  const { workspaceName, cardBrand, cardLast4, expiryMonth, expiryYear, portalUrl, firstName } = props;
  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safeBrand = escapeEmailHtml(cardBrand);
  const safeLast4 = escapeEmailHtml(cardLast4);
  const expiryStr = `${String(expiryMonth).padStart(2, "0")}/${expiryYear}`;

  return emailShellV2({
    preheader: `${safeBrand} ending in ${safeLast4} expires ${expiryStr}.`,
    content: emailCardV2({
      content: `
        ${emailHeadingV2("Your card is expiring soon")}
        ${emailParagraphV2(`Hey ${greetingName},`)}
        ${emailParagraphV2(
          `Your <strong>${safeBrand} ending in ${safeLast4}</strong> (the card on file for <strong>${safeWorkspace}</strong>) expires in <strong>${expiryStr}</strong>. To avoid an interruption when your subscription next renews, please update it before then.`
        )}
        ${emailButtonRowV2(
          emailButtonV2({ label: "Update payment method", href: portalUrl, align: "full" })
        )}
        ${emailParagraphV2(
          "Updating takes about 30 seconds. If you have any questions, just reply — comes straight to me.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Ishaq, Founder, Annote")}
      `,
    }),
  });
}

export function cardExpiringEmailText(props: CardExpiringProps): string {
  const { workspaceName, cardBrand, cardLast4, expiryMonth, expiryYear, portalUrl, firstName } = props;
  const greetingName = firstName ?? "there";
  const expiryStr = `${String(expiryMonth).padStart(2, "0")}/${expiryYear}`;

  return plainTextShellV2({
    body: `Hey ${greetingName},

Your ${cardBrand} ending in ${cardLast4} (the card on file for ${workspaceName}) expires in ${expiryStr}. To avoid an interruption when your subscription next renews, please update it before then.

Update payment method:
${portalUrl}

Updating takes about 30 seconds. If you have any questions, just reply — comes straight to me.

— Ishaq, Founder, Annote`,
  });
}
