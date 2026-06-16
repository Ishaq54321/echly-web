import {
  emailShellV2,
  emailCardV2,
  emailHeadingV2,
  emailParagraphV2,
  emailSignoffV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface PaymentMethodUpdatedProps {
  workspaceName: string;
  cardBrand: string;
  cardLast4: string;
  firstName?: string;
}

export function paymentMethodUpdatedEmailHtml(
  props: PaymentMethodUpdatedProps
): string {
  const { workspaceName, cardBrand, cardLast4, firstName } = props;
  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safeBrand = escapeEmailHtml(cardBrand);
  const safeLast4 = escapeEmailHtml(cardLast4);

  return emailShellV2({
    preheader: `${safeBrand} ending in ${safeLast4} is now the card on file.`,
    content: emailCardV2({
      content: `
        ${emailHeadingV2("Payment method updated")}
        ${emailParagraphV2(`Hey ${greetingName},`)}
        ${emailParagraphV2(
          `Just a confirmation that <strong>${safeBrand} ending in ${safeLast4}</strong> is now the card on file for <strong>${safeWorkspace}</strong>. Future charges will go to this card.`
        )}
        ${emailParagraphV2(
          "If you didn't make this change, please reply right away.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function paymentMethodUpdatedEmailText(
  props: PaymentMethodUpdatedProps
): string {
  const { workspaceName, cardBrand, cardLast4, firstName } = props;
  const greetingName = firstName ?? "there";
  return plainTextShellV2({
    body: `Hey ${greetingName},

Just a confirmation that ${cardBrand} ending in ${cardLast4} is now the card on file for ${workspaceName}. Future charges will go to this card.

If you didn't make this change, please reply right away.

— Annote`,
  });
}
