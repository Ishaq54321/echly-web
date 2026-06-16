import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailHeadingV2,
  emailParagraphV2,
  emailInfoRowV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface UpcomingRenewalReminderProps {
  workspaceName: string;
  amount: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  nextBillingDate: Date;
  cardBrand?: string;
  cardLast4?: string;
  settingsUrl: string;
  firstName?: string;
  planName?: string;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function upcomingRenewalReminderEmailHtml(
  props: UpcomingRenewalReminderProps
): string {
  const {
    workspaceName,
    amount,
    seatCount,
    billingCycle,
    nextBillingDate,
    cardBrand,
    cardLast4,
    settingsUrl,
    firstName,
    planName = "Business",
  } = props;

  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safePlan = escapeEmailHtml(planName);
  const cycleLabel = billingCycle === "annual" ? "annual" : "monthly";
  const seatLabel = seatCount === 1 ? "1 seat" : `${seatCount} seats`;
  const cardLine =
    cardBrand && cardLast4
      ? `${escapeEmailHtml(cardBrand)} ending in ${escapeEmailHtml(cardLast4)}`
      : "your card on file";

  return emailShellV2({
    preheader: `${amount} on ${formatDate(nextBillingDate)} from ${cardLine}.`,
    content: emailCardV2({
      content: `
        ${emailHeadingV2("Heads up — your Annote subscription renews soon")}
        ${emailParagraphV2(`Hey ${greetingName},`)}
        ${emailParagraphV2(
          `Quick heads up: <strong>${safeWorkspace}</strong>'s Annote ${safePlan} subscription renews on <strong>${formatDate(nextBillingDate)}</strong>. We'll charge <strong>${amount}</strong> to ${cardLine}.`
        )}
        ${emailInfoRowV2({ label: "Plan", value: `${safePlan} (${cycleLabel})` })}
        ${emailInfoRowV2({ label: "Seats", value: seatLabel })}
        ${emailInfoRowV2({ label: "Amount", value: amount, mono: true })}
        ${emailInfoRowV2({ label: "Renewal date", value: formatDate(nextBillingDate) })}
        ${emailSpacerV2({ height: 16 })}
        ${emailParagraphV2(
          `No action needed. If you'd like to change your plan, cancel, or update payment method, head to <a href="${settingsUrl}" style="color:#5A49BF;text-decoration:underline;">Billing settings</a>.`
        )}
        ${emailButtonRowV2(
          emailButtonV2({ label: "Open billing settings", href: settingsUrl, align: "full" })
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function upcomingRenewalReminderEmailText(
  props: UpcomingRenewalReminderProps
): string {
  const {
    workspaceName,
    amount,
    seatCount,
    billingCycle,
    nextBillingDate,
    cardBrand,
    cardLast4,
    settingsUrl,
    firstName,
    planName = "Business",
  } = props;
  const greetingName = firstName ?? "there";
  const cycleLabel = billingCycle === "annual" ? "annual" : "monthly";
  const seatLabel = seatCount === 1 ? "1 seat" : `${seatCount} seats`;
  const cardLine = cardBrand && cardLast4 ? `${cardBrand} ending in ${cardLast4}` : "your card on file";
  return plainTextShellV2({
    body: `Hey ${greetingName},

Quick heads up: ${workspaceName}'s Annote ${planName} subscription renews on ${formatDate(nextBillingDate)}. We'll charge ${amount} to ${cardLine}.

Plan: ${planName} (${cycleLabel})
Seats: ${seatLabel}
Amount: ${amount}
Renewal date: ${formatDate(nextBillingDate)}

No action needed. To change your plan, cancel, or update payment method:
${settingsUrl}

— Annote`,
  });
}
