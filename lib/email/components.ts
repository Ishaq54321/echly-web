// Shared email visual system — single source of truth for email identity.
//
// Constraints (email clients are not browsers):
//   - NO CSS variables in email HTML (clients don't resolve them).
//   - Hardcoded hex colors, inline CSS only.
//   - Table-based, bulletproof, Outlook-compatible. 560px max-width,
//     single-column. Light mode only.
//
// History: Phase 1 introduced this Anthropic/Stripe-style receipt system
// alongside a legacy generation; Phase 2 migrated all 12 templates onto it
// and deleted the legacy block. The "V2" suffix is retained on exported
// names because templates import them by that name; renaming is a separate,
// mechanical follow-up.

export const EMAIL_COLORS = {
  pageBackground: "#F9F8F6",
  cardBackground: "#FFFFFF",
  textPrimary: "#15101F",
  textSecondary: "#54495F",
  textFooter: "#54495F",
  linkColor: "#5A49BF",
  hairline: "#ECECEA",
  ctaBackground: "#15101F",
  ctaText: "#FFFFFF",
  monoBackground: "transparent",
} as const;

export const EMAIL_FONTS = {
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
  mono: `'SF Mono', 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace`,
} as const;

export const EMAIL_SIZES = {
  containerMaxWidth: 560,
  outerPaddingVertical: 40,
  outerPaddingHorizontal: 16,
  cardPaddingDesktop: 32,
  cardPaddingMobile: 24,
  cardBorderRadius: 8,
  buttonBorderRadius: 6,
  bodyFontSize: 16,
  bodyLineHeight: 1.6,
  secondaryFontSize: 14,
  footerFontSize: 13,
} as const;

