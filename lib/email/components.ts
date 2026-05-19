// Shared email shell — single source of truth for email visual identity.
// DO NOT use CSS variables in email HTML (email clients don't resolve them).
// Hardcoded hex colors only, inline CSS only, 560px max-width, single-column.

export const emailColors = {
  brand: "#5A49BF",
  brandHover: "#4F40A8", // outline button states (not really hovered in email)
  brandLight: "#F0ECFB", // accent backgrounds
  brandLightBorder: "#DCD5F0",
  textHeading: "#0F0E13",
  textBody: "#3D3946",
  textMuted: "#7A7484",
  textFooter: "#B5AEBE",
  background: "#FFFFFF",
  surface: "#FAFAFB",
  surfaceSubtle: "#F5F4F7",
  border: "#E5E3EA",
  success: "#16A34A",
  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",
  danger: "#E5484D",
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  warning: "#F77E2C",
  warningBg: "#FFEDD5",
  warningBorder: "#FED7AA",
} as const;

interface ShellOptions {
  /** Hidden preview text shown in inbox preview before the body. */
  preheader?: string;
}

export function emailShell(bodyHtml: string, opts: ShellOptions = {}): string {
  const preheader = opts.preheader ?? "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Annote</title>
</head>
<body style="margin:0;padding:0;background-color:${emailColors.surface};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ""}

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${emailColors.surface};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background-color:${emailColors.background};border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid ${emailColors.border};">
              <span style="font-size:18px;font-weight:600;color:${emailColors.brand};letter-spacing:-0.01em;">Annote</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;color:${emailColors.textBody};font-size:15px;line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid ${emailColors.border};">
              <p style="margin:0;font-size:12px;color:${emailColors.textFooter};line-height:1.5;">
                Sent by Annote. <a href="https://annote.ai" style="color:${emailColors.textFooter};text-decoration:underline;">annote.ai</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Button component — inline CSS, MSO-compatible.
export function emailButton(
  text: string,
  href: string,
  opts: { variant?: "primary" | "secondary" } = {}
): string {
  const variant = opts.variant ?? "primary";
  const bg = variant === "primary" ? emailColors.brand : emailColors.background;
  const fg = variant === "primary" ? "#FFFFFF" : emailColors.textHeading;
  const border = variant === "primary" ? emailColors.brand : emailColors.border;

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:8px;background-color:${bg};border:1px solid ${border};">
        <a href="${href}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:${fg};text-decoration:none;border-radius:8px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

// Info row — for key/value pairs in plan details.
export function emailInfoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;color:${emailColors.textMuted};">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:${emailColors.textHeading};text-align:right;font-weight:500;">${value}</td>
  </tr>`;
}

// Plain-text shell — for the plain-text alternative.
export function plainTextShell(body: string): string {
  return `${body}

---
Sent by Annote — annote.ai`;
}
