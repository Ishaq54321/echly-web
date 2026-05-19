import {
  emailShellV2,
  emailCardV2,
  emailHeadingV2,
  emailParagraphV2,
  emailSignoffV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface SubscriptionCancelledProps {
  workspaceName: string;
  /** Kept for signature stability — callers still pass it; the new copy is intentionally button-free. */
  upgradeUrl: string;
  /** Kept for signature stability — callers still pass it; new copy doesn't enumerate limits. */
  starterLimits: {
    maxMembers: number | null;
    maxFeedbackPerMonth: number | null;
    aiImprovementsPerMonth: number | null;
  };
  /** Phase-5 optional: recipient first name for the greeting. Falls back to "there". */
  firstName?: string;
  /** Phase-5 optional: paid plan display name. Defaults to "Business". */
  planName?: string;
  /** Phase-5 optional: date paid features end. Falls back to a generic phrase when absent. */
  periodEndDate?: string;
}

export function subscriptionCancelledEmailHtml(
  props: SubscriptionCancelledProps
): string {
  const { workspaceName, firstName, planName = "Business", periodEndDate } = props;

  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
  const safePlan = escapeEmailHtml(planName);
  const throughClause = periodEndDate
    ? `You'll keep ${safePlan} features through <strong>${escapeEmailHtml(periodEndDate)}</strong>, after which the workspace switches to the free plan.`
    : `You'll keep ${safePlan} features until the end of your current billing period, after which the workspace switches to the free plan.`;

  return emailShellV2({
    preheader: "Your data stays put. The door's open whenever.",
    content: emailCardV2({
      content: `
        ${emailHeadingV2("Your Annote subscription is canceled")}
        ${emailParagraphV2(`Hey ${greetingName},`)}
        ${emailParagraphV2(
          `Your Annote subscription is canceled. You won't be charged again. ${throughClause}`
        )}
        ${emailParagraphV2(
          `What that means for your data: your sessions, captures, comments, and shared links all stay where they are. Nothing is deleted. You can keep using the free plan as long as you want, or export everything from the Billing page if you'd rather take it with you.`
        )}
        ${emailParagraphV2(
          "Thanks for trying Annote. Genuinely — early users decide what a product becomes, and the time you spent here shaped it."
        )}
        ${emailParagraphV2(
          "If something specific pushed you to cancel, I'd love to hear what. One sentence is enough."
        )}
        ${emailParagraphV2("The door's open whenever.", { spaceAfter: 0 })}
        ${emailSignoffV2("— Ishaq, Founder, Annote")}
      `,
    }),
  });
}

export function subscriptionCancelledEmailText(
  props: SubscriptionCancelledProps
): string {
  const { firstName, planName = "Business", periodEndDate } = props;

  const greetingName = firstName ?? "there";
  const throughClause = periodEndDate
    ? `You'll keep ${planName} features through ${periodEndDate}, after which the workspace switches to the free plan.`
    : `You'll keep ${planName} features until the end of your current billing period, after which the workspace switches to the free plan.`;

  return plainTextShellV2({
    body: `Hey ${greetingName},

Your Annote subscription is canceled. You won't be charged again. ${throughClause}

What that means for your data: your sessions, captures, comments, and shared links all stay where they are. Nothing is deleted. You can keep using the free plan as long as you want, or export everything from the Billing page if you'd rather take it with you.

Thanks for trying Annote. Genuinely — early users decide what a product becomes, and the time you spent here shaped it.

If something specific pushed you to cancel, I'd love to hear what. One sentence is enough.

The door's open whenever.

— Ishaq, Founder, Annote`,
  });
}
