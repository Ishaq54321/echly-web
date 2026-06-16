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

interface SeatAddedProps {
  ownerFirstName: string;
  acceptedByName: string;
  workspaceName: string;
  newSeatCount: number;
  /** Pre-formatted currency string (e.g. "$7.18"), or null when unknown. */
  prorationFormatted: string | null;
  /** Pre-formatted long-date string (e.g. "June 19, 2026"). */
  nextBillingDate: string;
  billingUrl: string;
}

function bodyParagraphs(
  props: SeatAddedProps,
  escape: (s: string) => string
): { greeting: string; line1: string; line2: string; closing: string } {
  const owner = escape(props.ownerFirstName);
  const member = escape(props.acceptedByName);
  const workspace = escape(props.workspaceName);
  const nextBilling = escape(props.nextBillingDate);

  const greeting = `Hey ${owner},`;
  const line1 = `${member} just joined "${workspace}" — your subscription now has ${props.newSeatCount} ${
    props.newSeatCount === 1 ? "seat" : "seats"
  }.`;

  if (props.prorationFormatted) {
    const amount = escape(props.prorationFormatted);
    const line2 = `There's nothing to pay right now — we won't charge your card today. A prorated ${amount} for ${member}'s seat (covering the rest of this cycle) will be added to your next invoice on ${nextBilling}, alongside your regular renewal. After that, your full plan price reflects the new seat count.`;
    const closing = "Nothing else needed from you. If anything looks wrong, just reply.";
    return { greeting, line1, line2, closing };
  }

  const line2 = `There's nothing to pay right now — we won't charge your card today. The prorated cost for the new seat (for the rest of this cycle) will be added to your next invoice on ${nextBilling}, alongside your regular renewal at the full plan price.`;
  const closing = "View the exact breakdown in your billing portal. If anything looks wrong, just reply.";
  return { greeting, line1, line2, closing };
}

export function seatAddedEmailHtml(props: SeatAddedProps): string {
  const { greeting, line1, line2, closing } = bodyParagraphs(
    props,
    escapeEmailHtml
  );
  const metadata = props.prorationFormatted
    ? `+1 seat · ${escapeEmailHtml(props.prorationFormatted)} prorated, added to your next invoice`
    : undefined;

  return emailShellV2({
    preheader: props.prorationFormatted
      ? `Prorated ${props.prorationFormatted} added to your next invoice — no charge today.`
      : "Prorated cost added to your next invoice — no charge today.",
    category: "Subscription update",
    title: "A new seat was added to your workspace",
    metadata,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(greeting)}
        ${emailParagraphV2(line1)}
        ${emailParagraphV2(line2)}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "View billing", href: props.billingUrl })
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(closing, { spaceAfter: 0 })}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function seatAddedEmailText(props: SeatAddedProps): string {
  const { greeting, line1, line2, closing } = bodyParagraphs(
    props,
    (s) => s
  );

  return plainTextShellV2({
    body: `${greeting}

${line1}

${line2}

View billing: ${props.billingUrl}

${closing}

— Annote`,
  });
}
