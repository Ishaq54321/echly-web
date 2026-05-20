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

interface PasswordResetProps {
  resetUrl: string;
  /** Kept for signature stability — callers still pass it; new copy drops the greeting. */
  userName: string;
}

export function passwordResetEmailHtml({ resetUrl }: PasswordResetProps): string {
  return emailShellV2({
    preheader: "Link expires in 60 minutes.",
    category: "Account security",
    title: "Reset your password",
    content: emailCardV2({
      content: `
        ${emailParagraphV2("We got a request to reset the password for your Annote account.")}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(emailButtonV2({ label: "Reset password", href: resetUrl }))}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          "The link expires in 60 minutes. If you didn't request this, you can ignore the email — your password won't change.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function passwordResetEmailText({ resetUrl }: PasswordResetProps): string {
  return plainTextShellV2({
    body: `We got a request to reset the password for your Annote account.

Reset password: ${resetUrl}

The link expires in 60 minutes. If you didn't request this, you can ignore the email — your password won't change.

— Annote`,
  });
}
