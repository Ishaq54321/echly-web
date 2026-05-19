/**
 * Context auto-capture for region feedback: URL, scroll, viewport, selected-element subtree text.
 * Enables AI-level scene detail: "On /pricing at 1440px, CTA under card #2 has alignment issue."
 */
import { ECHLY_DEBUG } from "@/lib/utils/logger";

export type SemanticType =
  | "button"
  | "link"
  | "input"
  | "heading"
  | "paragraph"
  | "image"
  | "icon"
  | "card"
  | "section";

export type CaptureContext = {
  url: string;
  scrollX: number;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  screenWidth?: number;
  screenHeight?: number;
  /** Visible text from the DOM subtree of the selected element (Ring 1 — clicked element + descendants). */
  subtreeText: string | null;
  /** Best human-readable name for the clicked element (aria-label, alt, title, placeholder, or innerText). */
  semanticIdentifier?: string | null;
  /** Computed styles (color, background, font-size, padding, size) for the clicked element. */
  computedStyles?: string | null;
  /** Structured list of meaningful direct children of the clicked element (tag, name, brief styles). Empty when the element has fewer than 2 meaningful children. */
  childrenList?: string | null;
  /** ARIA state of the clicked element (checked, expanded, selected, pressed, current). */
  elementState?: string | null;
  /** Semantic type of the clicked element (button, link, input, heading, paragraph, image, icon, card, section). */
  semanticType?: SemanticType | null;
  /** "disabled" if element has disabled or aria-disabled, otherwise empty. */
  disabledState?: string | null;
  /** Modal/dialog/popover context when element is inside one. */
  modalContext?: string | null;
  /** Current value of the input element (with privacy filtering). */
  inputValue?: string | null;
  /** Iframe context when element is inside an embedded frame. */
  iframeContext?: string | null;
  capturedAt: number;
  /** When set, OCR should run on this image (e.g. selection crop) instead of the UI screenshot. */
  ocrImageDataUrl?: string | null;
  /** Pin position as percentage of container (0–100) for annotation placement. */
  pinPosition?: { xPercent: number; yPercent: number } | null;
};

const MAX_SUBTREE_CHARS = 2000;

const SKIP_TAGS = new Set(["script", "style", "noscript", "iframe", "svg"]);

/**
 * Common CSS values that are either browser defaults or so universal they
 * carry no signal. Suppress these from captured styles to reduce noise.
 *
 * The principle: if a value is the CSS default OR if it appears on virtually
 * every element on a page, it's likely not deliberate styling and shouldn't
 * be sent to AI.
 */
const LIKELY_DEFAULT_VALUES: Record<string, Set<string>> = {
  "font-weight": new Set(["400", "normal"]),
  "font-style": new Set(["normal"]),
  "text-align": new Set(["start", "left"]),
  "text-decoration": new Set(["none", "none solid"]),
  "opacity": new Set(["1"]),
  "cursor": new Set(["auto", "default"]),
  "display": new Set(["block", "inline"]),
};

function isLikelyDefault(property: string, value: string): boolean {
  const defaults = LIKELY_DEFAULT_VALUES[property];
  if (!defaults) return false;
  const v = value.trim().toLowerCase();
  return defaults.has(v);
}

/**
 * True if the node belongs to Echly extension UI (overlay, toolbar, shadow root).
 * Used so DOM capture never includes extension UI in subtreeText.
 */
export function isAnnoteElement(node: Node | Element | null): boolean {
  if (!node) return false;
  const el = node instanceof Element ? node : (node as Node).parentElement;
  if (!el) return false;
  const target = node instanceof Element ? node : el;
  if (target.id && String(target.id).toLowerCase().startsWith("echly")) return true;
  const cn = target.className;
  if (cn && typeof cn === "string" && cn.includes("echly")) return true;
  if (target instanceof Element && target.getAttribute?.("data-annote-ui") != null) return true;
  if (target instanceof Element && target.closest?.("[data-annote-ui]")) return true;
  const root = target.getRootNode?.();
  if (root && root instanceof ShadowRoot && isAnnoteElement(root.host)) return true;
  return false;
}

/**
 * Converts an rgb() or rgba() string to hex format.
 *
 * Examples:
 *   rgb(255, 0, 0) → #FF0000
 *   rgb(22, 0, 217) → #1600D9
 *   rgba(255, 0, 0, 0.5) → #FF0000 (alpha dropped — most tickets don't need it)
 *   rgba(0, 0, 0, 0) → empty string (fully transparent — treat as no color)
 *
 * Returns the original string if parsing fails (graceful fallback).
 */
function rgbToHex(rgbStr: string): string {
  if (!rgbStr) return "";

  const match = rgbStr.match(
    /rgba?\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)/i
  );

  if (!match) return rgbStr;

  const r = Math.round(parseFloat(match[1]));
  const g = Math.round(parseFloat(match[2]));
  const b = Math.round(parseFloat(match[3]));
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

  if (a === 0) return "";

  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  const toHex = (n: number) =>
    clamp(n).toString(16).padStart(2, "0").toUpperCase();

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Rounds a pixel string value to the nearest whole pixel.
 * Handles subpixel rendering noise (e.g., "0.99999px" → "1px").
 *
 * Special case: subpixel borders below 1px round UP to 1px since they're
 * still visible to users.
 */
function roundPixelValue(value: string): string {
  if (!value) return value;

  if (value.includes(" ")) {
    return value.split(" ").map((v) => roundPixelValue(v)).join(" ");
  }

  const match = value.trim().match(/^(-?\d*\.?\d+)(px|rem|em|%)?$/);
  if (!match) return value;

  const num = parseFloat(match[1]);
  const unit = match[2] || "px";

  if (isNaN(num)) return value;

  if (unit === "px") {
    if (num > 0 && num < 1) return `1px`;
    if (num < 0 && num > -1) return `-1px`;
    return `${Math.round(num)}px`;
  }

  if (unit === "%") {
    const rounded = Math.round(num);
    if (Math.abs(num - rounded) < 0.01) return `${rounded}%`;
    return value;
  }

  return `${Math.round(num * 100) / 100}${unit}`;
}