// Annote logo — exact paths from the approved brand asset (Group_154.svg).
// Inlined as SVG; recolored to EMAIL_COLORS.textPrimary. Width 106 / height 28.
const ANNOTE_LOGO_SVG = `<a href="https://annote.ai" style="display:inline-block;text-decoration:none;">
  <svg width="106" height="28" viewBox="0 0 106 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.6126 6.28019C19.6557 6.25834 17.2864 6.07557 14.9482 4.44328C13.6103 3.50418 12.5156 2.25947 11.7552 0.8125H7.1629V5.24122C7.10317 5.33349 7.02682 5.41388 6.93775 5.47828C6.91464 5.47353 6.89113 5.47109 6.86756 5.471H0V12.6889H7.21786V6.54109C7.39003 6.39966 7.6006 6.31295 7.82244 6.29211C9.41169 8.50117 11.085 9.68649 12.1929 10.3262C15.8309 12.426 20.5967 12.808 20.6126 12.7438C20.604 12.6749 20.6027 10.801 20.6126 6.28019Z" fill="#15101F"/>
    <path d="M5.64853e-07 21.5834C0.956867 21.6053 3.32617 21.788 5.66436 23.4203C7.0023 24.3594 8.09696 25.6042 8.85742 27.0511H13.4497V22.6224C13.5094 22.5302 13.5858 22.4498 13.6748 22.3853C13.6979 22.3901 13.7215 22.3926 13.745 22.3926H20.6126V15.1748H13.3947V21.3225C13.2226 21.464 13.012 21.5507 12.7902 21.5715C11.2009 19.3624 9.52755 18.1771 8.41971 17.5375C4.78166 15.4377 0.0158919 15.0556 0 15.1198C0.00860875 15.1887 0.0099326 17.0627 5.64853e-07 21.5834Z" fill="#15101F"/>
    <path d="M36.8531 22H34.1189L40.2509 4.95397H43.2253L49.3459 22H46.6231L41.7953 8.05429H41.658L36.8531 22ZM37.3107 15.3303H46.154V17.4811H37.3107V15.3303ZM52.384 14.4151V22H49.9129V9.20976H52.3153V11.3148H52.4869C52.7768 10.6207 53.2306 10.0716 53.8483 9.66737C54.4661 9.25552 55.2593 9.04959 56.2279 9.04959C57.0974 9.04959 57.8562 9.23264 58.5045 9.59873C59.1604 9.95719 59.6676 10.4949 60.0261 11.2118C60.3922 11.9287 60.5752 12.8173 60.5752 13.8774V22H58.1041V14.1748C58.1041 13.252 57.8601 12.5274 57.3719 12.0012C56.8838 11.4673 56.2203 11.2004 55.3813 11.2004C54.8093 11.2004 54.2945 11.33 53.8369 11.5893C53.3869 11.841 53.0323 12.2033 52.7729 12.6762C52.5136 13.149 52.384 13.7287 52.384 14.4151ZM64.723 14.4151V22H62.2519V9.20976H64.6544V11.3148H64.826C65.1158 10.6207 65.5696 10.0716 66.1874 9.66737C66.8051 9.25552 67.5983 9.04959 68.5669 9.04959C69.4364 9.04959 70.1953 9.23264 70.8436 9.59873C71.4995 9.95719 72.0067 10.4949 72.3651 11.2118C72.7312 11.9287 72.9143 12.8173 72.9143 13.8774V22H70.4432V14.1748C70.4432 13.252 70.1991 12.5274 69.711 12.0012C69.2229 11.4673 68.5593 11.2004 67.7204 11.2004C67.1484 11.2004 66.6335 11.33 66.1759 11.5893C65.7259 11.841 65.3713 12.2033 65.112 12.6762C64.8527 13.149 64.723 13.7287 64.723 14.4151ZM79.9564 22.2631C78.759 22.2631 77.7103 21.9886 76.8104 21.4394C75.918 20.8903 75.224 20.12 74.7282 19.1285C74.2401 18.137 73.996 16.9853 73.996 15.6735C73.996 14.3464 74.2401 13.1872 74.7282 12.1957C75.224 11.1966 75.918 10.4224 76.8104 9.87329C77.7103 9.32416 78.759 9.04959 79.9564 9.04959C81.1615 9.04959 82.2102 9.32416 83.1025 9.87329C83.9949 10.4224 84.6889 11.1966 85.1847 12.1957C85.6804 13.1872 85.9283 14.3464 85.9283 15.6735C85.9283 16.9853 85.6804 18.137 85.1847 19.1285C84.6889 20.12 83.9949 20.8903 83.1025 21.4394C82.2102 21.9886 81.1615 22.2631 79.9564 22.2631ZM79.9564 20.1696C80.742 20.1696 81.3903 19.9636 81.9013 19.5518C82.4123 19.1399 82.7898 18.5946 83.0339 17.9158C83.2856 17.2294 83.4114 16.482 83.4114 15.6735C83.4114 14.8498 83.2856 14.0948 83.0339 13.4083C82.7898 12.7219 82.4123 12.1728 81.9013 11.7609C81.3903 11.3491 80.742 11.1432 79.9564 11.1432C79.1785 11.1432 78.534 11.3491 78.023 11.7609C77.5197 12.1728 77.1421 12.7219 76.8904 13.4083C76.6388 14.0948 76.5129 14.8498 76.5129 15.6735C76.5129 16.482 76.6388 17.2294 76.8904 17.9158C77.1421 18.5946 77.5197 19.1399 78.023 19.5518C78.534 19.9636 79.1785 20.1696 79.9564 20.1696ZM92.9705 9.20976V11.2118H85.9919V9.20976H92.9705ZM87.8566 6.16664H90.3392V18.2476C90.3392 18.8349 90.4612 19.2658 90.7053 19.5403C90.9493 19.8073 91.3421 19.9407 91.8836 19.9407C92.0133 19.9407 92.1506 19.9331 92.2955 19.9179C92.448 19.9026 92.6006 19.8797 92.7531 19.8492L93.2221 21.9085C92.9705 21.9924 92.6959 22.0572 92.3984 22.103C92.101 22.1487 91.8035 22.1716 91.5061 22.1716C90.4002 22.1716 89.5155 21.8627 88.852 21.2449C88.1884 20.6195 87.8566 19.7882 87.8566 18.751V6.16664ZM99.4406 22.2631C98.1898 22.2631 97.1068 21.9924 96.1916 21.4509C95.2764 20.9094 94.5709 20.1467 94.0751 19.1628C93.587 18.1713 93.3429 17.0158 93.3429 15.6964C93.3429 14.3846 93.5832 13.2291 94.0637 12.23C94.5518 11.2309 95.2344 10.4529 96.1115 9.89618C96.9962 9.33179 98.0335 9.04959 99.2233 9.04959C99.9478 9.04959 100.649 9.16781 101.328 9.40424C102.007 9.64068 102.617 10.0144 103.159 10.5254C103.7 11.0364 104.127 11.6999 104.44 12.516C104.76 13.3321 104.921 14.3159 104.921 15.4676V16.3599H94.7501V14.4952H103.639L102.484 15.1129C102.484 14.3274 102.362 13.6333 102.118 13.0308C101.874 12.4283 101.508 11.9592 101.019 11.6237C100.539 11.2804 99.9402 11.1088 99.2233 11.1088C98.5063 11.1088 97.8924 11.2804 97.3814 11.6237C96.878 11.9669 96.4928 12.4207 96.2259 12.9851C95.959 13.5494 95.8255 14.1672 95.8255 14.8384V16.1083C95.8255 16.9853 95.978 17.729 96.2831 18.3391C96.5882 18.9493 97.0115 19.4145 97.553 19.7348C98.1021 20.0552 98.739 20.2153 99.4635 20.2153C99.9364 20.2153 100.363 20.1467 100.745 20.0094C101.134 19.8721 101.469 19.6662 101.752 19.3916C102.034 19.117 102.247 18.7777 102.392 18.3734L104.749 18.8196C104.558 19.506 104.223 20.1085 103.742 20.6272C103.262 21.1458 102.655 21.55 101.923 21.8398C101.199 22.122 100.371 22.2631 99.4406 22.2631Z" fill="#15101F"/>
  </svg>
</a>`;

