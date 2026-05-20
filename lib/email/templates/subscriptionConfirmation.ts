import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailParagraphV2,
  emailInfoRowV2,
  emailDividerV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

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
  /** Phase-5 optional: recipient first name for the greeting. Falls back to "there". */
  firstName?: string;
  /** Phase-5 optional: plan display name. Defaults to "Business" (matches subject + prior copy). */
  planName?: string;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Derives the human amount string from existing catalog props (no placeholders). */
function computeAmount(props: SubscriptionConfirmationProps): string {
  const { seatCount, billingCycle, pricePerSeat, annualPricePerSeat } = props;
  if (billingCycle === "annual") {
    return `$${(seatCount * annualPricePerSeat * 12).toFixed(2)}/year`;
  }
  return `$${(seatCount * pricePerSeat).toFixed(2)}/month`;
}

export function subscriptionConfirmationEmailHtml(
  props: SubscriptionConfirmationProps
): string {
  const {
    workspaceName,
    seatCount,
    billingCycle,
    nextBillingDate,
    settingsUrl,
    firstName,
    planName = "Business",
  } = props;

  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safePlan = escapeEmailHtml(planName);
  const cycleLabel = billingCycle === "annual" ? "annual" : "monthly";
  const amount = computeAmount(props);
  const seatLabel = seatCount === 1 ? "1 seat" : `${seatCount} seats`;

  const cycleTitleCase = cycleLabel === "annual" ? "Annual" : "Monthly";

  return emailShellV2({
    preheader: `${planName}, ${cycleLabel}. Next charge ${formatDate(nextBillingDate)}.`,
    category: `Welcome to ${planName}`,
    title: "You're upgraded",
    metadata: `${escapeEmailHtml(planName)} &middot; ${cycleTitleCase}`,
    content:
      emailCardV2({
        content: `
          ${emailParagraphV2(`Hey ${greetingName},`)}
          ${emailParagraphV2(
            `Thanks for upgrading <strong>${safeWorkspace}</strong> to Annote ${safePlan}. Here's what you're paying for:`
          )}
          ${emailInfoRowV2({ label: "Plan", value: `${safePlan} (${cycleLabel})` })}
          ${emailInfoRowV2({ label: "Seats", value: seatLabel })}
          ${emailInfoRowV2({ label: "Next charge", value: formatDate(nextBillingDate) })}
          ${emailDividerV2()}
          ${emailInfoRowV2({ label: "Amount", value: amount, mono: true })}
        `,
      }) +
      emailSpacerV2({ height: 16 }) +
      emailCardV2({
        content: `
          ${emailParagraphV2(
            `You can manage your subscription, download invoices, and change plans anytime from <a href="${settingsUrl}" style="color:#5A49BF;text-decoration:underline;">Billing settings</a>.`
          )}
          ${emailButtonRowV2(
            emailButtonV2({ label: "Open billing settings", href: settingsUrl, align: "full" })
          )}
          ${emailSpacerV2({ height: 8 })}
          ${emailParagraphV2(
            "If anything looks off or you have questions, just reply — comes straight to me.",
            { spaceAfter: 0 }
          )}
          ${emailSignoffV2("— Ishaq, Founder, Annote")}
        `,
      }),
  });
}

export function subscriptionConfirmationEmailText(
  props: SubscriptionConfirmationProps
): string {
  const {
    workspaceName,
    seatCount,
    billingCycle,
    nextBillingDate,
    settingsUrl,
    firstName,
    planName = "Business",
  } = props;

  const greetingName = firstName ?? "there";
  const cycleLabel = billingCycle === "annual" ? "annual" : "monthly";
  const seatLabel = seatCount === 1 ? "1 seat" : `${seatCount} seats`;
  const amount = computeAmount(props);

  return plainTextShellV2({
    body: `Hey ${greetingName},

Thanks for upgrading ${workspaceName} to Annote ${planName}. Here's what you're paying for:

Plan: ${planName} (${cycleLabel})
Seats: ${seatLabel}
Next charge: ${formatDate(nextBillingDate)}
Amount: ${amount}

You can manage your subscription, download invoices, and change plans anytime from Billing settings.

Open billing settings: ${settingsUrl}

If anything looks off or you have questions, just reply — comes straight to me.

— Ishaq, Founder, Annote`,
  });
}
