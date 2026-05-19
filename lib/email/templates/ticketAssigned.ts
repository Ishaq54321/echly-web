import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailHeadingV2,
  emailParagraphV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface TicketAssignedProps {
  /** Name (or email) of whoever assigned the ticket. */
  assignerName: string;
  /** Title of the ticket assigned to the recipient. */
  ticketTitle: string;
  /** Name of the session the ticket lives in. */
  sessionName: string;
  /** Deep link to open the ticket. */
  ticketUrl: string;
}

/**
 * Subject line. Exported so Phase-5 wiring and the dev preview derive the
 * dynamic subject from one place.
 */
export function ticketAssignedSubject(assignerName: string): string {
  return `${assignerName} assigned you a ticket`;
}

export function ticketAssignedEmailHtml({
  assignerName,
  ticketTitle,
  sessionName,
  ticketUrl,
}: TicketAssignedProps): string {
  const safeAssigner = escapeEmailHtml(assignerName);
  const safeTitle = escapeEmailHtml(ticketTitle);
  const safeSession = escapeEmailHtml(sessionName);

  return emailShellV2({
    preheader: `${ticketTitle} — in ${sessionName}.`,
    content: emailCardV2({
      content: `
        ${emailHeadingV2(`${safeAssigner} assigned you a ticket`)}
        ${emailParagraphV2(
          `${safeAssigner} assigned you a ticket in &ldquo;${safeSession}&rdquo;:`
        )}
        ${emailParagraphV2(`&ldquo;${safeTitle}&rdquo;`)}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "Open the ticket", href: ticketUrl })
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          `Status updates and replies post back to the session, so ${safeAssigner} sees them as soon as you ship.`,
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function ticketAssignedEmailText({
  assignerName,
  ticketTitle,
  sessionName,
  ticketUrl,
}: TicketAssignedProps): string {
  return plainTextShellV2({
    body: `${assignerName} assigned you a ticket in "${sessionName}":

"${ticketTitle}"

Open the ticket: ${ticketUrl}

Status updates and replies post back to the session, so ${assignerName} sees them as soon as you ship.

— Annote`,
  });
}
