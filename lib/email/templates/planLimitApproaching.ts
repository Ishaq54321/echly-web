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

interface PlanLimitApproachingProps {
  /** Workspace owner's first name. Falls back to "there". */
  firstName?: string;
  /** Plan name, e.g. "Starter". Used in the subject and body. */
  planName: string;
  /** Captures used so far this cycle. */
  usageCount: number;
  /** This plan's monthly capture cap. */
  planLimit: number;
  /** The workspace this usage belongs to. */
  workspaceName: string;
  /** Estimated days until the limit is reached at the current pace. */
  daysRemaining: number;
  /** Human-readable billing-cycle reset date, e.g. "June 19, 2026". */
  resetDate: string;
  /** Link to the plan / upgrade options page. */
  upgradeUrl: string;
  /** Signed unsubscribe URL — threaded through by sendEmailWithPreferences. */
  unsubscribeUrl?: string;
}

/**
 * Subject line. Exported so Phase-5 wiring and the dev preview derive the
 * dynamic subject from one place.
 */
export function planLimitApproachingSubject(planName: string): string {
  return `You're close to the ${planName} plan limit`;
}

function daysLabel(days: number): string {
  return days === 1 ? "1 day" : `${days} days`;
}

export function planLimitApproachingEmailHtml({
  firstName,
  planName,
  usageCount,
  planLimit,
  workspaceName,
  daysRemaining,
  resetDate,
  upgradeUrl,
  unsubscribeUrl,
}: PlanLimitApproachingProps): string {
  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safeReset = escapeEmailHtml(resetDate);
  const days = daysLabel(daysRemaining);
  const usagePct = planLimit > 0 ? Math.round((usageCount / planLimit) * 100) : 0;

  return emailShellV2({
    preheader: "Nothing breaks — just want you to know where you stand.",
    category: "Plan usage",
    title: "You're approaching your monthly limit",
    metadata: `${usagePct}% of ${escapeEmailHtml(planName)} plan used`,
    unsubscribeUrl,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${greetingName},`)}
        ${emailParagraphV2(
          `You've used ${usageCount} of your ${planLimit} captures this month on <strong>${safeWorkspace}</strong>. At your current pace, you'll hit the limit in about ${days}.`
        )}
        ${emailParagraphV2(
          "Nothing breaks when you get there. Existing sessions stay open, shared links keep working, and you can still view and comment on everything. New captures pause until next month or until you upgrade."
        )}
        ${emailParagraphV2(
          `If Annote's earning its keep, Pro lifts the cap and adds workspace members, integrations, and longer history. If it's not, ignore this — the cycle resets on ${safeReset}.`
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "See plan options", href: upgradeUrl })
        )}
        ${emailSignoffV2("— Ishaq, Founder, Annote")}
      `,
    }),
  });
}

export function planLimitApproachingEmailText({
  firstName,
  usageCount,
  planLimit,
  workspaceName,
  daysRemaining,
  resetDate,
  upgradeUrl,
  unsubscribeUrl,
}: PlanLimitApproachingProps): string {
  const greetingName = firstName ?? "there";
  const days = daysLabel(daysRemaining);

  return plainTextShellV2({
    unsubscribeUrl,
    body: `Hey ${greetingName},

You've used ${usageCount} of your ${planLimit} captures this month on ${workspaceName}. At your current pace, you'll hit the limit in about ${days}.

Nothing breaks when you get there. Existing sessions stay open, shared links keep working, and you can still view and comment on everything. New captures pause until next month or until you upgrade.

If Annote's earning its keep, Pro lifts the cap and adds workspace members, integrations, and longer history. If it's not, ignore this — the cycle resets on ${resetDate}.

See plan options: ${upgradeUrl}

— Ishaq, Founder, Annote`,
  });
}