/**
 * Rounds opacity to one decimal place (e.g., 0.49999 → 0.5).
 */
function roundOpacityValue(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return String(Math.round(num * 10) / 10);
}

function isHidden(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return true;
  if (el.getAttribute?.("aria-hidden") === "true") return true;
  const style = el.ownerDocument?.defaultView?.getComputedStyle?.(el);
  if (!style) return false;
  if (style.display === "none" || style.visibility === "hidden") return true;
  return false;
}

/**
 * Extracts user-visible semantic identifier.
 * Priority: aria-label > alt > title > placeholder > innerText (with safety rules)
 *
 * Safety: If the element has 2+ element children (it's a container, not a leaf),
 * the innerText fallback is skipped. This prevents semanticIdentifier from
 * becoming a noisy paragraph of combined child text.
 *
 * The innerText fallback is also capped shorter (60 chars vs 120) to avoid
 * confusing the AI when it does fire.
 */
export function getSemanticIdentifier(el: Element | null): string {
  if (!el) return "";

  const ariaLabel = el.getAttribute("aria-label")?.trim();
  if (ariaLabel) return ariaLabel.slice(0, 120);

  const alt = el.getAttribute("alt")?.trim();
  if (alt) return alt.slice(0, 120);

  const title = el.getAttribute("title")?.trim();
  if (title) return title.slice(0, 120);

  const placeholder = el.getAttribute("placeholder")?.trim();
  if (placeholder) return placeholder.slice(0, 120);

  const childrenCount = el.children.length;
  const interactiveTags = new Set([
    "button", "a", "input", "select", "textarea", "label"
  ]);
  const isInteractive = interactiveTags.has(el.tagName.toLowerCase());

  if (childrenCount >= 2 && !isInteractive) {
    return "";
  }

  const innerText = (el as HTMLElement).innerText?.trim();
  if (innerText) return innerText.slice(0, 60);

  return "";
}

/**
 * Returns true if the element has at least one direct (non-whitespace)
 * text node as a child.
 *
 * Different from hasVisibleText which walks the entire subtree. Direct text
 * nodes are what actually paint with the element's own text properties
 * (color, font-size, etc.). When text lives in a child element, that child's
 * properties win — the parent's are phantom.
 *
 * Pattern mirrors isMeaningfulChild and isPureWrapper which already detect
 * direct text nodes.
 */
function hasDirectTextNode(el: Element): boolean {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").trim();
      if (text.length > 0) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Walks descendants to find the first element with a direct text node that's
 * actually rendered. Used to compute "effective text color" when the clicked
 * element wraps inner text via child elements.
 *
 * Returns null if no descendant has direct text. Skips hidden descendants.
 */
function findEffectiveTextElement(el: Element): Element | null {
  if (hasDirectTextNode(el)) {
    return el;
  }

  const doc = el.ownerDocument;
  if (!doc) return null;

  try {
    const walker = doc.createTreeWalker(el, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        const elNode = node as Element;
        if (isHidden(elNode)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (hasDirectTextNode(elNode)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      },
    });
    return walker.nextNode() as Element | null;
  } catch {
    return null;
  }
}

/**
 * Returns true if the element contains at least one non-whitespace text node
 * descendant. Used to decide whether text-related computed styles
 * (color, font-size, font-weight) are meaningful for the element.
 *
 * Returns false for media tags (video/img/canvas/svg/...), empty wrappers,
 * and elements whose text is only whitespace.
 */
function hasVisibleText(el: Element | null): boolean {
  if (!el) return false;

  const nonTextTags = new Set([
    "video", "audio", "img", "canvas", "svg", "iframe",
    "embed", "object", "picture", "source", "track",
  ]);
  if (nonTextTags.has(el.tagName.toLowerCase())) return false;

  const doc = el.ownerDocument;
  if (!doc) return false;

  try {
    const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const text = node.textContent?.trim() || "";
        return text.length > 0
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });
    return walker.nextNode() !== null;
  } catch {
    return false;
  }
}

/**
 * Extracts computed styles relevant to common prescriptive feedback
 * (color, size, padding) for the clicked element.
 *
 * If the clicked element is a CONTAINER (2+ meaningful children OR 1 visually
 * distinct child), all computed style properties are stripped — only the
 * dimensions are kept. Container styles are typically inherited defaults that
 * don't represent visible content; the children's per-element brief styles
 * (in childrenList) carry the real visible info.
 *
 * For LEAF elements, all properties (color, bg, font-size, font-weight,
 * padding, dimensions) are captured as usual.
 */
