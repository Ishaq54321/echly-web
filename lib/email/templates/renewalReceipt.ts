import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailHeadingV2,
  emailParagraphV2,
  emailInfoRowV2,
  emailDividerV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface RenewalReceiptProps {
  workspaceName: string;
  amount: string; // e.g. "$57.00" — pre-formatted
  seatCount: number;
  billingCycle: "monthly" | "annual";
  invoiceNumber: string | null;
  invoiceDate: Date;
  nextBillingDate: Date;
  invoicePdfUrl: string | null;
  settingsUrl: string;
  firstName?: string;
  planName?: string;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function renewalReceiptEmailHtml(props: RenewalReceiptProps): string {
  const {
    workspaceName,
    amount,
    seatCount,
    billingCycle,
    invoiceNumber,
    invoiceDate,
    nextBillingDate,
    invoicePdfUrl,
    settingsUrl,
    firstName,
    planName = "Business",
  } = props;

  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safePlan = escapeEmailHtml(planName);
  const cycleLabel = billingCycle === "annual" ? "annual" : "monthly";
  const seatLabel = seatCount === 1 ? "1 seat" : `${seatCount} seats`;

  return emailShellV2({
    preheader: `${amount} for ${workspaceName}. Receipt enclosed.`,
    content:
      emailCardV2({
        content: `
          ${emailHeadingV2("Your Annote receipt")}
          ${emailParagraphV2(`Hey ${greetingName},`)}
          ${emailParagraphV2(
            `We charged <strong>${amount}</strong> for <strong>${safeWorkspace}</strong>'s ${safePlan} subscription. Here are the details:`
          )}
          ${emailInfoRowV2({ label: "Plan", value: `${safePlan} (${cycleLabel})` })}
          ${emailInfoRowV2({ label: "Seats", value: seatLabel })}
          ${emailInfoRowV2({ label: "Date", value: formatDate(invoiceDate) })}
          ${invoiceNumber ? emailInfoRowV2({ label: "Invoice", value: invoiceNumber, mono: true }) : ""}
          ${emailDividerV2()}
          ${emailInfoRowV2({ label: "Amount charged", value: amount, mono: true })}
          ${emailInfoRowV2({ label: "Next charge", value: formatDate(nextBillingDate) })}
        `,
      }) +
      emailSpacerV2({ height: 16 }) +
      emailCardV2({
        content: `
          ${invoicePdfUrl
            ? emailButtonRowV2(
                emailButtonV2({ label: "Download invoice PDF", href: invoicePdfUrl, align: "full" })
              )
            : ""}
          ${emailParagraphV2(
            `Manage your subscription, switch plans, or update payment method in <a href="${settingsUrl}" style="color:#5A49BF;text-decoration:underline;">Billing settings</a>.`,
            { spaceAfter: 0 }
          )}
          ${emailSignoffV2("— Ishaq, Founder, Annote")}
        `,
      }),
  });
}

export function renewalReceiptEmailText(props: RenewalReceiptProps): string {
  const {
    workspaceName,
    amount,
    seatCount,
    billingCycle,
    invoiceNumber,
    invoiceDate,
    nextBillingDate,
    invoicePdfUrl,
    settingsUrl,
    firstName,
    planName = "Business",
  } = props;

  const greetingName = firstName ?? "there";
  const cycleLabel = billingCycle === "annual" ? "annual" : "monthly";
  const seatLabel = seatCount === 1 ? "1 seat" : `${seatCount} seats`;

  return plainTextShellV2({
    body: `Hey ${greetingName},

We charged ${amount} for ${workspaceName}'s ${planName} subscription. Here are the details:

Plan: ${planName} (${cycleLabel})
Seats: ${seatLabel}
Date: ${formatDate(invoiceDate)}${invoiceNumber ? `\nInvoice: ${invoiceNumber}` : ""}
Amount charged: ${amount}
Next charge: ${formatDate(nextBillingDate)}
${invoicePdfUrl ? `\nDownload PDF: ${invoicePdfUrl}\n` : ""}
Manage your subscription, switch plans, or update payment method:
${settingsUrl}

— Ishaq, Founder, Annote`,
  });
}
