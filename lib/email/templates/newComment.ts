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

interface NewCommentProps {
  /** Name (or email) of whoever left the comment. */
  commenterName: string;
  /** Title of the ticket that was commented on. */
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
  /** Signed unsubscribe URL — threaded through by sendEmailWithPreferences. */
  unsubscribeUrl?: string;
}

/**
 * Subject line. Exported so Phase-5 wiring and the dev preview derive the
 * dynamic subject from one place.
 */
export function newCommentSubject(
  commenterName: string,
  ticketTitle: string
): string {
  return `${commenterName} commented on "${ticketTitle}"`;
}

export function newCommentEmailHtml({
  commenterName,
  sessionName,
  commentExcerpt,
  commentUrl,
  unsubscribeUrl,
}: NewCommentProps): string {
  const safeCommenter = escapeEmailHtml(commenterName);
  const safeSession = escapeEmailHtml(sessionName);
  const safeExcerpt = escapeEmailHtml(commentExcerpt);

  return emailShellV2({
    preheader: `"${commentExcerpt}"`,
    category: "New comment",
    title: `${commenterName} commented on '${sessionName}'`,
    unsubscribeUrl,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(
          `${safeCommenter} left a comment on a ticket you captured in &ldquo;${safeSession}&rdquo;:`
        )}
        ${emailParagraphV2(`&ldquo;${safeExcerpt}&rdquo;`)}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "View the comment", href: commentUrl })
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          "You can reply directly from the ticket — the thread keeps everything in one place.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function newCommentEmailText({
  commenterName,
  sessionName,
  commentExcerpt,
  commentUrl,
  unsubscribeUrl,
}: NewCommentProps): string {
  return plainTextShellV2({
    unsubscribeUrl,
    body: `${commenterName} left a comment on a ticket you captured in "${sessionName}":

"${commentExcerpt}"

View the comment: ${commentUrl}

You can reply directly from the ticket — the thread keeps everything in one place.

— Annote`,
  });
}
