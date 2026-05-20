import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailParagraphV2,
  emailSignoffV2,
  emailSpacerV2,
  plainTextShellV2,
} from "../components";

interface EmailVerificationProps {
  verifyUrl: string;
  /** Kept for signature stability — callers still pass it; new copy drops the greeting. */
  userName: string;
}

export function emailVerificationHtml({ verifyUrl }: EmailVerificationProps): string {
  return emailShellV2({
    preheader: "Link expires in 24 hours.",
    category: "Verify your email",
    title: "One step left",
    content: emailCardV2({
      content: `
        ${emailParagraphV2("Confirm the email address on your Annote account by clicking below.")}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(emailButtonV2({ label: "Verify email", href: verifyUrl }))}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          "This link expires in 24 hours. If you didn't sign up for Annote, you can ignore this email.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function emailVerificationText({ verifyUrl }: EmailVerificationProps): string {
  return plainTextShellV2({
    body: `Confirm the email address on your Annote account by clicking below.

Verify email: ${verifyUrl}

This link expires in 24 hours. If you didn't sign up for Annote, you can ignore this email.

— Annote`,
  });
}
