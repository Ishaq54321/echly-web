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
    const line2 = `A prorated charge of ${amount} will hit your card today, covering ${member}'s seat through ${nextBilling}. After that, your full plan price reflects the new seat count.`;
    const closing = "Nothing else needed from you. If anything looks wrong, just reply.";
    return { greeting, line1, line2, closing };
  }

  const line2 = `You'll see a prorated charge on your card today for the new seat, billed for the remainder of your current cycle. Your next renewal on ${nextBilling} will reflect the full plan price.`;
  const closing = "View the exact breakdown in your billing portal. If anything looks wrong, just reply.";
  return { greeting, line1, line2, closing };
}

export function seatAddedEmailHtml(props: SeatAddedProps): string {
  const { greeting, line1, line2, closing } = bodyParagraphs(
    props,
    escapeEmailHtml
  );
  const metadata = props.prorationFormatted
    ? `+1 seat · ${escapeEmailHtml(props.prorationFormatted)} prorated charge today`
    : undefined;

  return emailShellV2({
    preheader: props.prorationFormatted
      ? `Prorated charge ${props.prorationFormatted} today.`
      : "A prorated charge will hit your card today.",
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
        ${emailSignoffV2("— Ishaq, Founder, Annote")}
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

— Ishaq, Founder, Annote`,
  });
}
