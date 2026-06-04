/**
 * Privacy-aware serialization of DOM elements logged to the console.
 *
 * The console stringifier (mainWorld.ts) short-circuits DOM nodes to a
 * `<tag>` form instead of walking the whole subtree. Phase R2 makes that
 * short-circuit privacy-aware: when the logged value is a DOM Element inside
 * a region a customer has marked private (data-private / .fs-block /
 * .fs-mask / etc.), we must not leak its tag/attributes/text into the console
 * buffer the same way the user-actions surface already honors those markers.
 *
 * Why only Elements (not all Nodes): `getPrivacyTreatment` walks
 * `parentElement` and calls `matches()`, both of which only exist on
 * Element. Text nodes, comments, and the document/fragment nodes carry no
 * privacy markers of their own, so for those we keep the existing nodeName
 * behavior. The real, attributable case Phase R2 targets is
 * `console.log(someElement)` / `console.log("state", domNode)` where the node
 * lives inside a private panel.
 *
 * Treatment mapping (mirrors the actions descriptor in
 * ../actions/mainWorldActions.ts buildDescriptor):
 *  - "block" → "<hidden element>"   (no tag, no attributes, no text)
 *  - "mask"  → "<tag>"              (structure only — same as the pre-R2
 *                                    behavior, which never emitted attrs/text)
 *  - "allow" → "<tag>"              (unchanged pre-R2 behavior)
 *
 * Note: pre-R2 the stringifier already emitted only `<tag>` for elements —
 * never attributes or text — so "mask" and "allow" render identically here.
 * The behavioral change R2 introduces is the "block" case, which previously
 * leaked the tag of an element inside a blocked region. We keep the explicit
 * three-way mapping anyway so the intent is legible and so a future change to
 * the element serializer (e.g. adding id/classes) inherits the right gate.
 */

import { getPrivacyTreatment } from "../shared/privacy";

/** Marker emitted for elements inside a "block" privacy region. */
export const HIDDEN_ELEMENT = "<hidden element>";

/**
 * Serialize a DOM node to its short console form, honoring privacy markers
 * for Elements. Never throws — any failure falls back to a structural marker
 * so a console wrapper can't break the page.
 */
export function serializeNode(node: unknown): string {
  // Only Elements carry privacy markers and support matches()/parentElement.
  if (typeof Element !== "undefined" && node instanceof Element) {
    let treatment: "block" | "mask" | "allow";
    try {
      treatment = getPrivacyTreatment(node);
    } catch {
      // Fail-private: if treatment resolution throws on an exotic element,
      // withhold details rather than risk leaking from a private region.
      return HIDDEN_ELEMENT;
    }
    if (treatment === "block") {
      return HIDDEN_ELEMENT;
    }
    // mask + allow → structure only. Reading tagName can throw on cross-realm
    // or partially-constructed custom elements; guard it.
    try {
      const tag = node.tagName ? node.tagName.toLowerCase() : node.nodeName;
      return `<${tag}>`;
    } catch {
      return HIDDEN_ELEMENT;
    }
  }
  // Non-Element nodes (text, comment, document, fragment) — no privacy marker
  // to consult. Preserve the pre-R2 behavior: nodeName-derived tag.
  try {
    const n = node as Node;
    const tag = (n as Element).tagName ? (n as Element).tagName.toLowerCase() : n.nodeName;
    return `<${tag}>`;
  } catch {
    return "<node>";
  }
}
