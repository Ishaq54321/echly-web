import { emailShell, emailButton, emailColors, plainTextShell } from "../components";

interface EmailVerificationProps {
  verifyUrl: string;
  userName: string;
}

export function emailVerificationHtml({
  verifyUrl,
  userName,
}: EmailVerificationProps): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;">
      Verify your email
    </h1>
    <p style="margin:0 0 12px;">
      Hi ${userName}, please verify your email to finish setting up your Annote account. Click the button below to continue.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:${emailColors.textMuted};line-height:1.6;">
      This link expires in 1 hour. If you didn't create an Annote account, you can safely ignore this email.
    </p>
    ${emailButton("Verify email", verifyUrl)}
    <p style="margin:0;font-size:13px;color:${emailColors.textMuted};">
      This link expires in 1 hour.
    </p>
  `;

  return emailShell(body, {
    preheader: "Verify your email to finish setting up Annote.",
  });
}

export function emailVerificationText({
  verifyUrl,
  userName,
}: EmailVerificationProps): string {
  return plainTextShell(`Verify your email

Hi ${userName}, please verify your email to finish setting up your Annote account. Open the link below to continue.

This link expires in 1 hour. If you didn't create an Annote account, you can safely ignore this email.

Verify email: ${verifyUrl}`);
}
