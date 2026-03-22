/**
 * Context auto-capture for region feedback: URL, scroll, viewport, DOM path, nearby text.
 * Enables AI-level scene detail: "On /pricing at 1440px, CTA under card #2 has alignment issue."
 * Ensures domPath, nearbyText, subtreeText, visibleText are always populated when possible.
 */
import { ECHLY_DEBUG } from "@/lib/utils/logger";

export type CaptureContext = {
  url: string;
  scrollX: number;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  /** CSS selector path (e.g. #hero-section > div.container > button.cta-primary). */
  domPath: string | null;
  /** Text content near the selected element (parent, siblings, children). */
  nearbyText: string | null;
  /** Visible text from the DOM subtree at domPath (for spatial scope). */
  subtreeText: string | null;
  /** Visible viewport text (readable text in viewport). */
  visibleText: string | null;
  capturedAt: number;
  /** When set, OCR should run on this image (e.g. selection crop) instead of the UI screenshot. */
  ocrImageDataUrl?: string | null;
  /** Pin position as percentage of container (0–100) for annotation placement. */
  pinPosition?: { xPercent: number; yPercent: number } | null;
};

const MAX_PATH_DEPTH = 12;
const MAX_SUBTREE_CHARS = 2000;
const MAX_NEARBY_CHARS = 800;
const MAX_VISIBLE_CHARS = 1500;

const SKIP_TAGS = new Set(["script", "style", "noscript", "iframe", "svg"]);

/**
 * True if the node belongs to Echly extension UI (overlay, toolbar, shadow root).
 * Used so DOM capture never includes extension UI in domPath, subtreeText, nearbyText, visibleText.
 */