interface ShellV2Options {
  /** Hidden preview text shown in inbox preview before the body. */
  preheader?: string;
  /** Inner content — raw HTML, expected to be one or more emailCardV2() blocks. */
  content: string;
  /**
   * Unsubscribe link href. Phase 3 wires this up; for now it's a passthrough.
   * Defaults to the placeholder token Phase 3 will substitute.
   */
  unsubscribeUrl?: string;
}

/**
 * V2 email wrapper — Anthropic/Stripe-style receipt layout.
 *
 * Renders: hidden preheader, page-background outer table, centered 560px
 * column, logo header, the content slot, and a centered footer
 * (wordmark + tagline + unsubscribe · annote.ai).
 */
export function emailShellV2({
  preheader,
  content,
  unsubscribeUrl = "{{UNSUBSCRIBE_URL}}",
}: ShellV2Options): string {
  const pre = preheader ?? "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Annote</title>
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_COLORS.pageBackground};font-family:${EMAIL_FONTS.body};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  ${pre ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${pre}</div>` : ""}

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${EMAIL_COLORS.pageBackground};">
    <tr>
      <td align="center" style="padding:${EMAIL_SIZES.outerPaddingVertical}px ${EMAIL_SIZES.outerPaddingHorizontal}px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${EMAIL_SIZES.containerMaxWidth}" style="width:100%;max-width:${EMAIL_SIZES.containerMaxWidth}px;">

          <!-- Header: logo only, 32px gap below -->
          <tr>
            <td style="padding:0 0 32px 0;">
              ${ANNOTE_LOGO_SVG}
            </td>
          </tr>

          <!-- Content slot -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${content}
              </table>
            </td>
          </tr>

          <!-- Footer: wordmark + tagline + unsubscribe -->
          <tr>
            <td align="center" style="padding:40px 0 0 0;text-align:center;">
              <p style="margin:0;font-size:${EMAIL_SIZES.footerFontSize}px;font-weight:500;color:${EMAIL_COLORS.textFooter};line-height:1.4;">Annote</p>
              <p style="margin:4px 0 0 0;font-size:${EMAIL_SIZES.footerFontSize}px;color:${EMAIL_COLORS.textFooter};line-height:1.4;">Capture feedback in a click.</p>
              <p style="margin:16px 0 0 0;font-size:${EMAIL_SIZES.footerFontSize}px;color:${EMAIL_COLORS.textFooter};line-height:1.4;">
                <a href="${unsubscribeUrl}" style="color:${EMAIL_COLORS.textFooter};text-decoration:underline;">Unsubscribe</a>
                <span style="color:${EMAIL_COLORS.hairline};">&nbsp;·&nbsp;</span>
                <a href="https://annote.ai" style="color:${EMAIL_COLORS.textFooter};text-decoration:none;">annote.ai</a>
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

interface CardV2Options {
  /** Raw HTML — expected to be `<tr>...</tr>` rows (composed with other V2 helpers). */
  content: string;
}

/**
 * V2 white card wrapper. Templates compose multiple cards, separating them
 * with emailSpacerV2({ height: 16 }) at the content level.
 */
export function emailCardV2({ content }: CardV2Options): string {
  return `<tr>
  <td style="background-color:${EMAIL_COLORS.cardBackground};border-radius:${EMAIL_SIZES.cardBorderRadius}px;padding:${EMAIL_SIZES.cardPaddingDesktop}px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      ${content}
    </table>
  </td>
</tr>`;
}

interface ButtonV2Options {
  label: string;
  href: string;
  /** "left" (default, body emails) or "full" (transactional, stretches full width). */
  align?: "left" | "full";
}

/**
 * V2 bulletproof CTA button. Table-cell padding pattern (not <a> padding) so
 * it survives Outlook. `align: "full"` stretches the button edge-to-edge.
 */
export function emailButtonV2({
  label,
  href,
  align = "left",
}: ButtonV2Options): string {
  if (align === "full") {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;">
  <tr>
    <td style="background-color:${EMAIL_COLORS.ctaBackground};border-radius:${EMAIL_SIZES.buttonBorderRadius}px;" align="center">
      <a href="${href}" style="display:block;padding:13px 26px;font-size:16px;font-weight:500;color:${EMAIL_COLORS.ctaText};text-decoration:none;line-height:1;text-align:center;">${label}</a>
    </td>
  </tr>
</table>`;
  }

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="background-color:${EMAIL_COLORS.ctaBackground};border-radius:${EMAIL_SIZES.buttonBorderRadius}px;">
      <a href="${href}" style="display:inline-block;padding:13px 26px;font-size:16px;font-weight:500;color:${EMAIL_COLORS.ctaText};text-decoration:none;line-height:1;">${label}</a>
    </td>
  </tr>
