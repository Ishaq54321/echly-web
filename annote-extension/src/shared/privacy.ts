/**
 * Privacy-attribute resolution for captured elements.
 *
 * Implements the cross-vendor convention for marking DOM subtrees as
 * private. The selector vocabulary borrows from the major session-replay
 * tools so customers who already annotate their pages for FullStory /
 * LogRocket / rrweb don't have to learn a second one.
 *
 * Treatments:
 *  - "block"  → action is recorded but element details are fully withheld
 *               (no text, no attributes; `masked: true` on the descriptor).
 *               Use for entire panels — credit card forms, account pages.
 *  - "mask"   → element structure (tag) is kept but text + identifying
 *               attributes (placeholder, title, alt, aria-label) are
 *               withheld. Use for individual sensitive fields (passwords).
 *  - "allow"  → normal capture. Default for elements with no privacy
 *               ancestor.
 *
 * Unmask-wins semantics: an element matching an "unmask" selector overrides
 * any ancestor mask/block. Lets customers carve a small public region out
 * of a wider private subtree (e.g. mask the whole settings panel but allow
 * the "save" button so we can see it was clicked).
 *
 * This module is STANDALONE — no MAIN-world globals, no widget dependencies.
 * It lives under `src/shared/` (not under any one capture feature) precisely
 * because more than one surface consults it: the user-actions capture script
 * (`../actions/mainWorldActions.ts`) gates element descriptors on it, and the
 * console capture script (`../console/mainWorld.ts`) gates serialization of
 * logged DOM elements on it (Phase R2). Each MAIN-world bundle tree-shakes
 * `getPrivacyTreatment` in independently; there is no shared runtime, only
 * shared source.
 */

/**
 * Privacy selector vocabulary. Origin annotations:
 *  - data-private          → rrweb convention
 *  - .fs-exclude           → FullStory
 *  - .fs-block             → FullStory
 *  - .fs-mask              → FullStory
 *  - .fs-unmask            → FullStory
 *  - [data-rr-is-password] → rrweb's password-input marker
 *  - [data-annote-mask]    → Annote's own opt-in (for customers who don't
 *                            want to depend on third-party class names).
 *
 * "block" and "exclude" semantically collapse to the same thing here:
 * record the event, withhold the element. We keep both selector forms so
 * customers don't have to migrate existing markup.
 */
export const PRIVACY_SELECTORS = Object.freeze({
  block: Object.freeze([
    "[data-private]",
    ".fs-exclude",
    ".fs-block",
    "[data-annote-mask]",
  ]),
  mask: Object.freeze([
    ".fs-mask",
    "[data-rr-is-password]",
  ]),
  unmask: Object.freeze([
    ".fs-unmask",
  ]),
});

export type PrivacyTreatment = "block" | "mask" | "allow";

/**
 * Defensive `matches()` — wraps the DOM call in try/catch so a malformed
 * selector on an exotic element (SVG with non-standard attributes,
 * cross-realm nodes) can never throw out of the capture pipeline.
 */
function safeMatches(el: Element, selector: string): boolean {
  try {
    if (typeof el.matches !== "function") return false;
    return el.matches(selector);
  } catch {
    return false;
  }
}

function matchesAny(el: Element, selectors: readonly string[]): boolean {
  for (const sel of selectors) {
    if (safeMatches(el, sel)) return true;
  }
  return false;
}

/**
 * Resolve the privacy treatment for `el`.
 *
 * Walks from the element up through its ancestors. The walk has three jobs:
 *  1. Catch an unmask match on the element itself — short-circuit to "allow".
 *  2. Find the closest ancestor (including the element) matching block/mask.
 *  3. If a mask/block ancestor exists, check whether an intermediate ancestor
 *     (between the element and that mask/block) matches unmask — if so, the
 *     unmask wins for this element.
 *
 * Unmask-wins logic, stated precisely:
 *   For element E, let A_block_or_mask = closest ancestor of E (or E itself)
 *   matching any block/mask selector. Let A_unmask = closest ancestor of E
 *   (or E itself) matching any unmask selector. If A_unmask exists AND is at
 *   least as close to E as A_block_or_mask (i.e. encountered first on the
 *   upward walk), unmask wins → return "allow". Otherwise return the
 *   treatment of A_block_or_mask, or "allow" if there is none.
 *
 * Implementation note: a single bottom-up walk is enough. We track the first
 * privacy match we hit and stop at the first unmask OR block/mask ancestor —
 * whichever comes first — because "closer wins" for both directions.
 */
export function getPrivacyTreatment(el: Element | null | undefined): PrivacyTreatment {
  if (!el) return "allow";

  let cursor: Element | null = el;
  // Bound depth to defend against pathological DOMs.
  let hops = 0;
  while (cursor && hops < 256) {
    // Check unmask FIRST at every level. If an unmask appears on the same
    // ancestor or before any block/mask ancestor, it wins for this element.
    if (matchesAny(cursor, PRIVACY_SELECTORS.unmask)) {
      return "allow";
    }
    if (matchesAny(cursor, PRIVACY_SELECTORS.block)) {
      return "block";
    }
    if (matchesAny(cursor, PRIVACY_SELECTORS.mask)) {
      return "mask";
    }
    cursor = cursor.parentElement;
    hops++;
  }
  return "allow";
}
