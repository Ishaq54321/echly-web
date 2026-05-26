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

interface TicketResolvedProps {
  reporterFirstName: string;
  resolverName: string;
  ticketTitle: string;
  sessionName: string;
  ticketUrl: string;
  /** Optional resolution note added by the resolver. Omitted from the body when absent. */
  resolutionNote?: string;
  /** Signed unsubscribe URL — threaded through by sendEmailWithPreferences. */
  unsubscribeUrl?: string;
}

export function ticketResolvedSubject(ticketTitle: string): string {
  return `Your ticket was resolved: ${ticketTitle}`;
}

export function ticketResolvedEmailHtml({
  reporterFirstName,
  resolverName,
  ticketTitle,
  sessionName,
  ticketUrl,
  resolutionNote,
  unsubscribeUrl,
}: TicketResolvedProps): string {
  const safeFirst = escapeEmailHtml(reporterFirstName);
  const safeResolver = escapeEmailHtml(resolverName);
  const safeTitle = escapeEmailHtml(ticketTitle);
  const safeSession = escapeEmailHtml(sessionName);
  const trimmedNote = (resolutionNote ?? "").trim();
  const noteBlock = trimmedNote
    ? `${emailParagraphV2(`&ldquo;${escapeEmailHtml(trimmedNote)}&rdquo;`)}`
    : "";

  return emailShellV2({
    preheader: `${resolverName} resolved "${ticketTitle}" in ${sessionName}.`,
    category: "Ticket resolved",
    title: "Your ticket was resolved",
    unsubscribeUrl,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${safeFirst},`)}
        ${emailParagraphV2(
          `${safeResolver} resolved your ticket: &ldquo;${safeTitle}&rdquo; in ${safeSession}.`
        )}
        ${noteBlock}
        ${emailParagraphV2(
          `You can reopen it if something still feels off.`
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "View ticket", href: ticketUrl })
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function ticketResolvedEmailText({
  reporterFirstName,
  resolverName,
  ticketTitle,
  sessionName,
  ticketUrl,
  resolutionNote,
  unsubscribeUrl,
}: TicketResolvedProps): string {
  const trimmedNote = (resolutionNote ?? "").trim();
  const noteLine = trimmedNote ? `\n"${trimmedNote}"\n` : "";
  return plainTextShellV2({
    unsubscribeUrl,
    body: `Hey ${reporterFirstName},

${resolverName} resolved your ticket: "${ticketTitle}" in ${sessionName}.
${noteLine}
You can reopen it if something still feels off.

View ticket: ${ticketUrl}

— Annote`,
  });
}
