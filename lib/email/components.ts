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

// Annote brand header — solid-black logomark + "Annote" wordmark in HTML text.
// Gmail strips inline <svg>, so the icon is a PNG (public/email/annote-logomark-black.png,
// 48x48 source, displayed at 24x24). Wordmark is HTML so it stays selectable
// and crisp, and screen readers say "Annote" once (img has alt=""). Layout is
// table-based so Outlook renders the gap correctly; flex/inline-flex are
// unreliable in email clients.
const logomarkSrc = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai"}/email/annote-logomark-black.png`;
const ANNOTE_BRAND_HEADER = `<a href="https://annote.ai" style="text-decoration:none;color:#15101F;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="vertical-align:middle;padding:0;"><img src="${logomarkSrc}" width="24" height="24" alt="" style="display:block;border:0;outline:none;text-decoration:none;" /></td>
    <td style="vertical-align:middle;padding:0 0 0 10px;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;color:#15101F;letter-spacing:-0.01em;line-height:24px;">Annote</td>
  </tr></table>
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
  /**
   * Card-header strip rendered inside the first card, above body content.
   * Tier 1 (category) is the small muted label; tier 2 (title) is the big
   * heading; tier 3 (metadata) is an optional small muted line below.
   *
   * Templates own their own card composition (some emit multiple cards), so
   * this header is rendered as a standalone card row above whatever `content`
   * provides. When all three are omitted, no strip is rendered and shell
   * behavior matches the pre-migration layout.
   *
   * `metadata` is raw HTML (templates may include bullets, em-dashes, quoted
   * names); `category` and `title` are HTML-escaped.
   */
  category?: string;
  title?: string;
  metadata?: string;
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
  category,
  title,
  metadata,
}: ShellV2Options): string {
  const pre = preheader ?? "";

  // Header strip (Direction C): category → title → metadata stacked above body.
  // Rendered as its own emailCardV2-shaped row prepended to content; sits flush
  // above the templates' existing cards inside the shared inner table.
  // Composed only when category or title is provided so the pre-migration
  // layout (just a card with inline H1) keeps working untouched.
  let headerStripRow = "";
  if (category || title) {
    const titleMarginBottom = metadata ? "6px" : "16px";
    const innerRows = [
      category
        ? `<p style="margin:0 0 6px 0;font-size:13px;color:${EMAIL_COLORS.textSecondary};font-weight:400;line-height:1.4;letter-spacing:0;">${escapeEmailHtml(category)}</p>`
        : "",
      title
        ? `<h1 style="margin:0 0 ${titleMarginBottom} 0;font-size:24px;color:${EMAIL_COLORS.textPrimary};font-weight:500;letter-spacing:-0.01em;line-height:1.3;">${escapeEmailHtml(title)}</h1>`
        : "",
      metadata
        ? `<p style="margin:0;font-size:13px;color:${EMAIL_COLORS.textSecondary};font-weight:400;line-height:1.4;">${metadata}</p>`
        : "",
    ].join("");

    // Render as a standalone card (fully rounded) above the body cards, with
    // an 8px spacer separating them. Architecting it as a literal "inside the
    // first card" injection would require changing every template's content;
    // the stacked-card variant preserves the visual hierarchy (header strip
    // grouped above body) without coupling the shell to template internals.
    headerStripRow = `<tr>
      <td style="background-color:${EMAIL_COLORS.cardBackground};border-radius:${EMAIL_SIZES.cardBorderRadius}px;padding:${EMAIL_SIZES.cardPaddingDesktop}px;">
        ${innerRows}
      </td>
    </tr>
    <tr><td style="height:8px;line-height:8px;font-size:0;">&nbsp;</td></tr>`;
  }

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

          <!-- Header: brand strip (logomark + "Annote"), 32px gap below -->
          <tr>
            <td style="padding:0 0 32px 0;">
              ${ANNOTE_BRAND_HEADER}
            </td>
          </tr>

          <!-- Content slot — optional category/title/metadata strip prepended -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${headerStripRow}
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
