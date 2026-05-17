import { emailShell, emailButton, emailColors, plainTextShell } from "../components";

interface PasswordResetProps {
  resetUrl: string;
  userName: string;
}

export function passwordResetEmailHtml({
  resetUrl,
  userName,
}: PasswordResetProps): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;">
      Reset your password
    </h1>
    <p style="margin:0 0 12px;">
      Hi ${userName}, you requested a password reset for your Annote account. Click below to choose a new password.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:${emailColors.textMuted};line-height:1.6;padding:14px 16px;background:${emailColors.warningBg};border-radius:8px;border-left:3px solid ${emailColors.warning};">
      This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
    ${emailButton("Reset password", resetUrl)}
    <p style="margin:0;font-size:13px;color:${emailColors.textMuted};">
      This link expires in 1 hour.
    </p>
  `;

  return emailShell(body, {
    preheader: "Reset your Annote password.",
  });
}

export function passwordResetEmailText({
  resetUrl,
  userName,
}: PasswordResetProps): string {
  return plainTextShell(`Reset your password

Hi ${userName}, you requested a password reset for your Annote account. Open the link below to choose a new password.

This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.

Reset password: ${resetUrl}`);
}