export function extractComputedStyles(win: Window, el: Element | null): string {
  if (!el || !win) return "";
  try {
    const cs = win.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    const meaningfulChildren = unwrapMeaningfulChildren(el);

    // Container = 2+ meaningful children OR 1 visually distinct child
    // Aligned with extractMeaningfulChildren's logic for consistency
    const isContainer =
      meaningfulChildren.length >= 2 ||
      (meaningfulChildren.length === 1 &&
        isVisuallyDistinctFromParent(meaningfulChildren[0], el));

    // Gate text-family properties on DIRECT text nodes, not subtree text.
    // An element wrapping inner text via child elements doesn't actually paint
    // its own color/font — the children do. Also suppress when opacity:0.
    const opacityValue = parseFloat(cs.opacity);
    const isInvisible = opacityValue === 0;
    const elementHasText = !isInvisible && hasDirectTextNode(el);

    // Buttons, links, and interactive elements have their own visual identity
    // (background, padding, border) that IS the visible content — even when
    // they wrap inner divs/spans. Don't strip their styles.
    const isInteractiveLeaf = isButtonLikeElement(el);

    // Selective container stripping:
    // - Strip inherited text properties (color, font-size, font-weight) — these
    //   are usually browser/body defaults bubbling down to the container
    // - Keep intentional layout properties (background, padding, border,
    //   border-radius, box-shadow) — these represent deliberate styling
    const shouldStripTextProperties = isContainer && !isInteractiveLeaf;

    const parts: string[] = [];

    // === TEXT PROPERTIES (skip when container without visual identity) ===

    // Color
    if (!shouldStripTextProperties) {
      const color = cs.color;
      if (color && color !== "rgba(0, 0, 0, 0)" && elementHasText) {
        const hex = rgbToHex(color);
        if (hex) {
          parts.push(`color: ${hex}`);
        }
      }
    }

    // Font-size
    if (!shouldStripTextProperties) {
      const fontSize = cs.fontSize;
      if (fontSize && elementHasText) {
        parts.push(`font-size: ${roundPixelValue(fontSize)}`);
      }
    }

    // Font-weight (skip default 400/normal universally)
    const fontWeight = cs.fontWeight;
    if (
      fontWeight &&
      !isLikelyDefault("font-weight", fontWeight) &&
      elementHasText &&
      !shouldStripTextProperties
    ) {
      parts.push(`font-weight: ${fontWeight}`);
    }

    // Font-style (skip "normal" universally)
    const fontStyle = cs.fontStyle;
    if (
      fontStyle &&
      !isLikelyDefault("font-style", fontStyle) &&
      elementHasText &&
      !shouldStripTextProperties
    ) {
      parts.push(`font-style: ${fontStyle}`);
    }

    // Text-decoration (skip "none" universally)
    const textDecoration = cs.textDecorationLine || cs.textDecoration;
    if (
      textDecoration &&
      !isLikelyDefault("text-decoration", textDecoration) &&
      elementHasText &&
      !shouldStripTextProperties
    ) {
      parts.push(`text-decoration: ${textDecoration}`);
    }

    // Text-align (skip "start"/"left" universally)
    const textAlign = cs.textAlign;
    if (
      textAlign &&
      !isLikelyDefault("text-align", textAlign) &&
      elementHasText &&
      !shouldStripTextProperties
    ) {
      parts.push(`text-align: ${textAlign}`);
    }

    // Effective text color: when this element has no direct text, walk to the
    // first text-bearing descendant and emit its color. Gives the AI a clear
    // signal about what color is actually rendered, avoiding phantom values.
    if (!isInvisible && !hasDirectTextNode(el)) {
      const textBearing = findEffectiveTextElement(el);
      if (textBearing && textBearing !== el) {
        const effectiveCs = win.getComputedStyle(textBearing);
        const effectiveColor = rgbToHex(effectiveCs.color);
        if (effectiveColor) {
          parts.push(`effective-text-color: ${effectiveColor}`);
        }
      }
    }

    // === LAYOUT/VISUAL PROPERTIES (always captured) ===

    // Background
    const bgColor = cs.backgroundColor;
    if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
      const hex = rgbToHex(bgColor);
      if (hex) {
        parts.push(`background: ${hex}`);
      }
    }

    // Padding (capture when non-zero)
    const padding = cs.padding;
    if (padding && padding !== "0px" && padding !== "0px 0px 0px 0px") {
      parts.push(`padding: ${roundPixelValue(padding)}`);
    }

    // Border
    const borderTopWidth = parseFloat(cs.borderTopWidth) || 0;
    const borderBottomWidth = parseFloat(cs.borderBottomWidth) || 0;
    const borderLeftWidth = parseFloat(cs.borderLeftWidth) || 0;
    const borderRightWidth = parseFloat(cs.borderRightWidth) || 0;
    const maxBorderWidth = Math.max(
      borderTopWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderRightWidth
    );

    if (maxBorderWidth > 0) {
      const allEqual =
        borderTopWidth === borderBottomWidth &&
        borderTopWidth === borderLeftWidth &&
        borderTopWidth === borderRightWidth;

      if (allEqual) {
        parts.push(`border: ${roundPixelValue(cs.borderTopWidth)} solid`);
      } else {
        parts.push(`border-top: ${roundPixelValue(cs.borderTopWidth)}`);
      }

      const borderColor = cs.borderTopColor;
      if (borderColor && borderColor !== "rgba(0, 0, 0, 0)") {
        const hex = rgbToHex(borderColor);
        if (hex) {
          parts.push(`border-color: ${hex}`);
        }
      }
    }

    // Border-radius
    const borderTopLeftRadius = parseFloat(cs.borderTopLeftRadius) || 0;
    const borderTopRightRadius = parseFloat(cs.borderTopRightRadius) || 0;
    const borderBottomLeftRadius = parseFloat(cs.borderBottomLeftRadius) || 0;
    const borderBottomRightRadius = parseFloat(cs.borderBottomRightRadius) || 0;
    const maxBorderRadius = Math.max(
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius
    );

    if (maxBorderRadius > 0) {
      const allCornersEqual =
        borderTopLeftRadius === borderTopRightRadius &&
        borderTopLeftRadius === borderBottomLeftRadius &&
        borderTopLeftRadius === borderBottomRightRadius;

      if (allCornersEqual) {
        parts.push(`border-radius: ${roundPixelValue(cs.borderTopLeftRadius)}`);
      } else {
        parts.push(`border-radius: ${Math.round(maxBorderRadius)}px`);
      }
    }

    // Opacity (capture when not fully opaque)
    const opacity = cs.opacity;
    if (opacity && !isLikelyDefault("opacity", opacity)) {
      parts.push(`opacity: ${roundOpacityValue(opacity)}`);
    }

    // Box-shadow (capture when set)
    const boxShadow = cs.boxShadow;
    if (boxShadow && boxShadow !== "none") {
      parts.push(`box-shadow: present`);
    }

    // Dimensions — always capture
    if (rect.width > 0 && rect.height > 0) {
      parts.push(`size: ${Math.round(rect.width)}x${Math.round(rect.height)}px`);
    }

    return parts.join("; ").slice(0, 400);
  } catch {
    return "";
  }
}

