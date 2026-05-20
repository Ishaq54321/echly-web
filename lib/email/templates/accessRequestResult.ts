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

interface AccessRequestResultProps {
  approved: boolean;
  sessionName: string;
  sessionUrl: string;
  /**
   * Kept for signature stability — callers still pass it. The previous
   * template rendered this bare in the footer; the new copy drops it
   * (audit fix).
   */
  workspaceName: string;
}

export function accessRequestResultEmailHtml({
  approved,
  sessionName,
  sessionUrl,
}: AccessRequestResultProps): string {
  const safeSession = escapeEmailHtml(sessionName);

  if (approved) {
    return emailShellV2({
      preheader: "Open the session anytime.",
      category: "Access request",
      title: "You're in",
      metadata: `'${safeSession}'`,
      content: emailCardV2({
        content: `
          ${emailParagraphV2(
            `Your access request for &ldquo;${safeSession}&rdquo; was approved.`
          )}
          ${emailSpacerV2({ height: 8 })}
          ${emailButtonRowV2(emailButtonV2({ label: "Open the session", href: sessionUrl }))}
          ${emailSpacerV2({ height: 8 })}
          ${emailSignoffV2("— Annote")}
        `,
      }),
    });
  }

  return emailShellV2({
    preheader: "Request declined.",
    category: "Access request",
    title: "Request declined",
    content: emailCardV2({
      content: `
        ${emailParagraphV2(
          `Your access request for &ldquo;${safeSession}&rdquo; was declined.`
        )}
        ${emailParagraphV2(
          "If you think this was a mistake, the best path is to reach out directly to whoever shared the session originally.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function accessRequestResultEmailText({
  approved,
  sessionName,
  sessionUrl,
}: AccessRequestResultProps): string {
  if (approved) {
    return plainTextShellV2({
      body: `Your access request for "${sessionName}" was approved.

Open the session: ${sessionUrl}

— Annote`,
    });
  }

  return plainTextShellV2({
    body: `Your access request for "${sessionName}" was declined.

If you think this was a mistake, the best path is to reach out directly to whoever shared the session originally.

— Annote`,
  });
}
