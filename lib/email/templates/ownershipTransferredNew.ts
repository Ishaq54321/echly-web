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

interface OwnershipTransferredNewProps {
  newOwnerFirstName: string;
  previousOwnerName: string;
  workspaceName: string;
  /** Plan display name; omitted from the body when null. */
  planName: string | null;
  /** Seat count; omitted with planName when null. */
  seatCount: number | null;
  /** Pre-formatted long-date string (e.g. "June 19, 2026"), or null when no active sub. */
  nextBillingDate: string | null;
  /** Pre-formatted currency string (e.g. "$95.00/month"), or null when not available. */
  priceFormatted: string | null;
  settingsUrl: string;
}

export function ownershipTransferredNewSubject(workspaceName: string): string {
  return `You're now the owner of ${workspaceName}`;
}

function billingSummary(props: OwnershipTransferredNewProps): {
  html: string;
  text: string;
} {
  if (!props.planName) {
    const line =
      "There's no active paid subscription on the workspace right now — it's on the free plan.";
    return {
      html: emailParagraphV2(line),
      text: line,
    };
  }
  const seatLabel =
    props.seatCount != null
      ? ` with ${props.seatCount} ${props.seatCount === 1 ? "seat" : "seats"}`
      : "";
  const renewalLabel = props.nextBillingDate
    ? `, renewing on ${escapeEmailHtml(props.nextBillingDate)}`
    : "";
  const priceLabel = props.priceFormatted
    ? ` at ${escapeEmailHtml(props.priceFormatted)}`
    : "";
  const textRenewal = props.nextBillingDate ? `, renewing on ${props.nextBillingDate}` : "";
  const textPrice = props.priceFormatted ? ` at ${props.priceFormatted}` : "";

  const line = `You're now responsible for the workspace's billing. The subscription is currently on ${escapeEmailHtml(
    props.planName
  )}${seatLabel}${renewalLabel}${priceLabel}.`;
  const plain = `You're now responsible for the workspace's billing. The subscription is currently on ${props.planName}${seatLabel}${textRenewal}${textPrice}.`;
  return {
    html: emailParagraphV2(line),
    text: plain,
  };
}

export function ownershipTransferredNewHtml(
  props: OwnershipTransferredNewProps
): string {
  const safeFirst = escapeEmailHtml(props.newOwnerFirstName);
  const safePrev = escapeEmailHtml(props.previousOwnerName);
  const safeWorkspace = escapeEmailHtml(props.workspaceName);
  const billing = billingSummary(props);

  return emailShellV2({
    preheader: `${props.previousOwnerName} transferred ${props.workspaceName} to you.`,
    category: "Workspace update",
    title: `You're now the owner of ${props.workspaceName}`,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${safeFirst},`)}
        ${emailParagraphV2(
          `${safePrev} just transferred ownership of &ldquo;${safeWorkspace}&rdquo; to you. Here's what that means:`
        )}
        ${billing.html}
        ${emailParagraphV2(
          `You can manage members, billing, and settings from the workspace settings page.`
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "Manage workspace", href: props.settingsUrl })
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          "Anything looks wrong? Reply directly — this comes to me.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function ownershipTransferredNewText(
  props: OwnershipTransferredNewProps
): string {
  const billing = billingSummary(props);
  return plainTextShellV2({
    body: `Hey ${props.newOwnerFirstName},

${props.previousOwnerName} just transferred ownership of "${props.workspaceName}" to you. Here's what that means:

${billing.text}

You can manage members, billing, and settings from the workspace settings page.

Manage workspace: ${props.settingsUrl}

Anything looks wrong? Reply directly — this comes to me.

— Annote`,
  });
}