/**
 * Determines whether a child element is "meaningful" enough to capture
 * for AI context. Meaningful means it has user-facing semantic content:
 * text content, aria-label/alt/title/placeholder, OR is an interactive
 * element (button, input, select, textarea, a).
 *
 * Skips: pure layout wrappers, hidden elements, script/style/svg/iframe.
 */
function isMeaningfulChild(el: Element): boolean {
  const skipTags = new Set([
    "script", "style", "noscript", "iframe", "svg", "br", "hr",
  ]);
  if (skipTags.has(el.tagName.toLowerCase())) return false;

  const win = el.ownerDocument?.defaultView;
  if (win) {
    const cs = win.getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
  }
  if (el.getAttribute("aria-hidden") === "true") return false;

  const interactiveTags = new Set([
    "button", "input", "select", "textarea", "a", "label",
  ]);
  if (interactiveTags.has(el.tagName.toLowerCase())) return true;

  if (el.getAttribute("aria-label")?.trim()) return true;
  if (el.getAttribute("alt")?.trim()) return true;
  if (el.getAttribute("title")?.trim()) return true;
  if (el.getAttribute("placeholder")?.trim()) return true;

  const directText = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent?.trim() || "")
    .join("");
  if (directText.length > 0) return true;

  // Wrapper with element children — pass through so the walker can unwrap it.
  if (el.children.length > 0) return true;

  return false;
}

/**
 * Resolves the "effective" element when the user clicks an SVG icon.
 *
 * If the clicked element is an SVG (or inside an SVG), walk UP to find
 * the closest interactive ancestor (button, a, input, etc.). That ancestor
 * is what the user actually intended to click.
 *
 * Returns the original element if it's not an SVG or has no interactive ancestor.
 */
function resolveEffectiveElement(el: Element | null): Element | null {
  if (!el) return null;

  const tag = el.tagName.toLowerCase();
  const isSvgRelated =
    tag === "svg" ||
    tag === "path" ||
    tag === "g" ||
    tag === "circle" ||
    tag === "rect" ||
    tag === "polygon" ||
    tag === "polyline" ||
    tag === "line" ||
    tag === "use" ||
    el.namespaceURI === "http://www.w3.org/2000/svg";

  if (!isSvgRelated) return el;

  const interactiveTags = new Set([
    "button", "a", "input", "select", "textarea", "label",
  ]);

  let current: Element | null = el.parentElement;
  let depth = 0;
  const MAX_DEPTH = 8;

  while (current && depth < MAX_DEPTH) {
    const currentTag = current.tagName.toLowerCase();
    if (interactiveTags.has(currentTag)) return current;

    const role = current.getAttribute("role");
    if (
      role === "button" || role === "link" || role === "tab" ||
      role === "menuitem" || role === "checkbox" || role === "radio"
    ) {
      return current;
    }

    if (current.hasAttribute("onclick")) return current;

    current = current.parentElement;
    depth++;
  }

  return el;
}

/**
 * Extracts ARIA state attributes from an element. Returns a compact string
 * with state info (e.g. "expanded, selected"). Empty string when no state.
 */
function extractElementState(el: Element | null): string {
  if (!el) return "";

  const states: string[] = [];

  const ariaChecked = el.getAttribute("aria-checked");
  if (ariaChecked === "true") states.push("checked");
  else if (ariaChecked === "false") states.push("unchecked");
  else if (ariaChecked === "mixed") states.push("partially checked");

  const ariaExpanded = el.getAttribute("aria-expanded");
  if (ariaExpanded === "true") states.push("expanded");
  else if (ariaExpanded === "false") states.push("collapsed");

  const ariaSelected = el.getAttribute("aria-selected");
  if (ariaSelected === "true") states.push("selected/active");
  else if (ariaSelected === "false") states.push("not selected");

  const ariaPressed = el.getAttribute("aria-pressed");
  if (ariaPressed === "true") states.push("pressed");
  else if (ariaPressed === "false") states.push("not pressed");

  const ariaCurrent = el.getAttribute("aria-current");
  if (ariaCurrent && ariaCurrent !== "false") {
    states.push(`current ${ariaCurrent === "true" ? "item" : ariaCurrent}`);
  }

  return states.join(", ");
}

/**
 * Detects if an element is disabled or appears disabled.
 * Checks the HTML disabled attribute and aria-disabled.
 */
function extractDisabledState(el: Element | null): string {
  if (!el) return "";

  const maybeDisabled = (el as { disabled?: unknown }).disabled;
  if (maybeDisabled === true) return "disabled";

  const ariaDisabled = el.getAttribute("aria-disabled");
  if (ariaDisabled === "true") return "disabled";

  return "";
}

/**
 * Helper: extract dialog title from common patterns.
 * Tries aria-labelledby first, then first heading inside dialog.
 */
function getDialogTitle(dialogEl: Element): string {
  const labelledBy = dialogEl.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelEl = dialogEl.ownerDocument?.getElementById(labelledBy);
    if (labelEl) return labelEl.textContent?.trim().slice(0, 60) || "";
  }

  const heading = dialogEl.querySelector("h1, h2, h3, h4, h5, h6");
  if (heading) {
    return (heading as HTMLElement).innerText?.trim().slice(0, 60) || "";
  }

  return "";
}

/**
 * Detects if the clicked element is inside a modal, dialog, or popover.
 * Walks UP from the clicked element looking for ARIA roles or HTML tags
 * indicating a dialog/modal/popover context.
 */
function detectModalContext(el: Element | null): string {
  if (!el) return "";

  let current: Element | null = el;
  let depth = 0;
  const MAX_DEPTH = 15;

  while (current && depth < MAX_DEPTH) {
    const tag = current.tagName.toLowerCase();
    const role = current.getAttribute("role");
    const ariaModal = current.getAttribute("aria-modal");

    if (tag === "dialog") {
      const label = current.getAttribute("aria-label") || getDialogTitle(current);
      return label ? `Dialog: ${label}` : "Dialog";
    }

    if (role === "dialog" || role === "alertdialog") {
      const label = current.getAttribute("aria-label") || getDialogTitle(current);
      return label ? `Modal: ${label}` : "Modal";
    }

    if (ariaModal === "true") {
      const label = current.getAttribute("aria-label") || getDialogTitle(current);
      return label ? `Modal: ${label}` : "Modal";
    }

    if (role === "menu" || role === "tooltip" || role === "listbox") {
      return `${role.charAt(0).toUpperCase() + role.slice(1)} popover`;
    }

    current = current.parentElement;
    depth++;
  }

  return "";
}

