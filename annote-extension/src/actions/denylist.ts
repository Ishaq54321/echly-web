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
 * in `bootstrap.ts` / `content.tsx` (SHADOW_HOST_ID); duplicated here to keep
 * this module standalone (no MAIN-world dependency — important for unit testing).
 */
export const ANNOTE_SHADOW_HOST_ID = "echly-shadow-host";

/**
 * Marker attribute set on BOTH the Annote shadow host and the inner React root
 * (`content.tsx` sets `data-annote-ui="true"` on each). A second, id-independent
 * handle for "this is our own UI" — used so the skip still fires if the host id
 * is ever changed/stripped, and so the inner root counts even when matched
 * directly.
 */
export const ANNOTE_UI_MARKER_ATTR = "data-annote-ui";

/**
 * True if `node` IS an Annote-UI host element: the shadow host (by id) or any
 * element carrying the data-annote-ui marker. SPECIFIC to our own widget — a
 * foreign page Web Component (Stripe Elements, etc.) has neither, so this never
 * matches legitimate page shadow roots. Tolerates non-Element nodes (returns
 * false) so it's safe to call on any composedPath / getRootNode().host entry.
 */
export function isAnnoteHostNode(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const el = node as Partial<Element> & {
    nodeType?: number;
    getAttribute?: (n: string) => string | null;
  };
  // Skip nodes that are DEFINITELY not elements (Document=9, ShadowRoot=11,
  // etc.) so a composedPath() entry can't make us touch id/getAttribute on a
  // non-element. We only skip when nodeType is present AND not ELEMENT_NODE(1);
  // a node with no nodeType (minimal DOM test stub) still gets the id/marker
  // check — the predicate's documented stub contract.
  if (typeof el.nodeType === "number" && el.nodeType !== 1) return false;
  if (el.id === ANNOTE_SHADOW_HOST_ID) return true;
  try {
    if (typeof el.getAttribute === "function" && el.getAttribute(ANNOTE_UI_MARKER_ATTR) != null) {
      return true;
    }
  } catch {
    // exotic element — fall through
  }
  return false;
}

/**
 * True if `el` is inside the Annote widget's own shadow host (or *is* the
 * host). We want to ignore the user clicking around inside our own UI —
 * those events are widget-internal, not user-page interactions.
 *
 * Walks up the parent chain AND crosses shadow boundaries via getRootNode():
 * `resolveTarget` (mainWorldActions) returns composedPath()[0], i.e. the node
 * DEEP INSIDE our shadow tree, whose parentElement chain dies at the shadow
 * root and never reaches the light-DOM host. So when the parent walk hits the
 * top of a shadow tree we hop to that ShadowRoot's `.host` and continue —
 * handling arbitrarily-nested shadow roots. This is the OUT-of-shadow crossing
 * the old parentElement-only walk could not do (the widget self-capture bug,
 * Fix B). For event handlers the composed-path check (isAnnoteComposedPath) is
 * the primary guard; this remains the fallback and powers the descriptor path.
 *
 * Defensive against null parents and cyclic chains (bounded hop count).
 */
export function isAnnoteElement(el: Element | null | undefined): boolean {
  if (!el) return false;
  let cursor: Element | null = el;
  // Bound the walk so a malformed DOM (cyclic parents — shouldn't happen but
  // not worth crashing over) can't spin forever. 64 is well above realistic
  // DOM depths, even across a few nested shadow roots.
  let hops = 0;
  while (cursor && hops < 64) {
    if (isAnnoteHostNode(cursor)) return true;
    const parentEl: Element | null = cursor.parentElement;
    if (parentEl) {
      cursor = parentEl;
    } else {
      // No parentElement: we may be at the top of a shadow tree. Cross OUT to
      // the host via getRootNode().host and keep walking; otherwise stop.
      let host: Element | null = null;
      try {
        const rootNode: Node | null =
          typeof cursor.getRootNode === "function" ? cursor.getRootNode() : null;
        // `ShadowRoot` is undefined in non-DOM test runtimes; guard before instanceof.
        if (
          rootNode &&
          typeof ShadowRoot !== "undefined" &&
          rootNode instanceof ShadowRoot
        ) {
          host = rootNode.host;
        }
      } catch {
        host = null;
      }
      if (!host || host === cursor) return false;
      cursor = host;
    }
    hops++;
  }
  return false;
}

/**
 * True if ANY node in a composed event path is an Annote-UI host. This is the
 * primary, most-robust skip for event handlers: composedPath() lists the full
 * retargeted path including our shadow host, so a single membership check
 * covers clicks/inputs/focus on every tray control regardless of how deep in
 * the shadow tree the real target sits. SPECIFIC to our host markers, so
 * legitimate page Web Components in the path are NOT skipped (Fix B constraint).
 */
export function isAnnoteComposedPath(path: ArrayLike<unknown> | null | undefined): boolean {
  if (!path) return false;
  try {
    for (let i = 0; i < path.length; i++) {
      if (isAnnoteHostNode(path[i])) return true;
    }
  } catch {
    // malformed path — treat as not-ours (capture rather than silently drop)
  }
  return false;
}
