import { emailShell, emailButton, emailColors, plainTextShell } from "../components";

interface EmailChangeProps {
  newEmail: string;
  confirmUrl: string;
  userName: string;
}

export function emailChangeEmailHtml({
  newEmail,
  confirmUrl,
  userName,
}: EmailChangeProps): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;">
      Confirm your email change
    </h1>
    <p style="margin:0 0 12px;">
      Hi ${userName}, you requested to change your email address to <strong style="color:${emailColors.textHeading};">${newEmail}</strong>. Click the button below to confirm this change.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:${emailColors.textMuted};line-height:1.6;padding:14px 16px;background:${emailColors.warningBg};border-radius:8px;border-left:3px solid ${emailColors.warning};">
      If you didn't request this change, you can safely ignore this email. Your current email address will remain unchanged.
    </p>
    ${emailButton("Confirm new email", confirmUrl)}
    <p style="margin:0;font-size:13px;color:${emailColors.textMuted};">
      This link expires in 24 hours.
    </p>
  `;

  return emailShell(body, {
    preheader: `Confirm changing your email to ${newEmail}.`,
  });
}

export function emailChangeEmailText({
  newEmail,
  confirmUrl,
  userName,
}: EmailChangeProps): string {
  return plainTextShell(`Confirm your email change

Hi ${userName}, you requested to change your email address to ${newEmail}. Open the link below to confirm this change.

If you didn't request this change, you can safely ignore this email. Your current email address will remain unchanged.

Confirm new email: ${confirmUrl}

This link expires in 24 hours.`);
}