/**
 * Extracts the current value of an input element with privacy filtering.
 * Never captures values from password fields, hidden inputs, credit-card
 * fields, or fields whose name/id/placeholder/aria-label contain sensitive
 * terms. Caps captured value at 100 chars.
 */
function extractInputValue(el: Element | null): string {
  if (!el) return "";

  const tag = el.tagName.toLowerCase();
  if (tag !== "input" && tag !== "textarea" && tag !== "select") return "";

  const inputType = (el.getAttribute("type") || "").toLowerCase();
  const sensitiveTypes = new Set(["password", "hidden"]);
  if (sensitiveTypes.has(inputType)) return "";

  const autocomplete = (el.getAttribute("autocomplete") || "").toLowerCase();
  if (autocomplete.startsWith("cc-")) return "";

  const sensitiveTerms = [
    "password", "passcode", "pin", "ssn", "social-security",
    "credit-card", "creditcard", "card-number", "cardnumber",
    "cvv", "cvc", "security-code", "securitycode",
  ];

  const name = (el.getAttribute("name") || "").toLowerCase();
  const id = (el.getAttribute("id") || "").toLowerCase();
  const placeholder = (el.getAttribute("placeholder") || "").toLowerCase();
  const ariaLabel = (el.getAttribute("aria-label") || "").toLowerCase();

  for (const term of sensitiveTerms) {
    if (
      name.includes(term) || id.includes(term) ||
      placeholder.includes(term) || ariaLabel.includes(term)
    ) {
      return "";
    }
  }

  const value = (el as HTMLInputElement).value;
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  return trimmed.slice(0, 100);
}

/**
 * Detects if the clicked element is inside an iframe.
 * Returns context info for same-origin frames; flags cross-origin frames
 * so the AI knows context is limited.
 */
function detectIframeContext(win: Window | null): string {
  if (!win) return "";

  const isInFrame = win.self !== win.top;
  if (!isInFrame) return "";

  try {
    const parentUrl = win.parent.location.href;
    if (parentUrl) {
      return `Embedded frame within: ${new URL(parentUrl).hostname}`;
    }
  } catch {
    return "Cross-origin embedded frame (limited context)";
  }

  return "";
}

/**
 * Checks if an element is a button-like interactive element whose own styles
 * (background, color, padding) represent its visible identity regardless of
 * inner structure.
 *
 * These elements should NOT be treated as containers for style-stripping
 * purposes. A button with green bg and a wrapper div inside is still
 * visually "a green button" — the green is meaningful.
 *
 * Covers: <button>, <a> (link), elements with role="button", elements
 * with role="link", elements with tabindex (interactive), inputs that
 * render as buttons (submit, button), and elements with common button
 * class patterns.
 */
function isButtonLikeElement(el: Element): boolean {
  const tag = el.tagName.toLowerCase();

  // Tier 1: Semantic HTML — always passes
  if (tag === "button" || tag === "a") return true;
  if (tag === "input") {
    const type = (el as HTMLInputElement).type?.toLowerCase();
    if (type === "button" || type === "submit" || type === "reset") {
      return true;
    }
  }

  const role = el.getAttribute("role")?.toLowerCase();
  if (role === "button" || role === "link" || role === "tab") {
    return true;
  }

  // Tier 2: Visual + behavioral detection for non-semantic elements
  try {
    const win = el.ownerDocument?.defaultView;
    if (!win) return false;

    const style = win.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    // Size check — button-sized range
    const sizeOK =
      rect.width >= 40 && rect.width <= 600 &&
      rect.height >= 20 && rect.height <= 120;

    if (!sizeOK) return false;

    // Cursor pointer — strongest behavioral signal
    const hasClickCursor = style.cursor === "pointer";

    // Visible background or border — visual signal
    const bg = style.backgroundColor;
    const transparent = "rgba(0, 0, 0, 0)";
    const hasVisibleBg = bg && bg !== transparent && bg !== "transparent";

    const borderTopWidth = parseFloat(style.borderTopWidth) || 0;
    const borderBottomWidth = parseFloat(style.borderBottomWidth) || 0;
    const borderLeftWidth = parseFloat(style.borderLeftWidth) || 0;
    const borderRightWidth = parseFloat(style.borderRightWidth) || 0;
    const hasBorder =
      borderTopWidth > 0 || borderBottomWidth > 0 ||
      borderLeftWidth > 0 || borderRightWidth > 0;

    // Padding — buttons have internal spacing
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const hasPadding =
      paddingTop > 0 || paddingBottom > 0 ||
      paddingLeft > 0 || paddingRight > 0;

    // Short text — buttons have brief labels
    const text = el.textContent?.trim() || "";
    const hasShortText = text.length > 0 && text.length < 80;

    // Strong button signal: clickable + visual + sized correctly + has text
    if (hasClickCursor && hasShortText && (hasVisibleBg || hasBorder) && hasPadding) {
      return true;
    }
  } catch {
    // Continue to className fallback
  }

  // Tier 3: Class name keyword check (fallback for older patterns)
  const className = typeof el.className === "string"
    ? el.className.toLowerCase()
    : "";

  if (
    className.includes("btn") ||
    className.includes("button") ||
    className.includes("cta")
  ) {
    const rect = el.getBoundingClientRect();
    return rect.width < 400 && rect.height < 100;
  }

  return false;
}

/**
 * Detects the semantic type of an element based on tag, role, and visual signals.
 * Used by AI to apply type-specific interpretation rules.
 *
 * Priority: semantic HTML tag → ARIA role → visual signals (cursor, size, bg).
 * Returns null when no clear signal exists.
 */
