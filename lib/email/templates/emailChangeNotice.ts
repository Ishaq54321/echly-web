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

interface EmailChangeNoticeProps {
  firstName: string;
  newEmail: string;
  passwordResetUrl: string;
}

export function emailChangeNoticeSubject(): string {
  return "Email change requested on your Annote account";
}

export function emailChangeNoticeHtml({
  firstName,
  newEmail,
  passwordResetUrl,
}: EmailChangeNoticeProps): string {
  const safeFirst = escapeEmailHtml(firstName);
  const safeNew = escapeEmailHtml(newEmail);

  return emailShellV2({
    preheader: `Someone requested to change your account email to ${newEmail}.`,
    category: "Account security",
    title: "Someone requested to change your account email",
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${safeFirst},`)}
        ${emailParagraphV2(
          `Someone (probably you) requested to change the email on your Annote account to &ldquo;${safeNew}&rdquo;. The change isn't final until they confirm via a link we sent to that new address.`
        )}
        ${emailParagraphV2(`If this was you, no action needed.`)}
        ${emailParagraphV2(
          `If you didn't request this, your account may be compromised. Reset your password immediately:`
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "Reset my password", href: passwordResetUrl })
        )}
        ${emailSignoffV2("— Annote")}
      `,
    }),
  });
}

export function emailChangeNoticeText({
  firstName,
  newEmail,
  passwordResetUrl,
}: EmailChangeNoticeProps): string {
  return plainTextShellV2({
    body: `Hey ${firstName},

Someone (probably you) requested to change the email on your Annote account to "${newEmail}". The change isn't final until they confirm via a link we sent to that new address.

If this was you, no action needed.

If you didn't request this, your account may be compromised. Reset your password immediately:

Reset my password: ${passwordResetUrl}

— Annote`,
  });
}
