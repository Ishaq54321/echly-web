/**
 * Action-surface redaction.
 *
 * Wraps the existing console and network redaction primitives (`redact` and
 * `redactUrl`) and applies them to the surfaces specific to user-action
 * capture: element visible text, element attribute values, and navigation
 * URLs.
 *
 * No new PII regex is defined here — everything routes through the shared
 * pipeline in `../console/redact.ts` (which network also reuses via
 * `../network/redactNetwork.ts`). If a future maintainer is tempted to add a
 * new pattern here, add it to `console/redact.ts` instead so all three
 * capture streams benefit.
 */

import { redact } from "../console/redact";
import { redactUrl as networkRedactUrl } from "../network/redactNetwork";

/** Hard cap on captured element text. Matches Jam's posture — enough to
 *  identify the button, not enough to leak prose. */
export const ELEMENT_TEXT_MAX_CHARS = 80;

/**
 * Attribute names that can contain free-form text and therefore need their
 * VALUES redacted. The names themselves are always preserved (we want to
 * see "this had a placeholder" without seeing what it said).
 *
 * Names not in this set (role, type, name) are treated as structural —
 * passed through unchanged — because their values are conventionally short
 * identifiers, not user-visible text.
 */
const FREE_TEXT_ATTRS: ReadonlySet<string> = new Set([
  "placeholder",
  "title",
  "alt",
  "aria-label",
  "href",
]);

function truncate(s: string, maxChars: number): string {
  if (s.length <= maxChars) return s;
  // Reserve 1 char for the ellipsis so the visible width still respects the cap.
  return s.slice(0, Math.max(0, maxChars - 1)) + "…";
}

/**
 * Run an element's visible text through the shared PII pipeline and
 * truncate to ELEMENT_TEXT_MAX_CHARS.
 *
 * Collapses internal whitespace runs before truncating so a button with
 * indented multi-line text content doesn't waste the budget on whitespace.
 */
export function redactElementText(text: string | null | undefined): string {
  if (!text) return "";
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (!collapsed) return "";
  const redacted = redact(collapsed);
  return truncate(redacted, ELEMENT_TEXT_MAX_CHARS);
}

/**
 * Redact a captured attribute map.
 *
 * Behavior:
 *  - For attributes in FREE_TEXT_ATTRS: run the VALUE through `redact()`. For
 *    href specifically, route through the network URL redactor so sensitive
 *    query params (`?token=…`) get masked even when the href isn't otherwise
 *    PII-bearing.
 *  - For all other captured attributes (role, type, name): pass through
 *    unchanged. These are structural identifiers and shouldn't change shape.
 *  - Names are preserved exactly as supplied.
 */
export function redactAttributes(
  attrs: Record<string, string> | null | undefined,
): Record<string, string> {
  if (!attrs) return {};
  const out: Record<string, string> = {};
  for (const name in attrs) {
    if (!Object.prototype.hasOwnProperty.call(attrs, name)) continue;
    const value = attrs[name];
    if (typeof value !== "string") {
      // Defensive: attrs are typed as Record<string,string> but a caller may
      // hand us coerced data. Skip non-strings rather than crash.
      continue;
    }
    const lower = name.toLowerCase();
    if (lower === "href") {
      out[name] = networkRedactUrl(value);
      continue;
    }
    if (FREE_TEXT_ATTRS.has(lower)) {
      out[name] = redact(value);
      continue;
    }
    out[name] = value;
  }
  return out;
}

/**
 * Redact a navigation URL. Thin re-export of the network module's URL
 * redactor — declared here so callers don't reach across feature folders,
 * and so a future change to action-specific URL handling has an obvious home.
 */
export function redactUrl(url: string | null | undefined): string {
  if (!url) return "";
  return networkRedactUrl(url);
}
