/**
 * Capture-time denylist for user-actions.
 *
 * Two responsibilities:
 *  1. CAPTURED_ATTRIBUTES — the allowlist of element attributes safe (and
 *     useful) to record on every interaction. Anything not in this list is
 *     never captured. Attribute *values* that can carry free text (placeholder,
 *     title, alt, aria-label) are still routed through `redactAction.ts` —
 *     this list controls structure only.
 *
 *  2. Element/event predicates — `isAnnoteElement(el)` walks up the tree
 *     looking for our own shadow host so we don't capture the user
 *     interacting with the Annote widget itself. `isNoisyTag(tag)` flags
 *     the bare html/body backdrop, where a click rarely identifies a real
 *     target.
 *
 * Mirrors the export shape of `../network/denylist.ts` (frozen consts +
 * predicate functions) so the Phase A2 MAIN-world wrapper can drop this in.
 */

/**
 * High-signal element attributes worth recording on every interaction.
 *
 *  - role / aria-label / type — semantic intent (button vs link vs submit)
 *  - href — destination for <a>; also our best handle for "what link did they
 *    click" when the link text is empty (icon-only buttons).
 *  - name — form field identity (the only field-identifying handle we keep
 *    for input events, since values are deliberately never captured).
 *  - title / alt / placeholder — accessible labels; values get redacted but
 *    structure is kept.
 */
export const CAPTURED_ATTRIBUTES: readonly string[] = Object.freeze([
  "role",
  "aria-label",
  "type",
  "href",
  "name",
  "title",
  "alt",
  "placeholder",
]);

/**
 * Tags that are too generic to be useful as click targets.
 *
 * Clicks bubble up to the document, so a click on whitespace would otherwise
 * record an interaction with <html> or <body>. Filtering these at the leaf
 * (the actual event.target) keeps the timeline focused on real components.
 * If a real interactive widget has html/body as event.target we'd rather lose
 * that one click than spam every empty-space click into the buffer.
 */
const NOISY_TAGS: ReadonlySet<string> = new Set(["html", "body"]);

export function isNoisyTag(tag: string | null | undefined): boolean {
  if (!tag) return false;
  return NOISY_TAGS.has(tag.toLowerCase());
}

/**
 * The id of the shadow host that contains the entire Annote widget. Defined
 * in `bootstrap.ts` (SHADOW_HOST_ID); duplicated here to keep this module
 * standalone (no MAIN-world dependency — important for unit testing).
 */
export const ANNOTE_SHADOW_HOST_ID = "echly-shadow-host";

/**
 * True if `el` is inside the Annote widget's own shadow host (or *is* the
 * host). We want to ignore the user clicking around inside our own UI —
 * those events are widget-internal, not user-page interactions.
 *
 * Walks up the parent chain rather than relying on event.composedPath() so
 * the predicate is usable from any event handler (and from tests with
 * minimal DOM stubs). Defensive against null parents and exotic node types
 * (DocumentFragment, ShadowRoot) — anything that doesn't expose a
 * `parentElement` simply ends the walk.
 */
export function isAnnoteElement(el: Element | null | undefined): boolean {
  if (!el) return false;
  let cursor: Element | null = el;
  // Bound the walk so a malformed DOM (cyclic parents — shouldn't happen but
  // not worth crashing over) can't spin forever. 64 is well above realistic
  // DOM depths.
  let hops = 0;
  while (cursor && hops < 64) {
    if (cursor.id === ANNOTE_SHADOW_HOST_ID) return true;
    cursor = cursor.parentElement;
    hops++;
  }
  return false;
}