function detectSemanticType(el: Element, win: Window): SemanticType | null {
  const tag = el.tagName.toLowerCase();

  if (tag === "button") return "button";
  if (tag === "a") return "link";
  if (tag === "input" || tag === "textarea" || tag === "select") return "input";
  if (/^h[1-6]$/.test(tag)) return "heading";
  if (tag === "p" || tag === "label") return "paragraph";
  if (tag === "img" || tag === "picture") return "image";
  if (tag === "svg") return "icon";

  const role = el.getAttribute("role")?.toLowerCase();
  if (role === "button") return "button";
  if (role === "link") return "link";
  if (role === "heading") return "heading";
  if (role === "img") return "image";
  if (role === "textbox" || role === "combobox") return "input";

  if (isButtonLikeElement(el)) return "button";

  try {
    const style = win.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const text = el.textContent?.trim() || "";

    if (tag === "img" && rect.width < 32 && rect.height < 32) {
      return "icon";
    }

    const bg = style.backgroundColor;
    const hasVisibleBg = bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
    const hasShadow = style.boxShadow && style.boxShadow !== "none";
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const hasPadding = paddingTop > 0 || paddingLeft > 0;

    const meaningfulChildren = unwrapMeaningfulChildren(el);
    const hasMultipleChildren = meaningfulChildren.length >= 2;

    const isCardSized = rect.width < 800 && rect.height < 600;

    if ((hasVisibleBg || hasShadow) && hasPadding && hasMultipleChildren && isCardSized) {
      return "card";
    }

    if (rect.width >= 600 && hasMultipleChildren) {
      return "section";
    }

    if (text.length > 0 && meaningfulChildren.length === 0) {
      return "paragraph";
    }
  } catch {
    // Fall through to null
  }

  return null;
}

/**
 * Detects elements that are pure layout wrappers — they have no semantic
 * identity of their own (no aria-label/alt/title/placeholder, no direct text)
 * but contain child elements. These are SKIPPED in childrenList and replaced
 * with their meaningful descendants.
 */
function isPureWrapper(el: Element): boolean {
  if (el.getAttribute("aria-label")?.trim()) return false;
  if (el.getAttribute("alt")?.trim()) return false;
  if (el.getAttribute("title")?.trim()) return false;
  if (el.getAttribute("placeholder")?.trim()) return false;

  const interactiveTags = new Set([
    "button", "input", "select", "textarea", "a", "label",
  ]);
  if (interactiveTags.has(el.tagName.toLowerCase())) return false;

  const directText = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent?.trim() || "")
    .join("");
  if (directText.length > 0) return false;

  return el.children.length > 0;
}

/**
 * Extracts a brief subset of computed styles for a child element.
 * Smaller payload than extractComputedStyles — only essentials for
 * disambiguation: color, background, font-size, font-weight, font-style,
 * text-decoration, dimensions.
 */
function extractBriefStyles(el: Element): string {
  try {
    const win = el.ownerDocument?.defaultView;
    if (!win) return "";
    const cs = win.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    // Gate text properties on direct text nodes only — wrapping a child div
    // that holds the visible text means the parent's color is phantom.
    const opacityValue = parseFloat(cs.opacity);
    const isInvisible = opacityValue === 0;
    const elementHasText = !isInvisible && hasDirectTextNode(el);
    const parts: string[] = [];

    const color = cs.color;
    const bgColor = cs.backgroundColor;
    const fontSize = cs.fontSize;
    const fontWeight = cs.fontWeight;
    const fontStyle = cs.fontStyle;
    const textDecoration = cs.textDecorationLine || cs.textDecoration;

    if (color && color !== "rgba(0, 0, 0, 0)" && elementHasText) {
      const hex = rgbToHex(color);
      if (hex) parts.push(`color: ${hex}`);
    }
    if (bgColor && bgColor !== "rgba(0, 0, 0, 0)") {
      const hex = rgbToHex(bgColor);
      if (hex) parts.push(`bg: ${hex}`);
    }
    if (fontSize && elementHasText) parts.push(`font: ${roundPixelValue(fontSize)}`);
    if (
      fontWeight &&
      fontWeight !== "400" &&
      fontWeight !== "normal" &&
      elementHasText
    ) {
      parts.push(`font-weight: ${fontWeight}`);
    }
    if (
      fontStyle &&
      fontStyle !== "normal" &&
      elementHasText
    ) {
      parts.push(`font-style: ${fontStyle}`);
    }
    if (
      textDecoration &&
      textDecoration !== "none" &&
      !textDecoration.startsWith("none ") &&
      elementHasText
    ) {
      parts.push(`text-decoration: ${textDecoration}`);
    }

    // Border (children) — only capture if visible
    const childBorderWidth = parseFloat(cs.borderTopWidth) || 0;
    if (childBorderWidth > 0) {
      const cleanedBorderWidth = roundPixelValue(cs.borderTopWidth);
      const borderColor = cs.borderTopColor;
      if (borderColor && borderColor !== "rgba(0, 0, 0, 0)") {
        const hex = rgbToHex(borderColor);
        if (hex) {
          parts.push(`border: ${cleanedBorderWidth} ${hex}`);
        }
      } else {
        parts.push(`border: ${cleanedBorderWidth}`);
      }
    }

    // Padding (children) — only capture if non-zero
    const childPadding = cs.padding;
    if (childPadding && childPadding !== "0px" && childPadding !== "0px 0px 0px 0px") {
      parts.push(`padding: ${roundPixelValue(childPadding)}`);
    }

    if (rect.width > 0 && rect.height > 0) {
      parts.push(`size: ${Math.round(rect.width)}x${Math.round(rect.height)}px`);
    }

    return parts.join("; ").slice(0, 200);
  } catch {
    return "";
  }
}

/**
 * Checks whether a child has visually distinct styling from its parent.
 *
 * Distinct means: different color, background, font-size, font-weight,
 * font-style, or text-decoration. If any of these differ, the child is
 * stylistically meaningful and worth capturing as part of childrenList.
 *
 * Returns false if styles match or can't be determined.
 */
