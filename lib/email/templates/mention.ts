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

interface MentionProps {
  /** Name (or email) of whoever wrote the comment that mentioned the recipient. */
  mentionerName: string;
  /** Title of the ticket the comment is on. */
  ticketTitle: string;
  /** Name of the session the ticket lives in. */
  sessionName: string;
  /**
   * Already-truncated comment preview. Caller runs commentExcerpt() from
   * lib/email/helpers before passing it in.
   */
  commentExcerpt: string;
  /** Deep link to the ticket / comment. */
  commentUrl: string;
}

/**
 * Subject line. Exported so Phase-5 wiring and the dev preview derive the
 * dynamic subject from one place.
 */
export function mentionSubject(
  mentionerName: string,
  ticketTitle: string
): string {
  return `${mentionerName} mentioned you in "${ticketTitle}"`;
}

export function mentionEmailHtml({
  mentionerName,
  ticketTitle,
  sessionName,
  commentExcerpt,
  commentUrl,
}: MentionProps): string {
  const safeMentioner = escapeEmailHtml(mentionerName);
  const safeTitle = escapeEmailHtml(ticketTitle);
  const safeSession = escapeEmailHtml(sessionName);
  const safeExcerpt = escapeEmailHtml(commentExcerpt);

  return emailShellV2({
    preheader: `"${commentExcerpt}"`,
    category: "You were mentioned",
    title: `${mentionerName} tagged you in a comment`,
    metadata: `On '${safeSession}'`,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(
          `${safeMentioner} mentioned you in a comment on &ldquo;${safeTitle}&rdquo; in ${safeSession}:`
        )}
        ${emailParagraphV2(`&ldquo;${safeExcerpt}&rdquo;`)}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "View the comment", href: commentUrl })
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function mentionEmailText({
  mentionerName,
  ticketTitle,
  sessionName,
  commentExcerpt,
  commentUrl,
}: MentionProps): string {
  return plainTextShellV2({
    body: `${mentionerName} mentioned you in a comment on "${ticketTitle}" in ${sessionName}:

"${commentExcerpt}"

View the comment: ${commentUrl}

— Annote`,
  });
}
