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

export type PlanChangeType = "upgrade" | "downgrade" | "lateral";

interface PlanChangedProps {
  ownerFirstName: string;
  workspaceName: string;
  oldPlanName: string;
  newPlanName: string;
  /** "monthly" | "annual" or any custom label. */
  billingCycle: string;
  changeType: PlanChangeType;
  /** Pre-formatted long-date string (e.g. "June 19, 2026"). */
  nextBillingDate: string;
  /** Pre-formatted currency string (e.g. "$156.00") or null when unknown. */
  prorationFormatted: string | null;
  /** "refund" when prorationFormatted is a refund credit; "charge" otherwise. */
  prorationDirection: "charge" | "refund" | null;
  billingUrl: string;
}

function titleFor(props: PlanChangedProps): string {
  if (props.changeType === "upgrade") return `Welcome to ${props.newPlanName}`;
  return `Plan changed to ${props.newPlanName}`;
}

function metadataLine(props: PlanChangedProps, escape: (s: string) => string): string {
  return `${escape(props.oldPlanName)} → ${escape(props.newPlanName)} · ${escape(props.billingCycle)}`;
}

export function planChangedEmailHtml(props: PlanChangedProps): string {
  const safeOwner = escapeEmailHtml(props.ownerFirstName);
  const safeWorkspace = escapeEmailHtml(props.workspaceName);
  const safeOld = escapeEmailHtml(props.oldPlanName);
  const safeNew = escapeEmailHtml(props.newPlanName);
  const safeNextBilling = escapeEmailHtml(props.nextBillingDate);

  const title = titleFor(props);
  const metadata = metadataLine(props, escapeEmailHtml);

  let bodyMiddle = "";
  if (props.changeType === "upgrade") {
    const prorationLine =
      props.prorationFormatted && props.prorationDirection
        ? emailParagraphV2(
            `A prorated ${
              props.prorationDirection === "refund" ? "refund" : "charge"
            } of ${escapeEmailHtml(props.prorationFormatted)} will appear on your card today.`
          )
        : "";
    bodyMiddle = `
      ${emailParagraphV2(
        `Your &ldquo;${safeWorkspace}&rdquo; workspace just moved from ${safeOld} to ${safeNew}.`
      )}
      ${emailParagraphV2(
        `You'll see the new rate on your next invoice on ${safeNextBilling}.`
      )}
      ${prorationLine}
    `;
  } else {
    bodyMiddle = `
      ${emailParagraphV2(
        `Your &ldquo;${safeWorkspace}&rdquo; workspace moved from ${safeOld} to ${safeNew}. The change takes effect at your next renewal on ${safeNextBilling}.`
      )}
      ${emailParagraphV2(
        `You'll keep your current plan benefits until then. After that, your workspace runs on ${safeNew} limits.`
      )}
      ${emailParagraphV2(
        `If this was a mistake, you can switch back anytime before ${safeNextBilling}.`
      )}
    `;
  }

  return emailShellV2({
    preheader:
      props.changeType === "upgrade"
        ? `You're now on ${props.newPlanName}.`
        : `Plan changes at renewal on ${props.nextBillingDate}.`,
    category: "Subscription update",
    title,
    metadata,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${safeOwner},`)}
        ${bodyMiddle}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "View billing", href: props.billingUrl })
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function planChangedEmailText(props: PlanChangedProps): string {
  const title = titleFor(props);

  let middle = "";
  if (props.changeType === "upgrade") {
    const prorationLine =
      props.prorationFormatted && props.prorationDirection
        ? `A prorated ${props.prorationDirection === "refund" ? "refund" : "charge"} of ${props.prorationFormatted} will appear on your card today.\n\n`
        : "";
    middle = `Your "${props.workspaceName}" workspace just moved from ${props.oldPlanName} to ${props.newPlanName}.

You'll see the new rate on your next invoice on ${props.nextBillingDate}.

${prorationLine}`;
  } else {
    middle = `Your "${props.workspaceName}" workspace moved from ${props.oldPlanName} to ${props.newPlanName}. The change takes effect at your next renewal on ${props.nextBillingDate}.

You'll keep your current plan benefits until then. After that, your workspace runs on ${props.newPlanName} limits.

If this was a mistake, you can switch back anytime before ${props.nextBillingDate}.

`;
  }

  return plainTextShellV2({
    body: `Hey ${props.ownerFirstName},

${title}

${middle}View billing: ${props.billingUrl}

— Annote`,
  });
}