export function isEchlyElement(node: Node | Element | null): boolean {
  if (!node) return false;
  const el = node instanceof Element ? node : (node as Node).parentElement;
  if (!el) return false;
  const target = node instanceof Element ? node : el;
  if (target.id && String(target.id).toLowerCase().startsWith("echly")) return true;
  const cn = target.className;
  if (cn && typeof cn === "string" && cn.includes("echly")) return true;
  if (target instanceof Element && target.getAttribute?.("data-echly-ui") != null) return true;
  if (target instanceof Element && target.closest?.("[data-echly-ui]")) return true;
  const root = target.getRootNode?.();
  if (root && root instanceof ShadowRoot && isEchlyElement(root.host)) return true;
  return false;
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
 * Get a stable CSS-like DOM path: tag, id, and class when available.
 * Stops at body or a meaningful container.
 * Example: #hero-section > div.container > button.cta-primary
 */
export function getDomPath(el: Element | null): string | null {
  if (!el?.getRootNode || isEchlyElement(el)) return null;
  const doc = el.ownerDocument;
  if (!doc || el === doc.body) return "body";
  const segments: string[] = [];
  let current: Element | null = el;
  while (current && current !== doc.body && segments.length < MAX_PATH_DEPTH) {
    const tag = current.tagName.toLowerCase();
    let selector = tag;
    const id = current.id?.trim();
    if (id && /^[a-zA-Z][\w-]*$/.test(id) && !id.includes(" ")) {
      selector += `#${id}`;
      segments.unshift(selector);
      break;
    }
    const cls = current.getAttribute?.("class")?.trim();
    if (cls) {
      const firstClass = cls.split(/\s+/).find((c) => c.length > 0 && /^[a-zA-Z_][\w-]*$/.test(c));
      if (firstClass) selector += `.${firstClass}`;
    }
    const parent: Element | null = current.parentElement;
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
 * Collect visible text within the element's subtree.
 * Ignores script/style, trims whitespace, limit ~2000 characters.
 */
export function extractSubtreeText(el: Element | null): string | null {
  if (!el || isEchlyElement(el)) return null;
  const parts: string[] = [];
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (isEchlyElement(parent)) return NodeFilter.FILTER_REJECT;
      const root = parent.getRootNode?.();
      if (root && root instanceof ShadowRoot && isEchlyElement(root.host))
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

/**
 * Nearby text: parent, siblings, immediate children.
 * Ignores hidden elements (display:none, visibility:hidden, aria-hidden).
 * Limit ~800 characters.
 */
export function extractNearbyText(el: Element | null): string | null {
  if (!el || isEchlyElement(el)) return null;
  const parts: string[] = [];

  function addText(from: Element | null): void {
    if (!from || isEchlyElement(from) || isHidden(from)) return;
    const raw = (from as HTMLElement).innerText ?? (from as HTMLElement).textContent ?? "";
    const t = raw.replace(/\s+/g, " ").trim().slice(0, 200);
    if (t.length > 0) parts.push(t);
  }

  const own =
    el.getAttribute?.("aria-label") ||
    (el as HTMLInputElement).placeholder ||
    ((el as HTMLElement).innerText ?? (el as HTMLElement).textContent ?? "").trim();
  if (own) parts.push(String(own).slice(0, 120));

  const parent = el.parentElement;
  if (parent && !isEchlyElement(parent) && !isHidden(parent)) addText(parent);

  if (parent) {
    for (let i = 0; i < parent.children.length; i++) {
      const sib = parent.children[i];
      if (sib !== el && !isEchlyElement(sib)) addText(sib);
    }
  }

  for (let i = 0; i < el.children.length; i++) {
    if (!isEchlyElement(el.children[i])) addText(el.children[i]);
  }

  const joined = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (!joined) return null;
  return joined.length > MAX_NEARBY_CHARS ? joined.slice(0, MAX_NEARBY_CHARS) + "…" : joined;
}

/** Alias for compatibility. */
export function getNearbyText(el: Element | null): string | null {
  return extractNearbyText(el);
}

/**
 * Visible viewport text: traverse visible nodes in the viewport.
 * Limit ~1500 characters. Prefer document body when in browser.
 */
export function extractVisibleText(win: Window | null): string | null {
  if (!win?.document?.body) return null;
  const doc = win.document;
  const body = doc.body;
  const parts: string[] = [];
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (isEchlyElement(parent)) return NodeFilter.FILTER_REJECT;
      const root = parent.getRootNode?.();
      if (root && root instanceof ShadowRoot && isEchlyElement(root.host))
        return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (SKIP_TAGS.has(tag)) return NodeFilter.FILTER_REJECT;
      if (isHidden(parent)) return NodeFilter.FILTER_REJECT;
      const rect = parent.getBoundingClientRect?.();
      if (rect && (rect.top >= win.innerHeight || rect.bottom <= 0 || rect.left >= win.innerWidth || rect.right <= 0))
        return NodeFilter.FILTER_REJECT;
      const t = (node.textContent ?? "").trim();
      return t.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  let len = 0;
  let node: Node | null = walker.nextNode();
  while (node && len < MAX_VISIBLE_CHARS) {
    const t = (node.textContent ?? "").trim();
    if (t.length > 0) {
      const take = t.slice(0, MAX_VISIBLE_CHARS - len);
      parts.push(take);
      len += take.length;
    }
    node = walker.nextNode();
  }
  if (parts.length === 0) return null;
  const raw = parts.join(" ").replace(/\s+/g, " ").trim();
  return raw.slice(0, MAX_VISIBLE_CHARS) || null;
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
 * Build full capture context. Never leaves spatial context empty when an element is available.
 * Uses fallbacks: subtreeText → element.innerText; nearbyText → parent.innerText; visibleText → body.innerText.
 */
export function buildCaptureContext(
  win: Window,
  selectedElement: Element | null
): CaptureContext {
  let element: Element | null = selectedElement;
  while (element && isEchlyElement(element)) {
    element = element.parentElement;
  }

  const domPath: string | null = element ? getDomPath(element) : null;
  let subtreeText: string | null = element ? extractSubtreeText(element) : null;
  let nearbyText: string | null = element ? extractNearbyText(element) : null;
  const visibleText: string | null = extractVisibleText(win);

  if (element && !isEchlyElement(element) && element !== win.document?.body) {
    if (!subtreeText?.trim()) {
      const raw = (element as HTMLElement).innerText ?? (element as HTMLElement).textContent ?? "";
      const trimmed = raw.replace(/\s+/g, " ").trim().slice(0, MAX_SUBTREE_CHARS) || null;
      if (trimmed) subtreeText = trimmed;
      if (subtreeText) echlyDebug("SUBTREE TEXT FALLBACK USED", "element.innerText");
    }
    if (!nearbyText?.trim() && element.parentElement && !isEchlyElement(element.parentElement)) {
      const raw = element.parentElement.innerText ?? element.parentElement.textContent ?? "";
      nearbyText = raw.replace(/\s+/g, " ").trim().slice(0, MAX_NEARBY_CHARS) || null;
      if (nearbyText) echlyDebug("NEARBY TEXT FALLBACK USED", "parent.innerText");
    }
  }
  if (!visibleText?.trim()) {
    echlyDebug("VISIBLE TEXT FALLBACK USED", "(skipped to avoid Echly UI)");
  }

  const ctx: CaptureContext = {
    url: win.location.href,
    scrollX: win.scrollX,
    scrollY: win.scrollY,
    viewportWidth: win.innerWidth,
    viewportHeight: win.innerHeight,
    devicePixelRatio: win.devicePixelRatio ?? 1,
    domPath,
    nearbyText: nearbyText ?? null,
    subtreeText: subtreeText ?? null,
    visibleText: visibleText ?? null,
    capturedAt: Date.now(),
  };

  echlyDebug("DOM PATH", ctx.domPath ?? "(none)");
  echlyDebug("SUBTREE TEXT SIZE", ctx.subtreeText?.length ?? 0);
  echlyDebug("NEARBY TEXT SIZE", ctx.nearbyText?.length ?? 0);
  echlyDebug("VISIBLE TEXT SIZE", ctx.visibleText?.length ?? 0);
  echlyDebug("DOM SCOPE SAMPLE", (ctx.subtreeText ?? "").slice(0, 200) || "(empty)");
  echlyDebug("NEARBY SCOPE SAMPLE", (ctx.nearbyText ?? "").slice(0, 200) || "(empty)");
  echlyDebug("VISIBLE TEXT SAMPLE", (ctx.visibleText ?? "").slice(0, 200) || "(empty)");

  return ctx;
}