</table>`;
}

interface InfoRowV2Options {
  label: string;
  value: string;
  /** Render the value in monospace (receipt/invoice numbers, amounts). */
  mono?: boolean;
}

/** V2 receipt detail row — label left, value right. */
export function emailInfoRowV2({
  label,
  value,
  mono = false,
}: InfoRowV2Options): string {
  return `<tr>
  <td style="padding:8px 0;font-size:${EMAIL_SIZES.secondaryFontSize}px;color:${EMAIL_COLORS.textSecondary};line-height:1.4;">${label}</td>
  <td align="right" style="padding:8px 0;font-size:${EMAIL_SIZES.secondaryFontSize}px;color:${EMAIL_COLORS.textPrimary};font-weight:500;line-height:1.4;${mono ? `font-family:${EMAIL_FONTS.mono};` : ""}">${value}</td>
</tr>`;
}

/**
 * V2 hairline rule. Emits a row whose top border is the divider; the 24px
 * top padding is the gap above it. Place between content sections in a card.
 */
export function emailDividerV2(): string {
  return `<tr>
  <td style="padding:24px 0 0 0;border-top:1px solid ${EMAIL_COLORS.hairline};font-size:0;line-height:0;">&nbsp;</td>
</tr>`;
}

interface SpacerV2Options {
  height: number;
}

/** V2 pure vertical spacer row. */
export function emailSpacerV2({ height }: SpacerV2Options): string {
  return `<tr><td style="height:${height}px;line-height:${height}px;font-size:0;">&nbsp;</td></tr>`;
}

/**
 * V2 text helpers — shared row builders so every template renders the same
 * heading / paragraph / sign-off treatment. These return `<tr>` rows meant to
 * live inside an emailCardV2 content slot.
 */

/** V2 card heading row (h1-equivalent). */
export function emailHeadingV2(text: string): string {
  return `<tr><td style="font-size:20px;font-weight:600;color:${EMAIL_COLORS.textPrimary};line-height:1.3;padding:0 0 16px 0;">${text}</td></tr>`;
}

interface ParagraphV2Options {
  /** Bottom padding below the paragraph. Default 16. Use 0 for the last line before a sign-off. */
  spaceAfter?: number;
}

/** V2 body paragraph row. `html` may contain inline markup (links, <strong>). */
export function emailParagraphV2(
  html: string,
  { spaceAfter = 16 }: ParagraphV2Options = {}
): string {
  return `<tr><td style="font-size:${EMAIL_SIZES.bodyFontSize}px;color:${EMAIL_COLORS.textPrimary};line-height:${EMAIL_SIZES.bodyLineHeight};padding:0 0 ${spaceAfter}px 0;">${html}</td></tr>`;
}

/**
 * V2 sign-off row — the "— Name" or "— Name, Founder, Annote" closer.
 * Rendered in secondary color, slightly separated from the body above.
 */
export function emailSignoffV2(text: string): string {
  return `<tr><td style="font-size:${EMAIL_SIZES.bodyFontSize}px;color:${EMAIL_COLORS.textSecondary};line-height:${EMAIL_SIZES.bodyLineHeight};padding:8px 0 0 0;">${text}</td></tr>`;
}

/** Wraps a button block in a row with standard top spacing inside a card. */
export function emailButtonRowV2(buttonHtml: string): string {
  return `<tr><td style="padding:8px 0 8px 0;">${buttonHtml}</td></tr>`;
}

/** HTML-escape interpolated user data before it goes into an email body. */
export function escapeEmailHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface PlainTextV2Options {
  body: string;
  unsubscribeUrl?: string;
}

/** V2 plain-text wrapper with sign-off footer. */
export function plainTextShellV2({
  body,
  unsubscribeUrl = "{{UNSUBSCRIBE_URL}}",
}: PlainTextV2Options): string {
  return `${body}

---
Capture feedback in a click.
Annote · annote.ai
Unsubscribe: ${unsubscribeUrl}`;
}
