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

interface AccessRequestNotificationProps {
  requesterEmail: string;
  sessionName: string;
  sessionUrl: string;
  /**
   * Kept for signature stability — callers still pass it. The previous
   * template appended this bare to the footer ("...this request. Acme");
   * the new copy drops it (audit fix).
   */
  workspaceName: string;
}

export function accessRequestNotificationEmailHtml({
  requesterEmail,
  sessionName,
  sessionUrl,
}: AccessRequestNotificationProps): string {
  const safeRequester = escapeEmailHtml(requesterEmail);
  const safeSession = escapeEmailHtml(sessionName);

  return emailShellV2({
    preheader: "Review and approve from your dashboard.",
    category: "Access request",
    title: `${requesterEmail} wants access to your session`,
    metadata: `'${escapeEmailHtml(sessionName)}'`,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(
          `${safeRequester} requested access to your session &ldquo;${safeSession}.&rdquo;`
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(emailButtonV2({ label: "Review request", href: sessionUrl }))}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          "You can approve or decline from the session's share menu. If you don't recognize this person, declining is safe — they won't see anything.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function accessRequestNotificationEmailText({
  requesterEmail,
  sessionName,
  sessionUrl,
}: AccessRequestNotificationProps): string {
  return plainTextShellV2({
    body: `${requesterEmail} requested access to your session "${sessionName}".

Review request: ${sessionUrl}

You can approve or decline from the session's share menu. If you don't recognize this person, declining is safe — they won't see anything.

— Annote`,
  });
}