function isVisuallyDistinctFromParent(
  child: Element,
  parent: Element
): boolean {
  try {
    const win = child.ownerDocument?.defaultView;
    if (!win) return false;
    const childStyle = win.getComputedStyle(child);
    const parentStyle = win.getComputedStyle(parent);

    if (childStyle.color !== parentStyle.color) return true;

    const childBg = childStyle.backgroundColor;
    const parentBg = parentStyle.backgroundColor;
    const transparent = "rgba(0, 0, 0, 0)";
    if (
      childBg !== parentBg &&
      !(childBg === transparent && parentBg === transparent)
    ) {
      return true;
    }

    if (childStyle.fontSize !== parentStyle.fontSize) return true;

    const normalizeWeight = (w: string) => {
      if (w === "normal") return "400";
      if (w === "bold") return "700";
      return w;
    };
    if (
      normalizeWeight(childStyle.fontWeight) !==
      normalizeWeight(parentStyle.fontWeight)
    ) {
      return true;
    }

    if (childStyle.fontStyle !== parentStyle.fontStyle) return true;

    const childDec = childStyle.textDecorationLine || childStyle.textDecoration;
    const parentDec = parentStyle.textDecorationLine || parentStyle.textDecoration;
    if (childDec !== parentDec) return true;

    return false;
  } catch {
    return false;
  }
}

const MAX_CHILDREN = 10;
const MAX_CHILDREN_PAYLOAD = 1500;
// Increased from 3 to 8 to accommodate deeply-nested layout wrappers
// common in Webflow, Framer, and other modern frameworks
// (section > container > content-wrapper > grid > col > heading-block > h1)
const MAX_RECURSION_DEPTH = 8;
const MAX_DISTINCT_DESCENDANTS = 2;

/**
 * Finds inline descendants of an element that have visually distinct
 * styling from their parent (different color, font-size, font-weight,
 * font-style, or text-decoration).
 *
 * Used to surface styled inline elements (a colored span inside an h1,
 * a bolded phrase inside a paragraph, etc.) that would otherwise be
 * invisible to brief-styles capture.
 *
 * Limits:
 * - Depth bounded at 2 levels (immediate children + one nesting level)
 * - Max distinct descendants returned: MAX_DISTINCT_DESCENDANTS (=2)
 *
 * Returns descendants with their parent context for relative comparison.
 */
function findDistinctInlineDescendants(
  el: Element,
  depth: number = 0,
  maxDepth: number = 2
): Element[] {
  if (depth >= maxDepth) return [];

  const result: Element[] = [];
  const directChildren = Array.from(el.children) as Element[];

  for (const child of directChildren) {
    if (isAnnoteElement(child)) continue;
    if (!isMeaningfulChild(child)) continue;

    // Check if this child is visually distinct from the element
    if (isVisuallyDistinctFromParent(child, el)) {
      result.push(child);
      if (result.length >= MAX_DISTINCT_DESCENDANTS) return result;
    }

    // Also recurse into this child's descendants
    const nested = findDistinctInlineDescendants(child, depth + 1, maxDepth);
    result.push(...nested);
    if (result.length >= MAX_DISTINCT_DESCENDANTS) {
      return result.slice(0, MAX_DISTINCT_DESCENDANTS);
    }
  }

  return result;
}

/**
 * Recursively unwraps layout wrappers to find meaningful children.
 * If a child is a pure wrapper, returns its meaningful descendants instead.
 * Caps recursion depth to avoid runaway walks.
 */
function unwrapMeaningfulChildren(el: Element, depth: number = 0): Element[] {
  // At depth limit, return the current element as a fallback rather than empty.
  // Losing the trail entirely makes container detection fail. Keeping the
  // wrapper at least allows isContainer logic to fire and strip its styles.
  if (depth >= MAX_RECURSION_DEPTH) {
    return [el];
  }

  const result: Element[] = [];
  const directChildren = Array.from(el.children) as Element[];

  for (const child of directChildren) {
    if (isAnnoteElement(child)) continue;
    if (!isMeaningfulChild(child)) continue;

    if (isPureWrapper(child)) {
      const innerChildren = unwrapMeaningfulChildren(child, depth + 1);
      result.push(...innerChildren);
    } else {
      result.push(child);
    }

    if (result.length >= MAX_CHILDREN * 2) break;
  }

  return result;
}

/**
 * Extracts up to 10 meaningful descendants of the clicked element
 * for structured AI context. Recurses through pure layout wrappers so the
 * AI sees real content (headlines, buttons, images) rather than nameless divs.
 *
 * Each entry contains:
 * - tag: element tag name
 * - name: semantic identifier (aria-label, alt, title, placeholder, or innerText)
 * - styles: brief computed styles
 *
 * Captures children when:
 * - 2+ meaningful descendants exist, OR
 * - Exactly 1 meaningful descendant exists AND it is visually distinct from
 *   the parent (different color, background, font-size, weight, style, or
 *   decoration). Catches the common pattern of a parent with a single
 *   styled inline span (highlighted word, brand-colored phrase).
 *
 * Total payload cap: 1500 chars.
 */
