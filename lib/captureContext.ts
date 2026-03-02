/**
 * Context auto-capture for region feedback: URL, scroll, viewport, DOM path, nearby text.
 * Enables AI-level clarity: "On /pricing at 1440px, CTA under card #2 has alignment issue."
 */

export type CaptureContext = {
  url: string;
  scrollX: number;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  /** CSS selector path or structural path (e.g. body > main > div.pricing > button.cta). */
  domPath: string | null;
  /** Text content near the selected element (label, heading, button text). */
  nearbyText: string | null;
  capturedAt: number;
};

const MAX_PATH_DEPTH = 12;
const MAX_NEARBY_LENGTH = 300;

/**
 * Get a stable DOM path for an element (tag + nth-child or id when available).
 */
export function getDomPath(el: Element | null): string | null {
  if (!el || !el.getRootNode) return null;
  const doc = el.ownerDocument;
  if (!doc || el === doc.body) return "body";
  const segments: string[] = [];
  let current: Element | null = el;
  while (current && current !== doc.body && segments.length < MAX_PATH_DEPTH) {
    let selector = current.tagName.toLowerCase();
    if (current.id && /^[a-zA-Z][\w-]*$/.test(current.id)) {
      selector += `#${current.id}`;
      segments.unshift(selector);
      break;
    }
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) break;
    const siblings = parent.children;
    let idx = 0;
    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i] === current) {
        idx = i + 1;
        break;
      }
    }
    selector += `:nth-child(${idx})`;
    segments.unshift(selector);
    current = parent;
  }
  if (segments.length === 0) return null;
  return segments.join(" > ");
}

/**
 * Get nearby text: element's own text, aria-label, placeholder, or parent heading/label.
 */
export function getNearbyText(el: Element | null): string | null {
  if (!el) return null;
  const parts: string[] = [];
  const own =
    (el.getAttribute("aria-label") ||
      (el as HTMLInputElement).placeholder ||
      (el as HTMLButtonElement).textContent?.trim() ||
      "") as string;
  if (own.length > 0) parts.push(own.slice(0, 120));
  let parent: HTMLElement | null = el.parentElement;
  for (let i = 0; i < 3 && parent; i++) {
    const tag = parent.tagName.toLowerCase();
    if (tag === "label" || tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      const t = parent.textContent?.trim().slice(0, 80);
      if (t) parts.push(t);
      break;
    }
    parent = parent.parentElement;
  }
  const joined = parts.filter(Boolean).join(" · ");
  if (!joined) return null;
  return joined.length > MAX_NEARBY_LENGTH ? joined.slice(0, MAX_NEARBY_LENGTH) + "…" : joined;
}

/**
 * Build full capture context from the current page and optional element.
 */
export function buildCaptureContext(
  win: Window,
  selectedElement: Element | null
): CaptureContext {
  return {
    url: win.location.href,
    scrollX: win.scrollX,
    scrollY: win.scrollY,
    viewportWidth: win.innerWidth,
    viewportHeight: win.innerHeight,
    devicePixelRatio: win.devicePixelRatio ?? 1,
    domPath: selectedElement ? getDomPath(selectedElement) : null,
    nearbyText: selectedElement ? getNearbyText(selectedElement) : null,
    capturedAt: Date.now(),
  };
}
