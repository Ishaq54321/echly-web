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

interface EmailChangeProps {
  newEmail: string;
  confirmUrl: string;
  /** Kept for signature stability — callers still pass it; new copy drops the greeting. */
  userName: string;
}

export function emailChangeEmailHtml({ newEmail, confirmUrl }: EmailChangeProps): string {
  const safeNewEmail = escapeEmailHtml(newEmail);

  return emailShellV2({
    preheader: "Click to confirm your new email. Link expires in 24 hours.",
    category: "Account update",
    title: "Confirm your new email",
    metadata: `New email: <strong>${safeNewEmail}</strong>`,
    content: emailCardV2({
      content: `
        ${emailParagraphV2(
          `You requested to change your Annote email to <strong>${safeNewEmail}</strong>.`
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(emailButtonV2({ label: "Confirm new email", href: confirmUrl }))}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          "This link expires in 24 hours. If you didn't request this change, you can ignore this email — your email won't change.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function emailChangeEmailText({ newEmail, confirmUrl }: EmailChangeProps): string {
  return plainTextShellV2({
    body: `You requested to change your Annote email to ${newEmail}.

Confirm new email: ${confirmUrl}

This link expires in 24 hours. If you didn't request this change, you can ignore this email — your email won't change.

— Annote`,
  });
}