export function extractMeaningfulChildren(el: Element | null): string {
  if (!el) return "";

  const meaningful = unwrapMeaningfulChildren(el);

  const shouldCapture =
    meaningful.length >= 2 ||
    (meaningful.length === 1 &&
      isVisuallyDistinctFromParent(meaningful[0], el));

  if (!shouldCapture) return "";

  const toCapture = meaningful.slice(0, MAX_CHILDREN);

  const entries: string[] = [];
  let totalLength = 0;

  for (let i = 0; i < toCapture.length; i++) {
    const child = toCapture[i];
    const tag = child.tagName.toLowerCase();
    const name = getSemanticIdentifier(child);
    const styles = extractBriefStyles(child);

    const nameDisplay = name || "(no label)";
    const stylesDisplay = styles ? ` (${styles})` : "";
    const entry = `${i + 1}. ${tag}: "${nameDisplay}"${stylesDisplay}`;

    if (totalLength + entry.length + 1 > MAX_CHILDREN_PAYLOAD) break;

    entries.push(entry);
    totalLength += entry.length + 1;

    // Look for visually distinct inline descendants within this child
    // and append them as indented nested entries
    const distinctDescendants = findDistinctInlineDescendants(child);
    for (const descendant of distinctDescendants) {
      const descTag = descendant.tagName.toLowerCase();
      const descName = getSemanticIdentifier(descendant);
      const descStyles = extractBriefStyles(descendant);

      const descNameDisplay = descName || "(no label)";
      const descStylesDisplay = descStyles ? ` (${descStyles})` : "";
      const nestedEntry = `   └ ${descTag}: "${descNameDisplay}"${descStylesDisplay}`;

      if (totalLength + nestedEntry.length + 1 > MAX_CHILDREN_PAYLOAD) break;

      entries.push(nestedEntry);
      totalLength += nestedEntry.length + 1;
    }
  }

  if (entries.length === 0) return "";

  const totalMeaningful = meaningful.length;
  const captured = entries.length;
  const headerNote =
    captured === 1
      ? `(1 visually distinct child)`
      : totalMeaningful > captured
      ? `(${captured} of ${totalMeaningful} meaningful descendants shown)`
      : `(${captured} meaningful descendants)`;

  return `${headerNote}\n${entries.join("\n")}`;
}

/**
 * Collect visible text within the element's subtree.
 * Ignores script/style, trims whitespace, limit ~2000 characters.
 */
export function extractSubtreeText(el: Element | null): string | null {
  if (!el || isAnnoteElement(el)) return null;
  const parts: string[] = [];
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (isAnnoteElement(parent)) return NodeFilter.FILTER_REJECT;
      const root = parent.getRootNode?.();
      if (root && root instanceof ShadowRoot && isAnnoteElement(root.host))
        return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (SKIP_TAGS.has(tag)) return NodeFilter.FILTER_REJECT;
      if (isHidden(parent)) return NodeFilter.FILTER_REJECT;
      const t = (node.textContent ?? "").trim();
      return t.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  let len = 0;
  let node: Node | null = walker.nextNode();
  while (node && len < MAX_SUBTREE_CHARS) {
    const t = (node.textContent ?? "").trim();
    if (t.length > 0) {
      const take = t.slice(0, MAX_SUBTREE_CHARS - len);
      parts.push(take);
      len += take.length;
    }
    node = walker.nextNode();
  }
  if (parts.length === 0) return null;
  const raw = parts.join(" ").replace(/\s+/g, " ").trim();
  return raw.slice(0, MAX_SUBTREE_CHARS) || null;
}

/** Alias for compatibility. */
export function getSubtreeText(el: Element | null): string | null {
  return extractSubtreeText(el);
}

function echlyDebug(label: string, value: string | number): void {
  try {
    if (ECHLY_DEBUG && typeof console !== "undefined" && console.log) {
      console.log(`ECHLY DEBUG — ${label}`, value);
    }
  } catch {
    // no-op
  }
}

/**
 * Build full capture context (Ring 1 only — selected element + its subtree).
 * Falls back to element.innerText when subtree walker yields nothing.
 */
export function buildCaptureContext(
  win: Window,
  selectedElement: Element | null
): CaptureContext {
  let element: Element | null = selectedElement;
  while (element && isAnnoteElement(element)) {
    element = element.parentElement;
  }

  // If user clicked an SVG icon, resolve to its interactive parent
  // (button, link, etc.). The parent is what they actually intended to click.
  const effective = resolveEffectiveElement(element);
  if (effective && effective !== element) {
    element = effective;
  }

  let subtreeText: string | null = element ? extractSubtreeText(element) : null;
  const semanticIdentifier: string = element ? getSemanticIdentifier(element) : "";
  const computedStyles: string = element ? extractComputedStyles(win, element) : "";
  const childrenList: string = element ? extractMeaningfulChildren(element) : "";
  const elementState: string = element ? extractElementState(element) : "";
  const semanticType: SemanticType | null = element ? detectSemanticType(element, win) : null;
  const disabledState: string = element ? extractDisabledState(element) : "";
  const modalContext: string = element ? detectModalContext(element) : "";
  const inputValue: string = element ? extractInputValue(element) : "";
  const iframeContext: string = detectIframeContext(win);

  if (element && !isAnnoteElement(element) && element !== win.document?.body) {
    if (!subtreeText?.trim()) {
      const raw = (element as HTMLElement).innerText ?? (element as HTMLElement).textContent ?? "";
      const trimmed = raw.replace(/\s+/g, " ").trim().slice(0, MAX_SUBTREE_CHARS) || null;
      if (trimmed) subtreeText = trimmed;
      if (subtreeText) echlyDebug("SUBTREE TEXT FALLBACK USED", "element.innerText");
    }
  }

  const ctx: CaptureContext = {
    url: win.location.href.split("#")[0],
    scrollX: win.scrollX,
    scrollY: win.scrollY,
    viewportWidth: win.innerWidth,
    viewportHeight: win.innerHeight,
    devicePixelRatio: win.devicePixelRatio ?? 1,
    screenWidth: typeof win.screen?.width === "number" ? win.screen.width : undefined,
    screenHeight: typeof win.screen?.height === "number" ? win.screen.height : undefined,
    subtreeText: subtreeText ?? null,
    semanticIdentifier: semanticIdentifier || null,
    computedStyles: computedStyles || null,
    childrenList: childrenList || null,
    elementState: elementState || null,
    semanticType,
    disabledState: disabledState || null,
    modalContext: modalContext || null,
    inputValue: inputValue || null,
    iframeContext: iframeContext || null,
    capturedAt: Date.now(),
  };

  echlyDebug("SUBTREE TEXT SIZE", ctx.subtreeText?.length ?? 0);
  echlyDebug("DOM SCOPE SAMPLE", (ctx.subtreeText ?? "").slice(0, 200) || "(empty)");

  return ctx;
}
