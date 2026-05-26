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

interface PlanLimitHitProps {
  /** Workspace owner's first name. Falls back to "there". */
  firstName?: string;
  /** This plan's monthly capture cap (now fully consumed). */
  planLimit: number;
  /** The workspace this usage belongs to. */
  workspaceName: string;
  /** Human-readable billing-cycle reset date, e.g. "June 19, 2026". */
  resetDate: string;
  /** Link to upgrade to Pro. */
  upgradeUrl: string;
  /** Signed unsubscribe URL — threaded through by sendEmailWithPreferences. */
  unsubscribeUrl?: string;
}

/** Subject line. Static; exported for parity with the other plan-limit email. */
export function planLimitHitSubject(): string {
  return "You've hit this month's capture limit";
}

export function planLimitHitEmailHtml({
  firstName,
  planLimit,
  workspaceName,
  resetDate,
  upgradeUrl,
  unsubscribeUrl,
}: PlanLimitHitProps): string {
  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safeReset = escapeEmailHtml(resetDate);

  return emailShellV2({
    preheader:
      "Existing sessions and shares still work. Only new captures pause.",
    category: "Plan usage",
    title: "You've reached your monthly limit",
    unsubscribeUrl,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${greetingName},`)}
        ${emailParagraphV2(
          `You've used all ${planLimit} captures on <strong>${safeWorkspace}</strong> this month. Here's exactly what that means:`
        )}
        ${emailParagraphV2(
          "<strong>What still works:</strong> every existing session, every shared link, every comment thread, the full dashboard. Recipients can keep opening sessions you've already shared."
        )}
        ${emailParagraphV2(
          `<strong>What pauses:</strong> new captures from the extension. They'll come back automatically on ${safeReset}.`
        )}
        ${emailParagraphV2(
          "If you'd rather not wait, Pro lifts the cap immediately and unlocks workspace seats, integrations, and unlimited history."
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "Upgrade to Pro", href: upgradeUrl })
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          "If the cap feels wrong for your use case, reply and tell me what your month actually looks like. I read these.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Ishaq, Founder, Annote")}
      `,
    }),
  });
}

export function planLimitHitEmailText({
  firstName,
  planLimit,
  workspaceName,
  resetDate,
  upgradeUrl,
  unsubscribeUrl,
}: PlanLimitHitProps): string {
  const greetingName = firstName ?? "there";

  return plainTextShellV2({
    unsubscribeUrl,
    body: `Hey ${greetingName},

You've used all ${planLimit} captures on ${workspaceName} this month. Here's exactly what that means:

What still works: every existing session, every shared link, every comment thread, the full dashboard. Recipients can keep opening sessions you've already shared.

What pauses: new captures from the extension. They'll come back automatically on ${resetDate}.

If you'd rather not wait, Pro lifts the cap immediately and unlocks workspace seats, integrations, and unlimited history.

Upgrade to Pro: ${upgradeUrl}

If the cap feels wrong for your use case, reply and tell me what your month actually looks like. I read these.

— Ishaq, Founder, Annote`,
  });
}
