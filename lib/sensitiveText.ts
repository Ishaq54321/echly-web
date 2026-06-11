/**
 * Sensitive-pattern masking for DOM-derived capture text (subtreeText,
 * childrenList names, semantic identifiers, input values) before it leaves
 * the page.
 *
 * Mirrors the visible-text subset of the extension console redaction
 * patterns (annote-extension/src/console/redact.ts) — kept as a separate
 * module because the web app must not import extension source. The
 * console-only patterns (Authorization/Cookie headers, query-string secrets)
 * are deliberately omitted: they describe wire traffic, not rendered text.
 *
 * The bar here is NARROW masking: emails, cards, phone numbers, tokens —
 * never general text. Copy-edit grounding depends on the surrounding prose
 * surviving verbatim ("change 'Contact us at <email>' to ..." still grounds).
 */

const SENSITIVE_TEXT_PATTERNS: ReadonlyArray<{ pattern: RegExp; replacement: string }> =
  Object.freeze([
    // JWT — three base64url segments, anchored on the usual "eyJ" header.
    { pattern: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, replacement: "<jwt>" },
    // Email — permissive RFC-ish match.
    { pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, replacement: "<email>" },
    // Credit card — 13-19 digits with optional separators; no Luhn check
    // (over-redaction is the accepted trade, matching redact.ts).
    { pattern: /(?<![0-9])(?:[0-9]{4}[-\s]?){3}[0-9]{1,7}(?![0-9])/g, replacement: "<card>" },
    // Phone — separated groupings, conservative against short numeric IDs.
    {
      pattern: /(?<![0-9])(?:\+?[1-9][0-9]{0,2}[-\s.]?)?\(?[0-9]{3}\)?[-\s.][0-9]{3}[-\s.][0-9]{4}(?![0-9])/g,
      replacement: "<phone>",
    },
    // E.164 standalone.
    { pattern: /(?<![0-9])\+[1-9][0-9]{7,14}(?![0-9])/g, replacement: "<phone>" },
    // API key prefixes (Stripe, GitHub, Slack).
    {
      pattern: /\b(?:sk_live_|sk_test_|pk_live_|pk_test_|ghp_|gho_|ghu_|ghs_|xox[bpa]-)[A-Za-z0-9_-]+/g,
      replacement: "<key>",
    },
  ]);

/**
 * Masks sensitive substrings in capture text. Null-safe; returns the input
 * unchanged when nothing matches, so ordinary copy never degrades.
 */
export function maskSensitiveText(text: string): string;
export function maskSensitiveText(text: string | null): string | null;
export function maskSensitiveText(text: string | null): string | null {
  if (!text) return text;
  let out = text;
  for (const { pattern, replacement } of SENSITIVE_TEXT_PATTERNS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}
