/**
 * Lightweight element hover highlight for Session Feedback Mode.
 * Single overlay element; no React re-renders on mousemove.
 */

import { isSessionCaptureTarget, logSession } from "./sessionMode";

const HIGHLIGHT_STYLE = {
  outline: "2px solid #2563eb",
  background: "rgba(37,99,235,0.1)",
};

export type ElementHighlighterOptions = {
  /** When false, hover does nothing and overlay is hidden. Called on each mousemove. */
  getActive: () => boolean;
};

let overlay: HTMLDivElement | null = null;
let mousemoveBound: ((e: MouseEvent) => void) | null = null;
let lastTarget: Element | null = null;

function getElementUnderPoint(x: number, y: number): Element | null {
  if (typeof document.elementsFromPoint !== "function") return document.elementFromPoint(x, y);
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (isSessionCaptureTarget(el)) return el;
  }
  return null;
}

function updateOverlay(rect: DOMRect | null) {
  if (!overlay) return;
  if (!rect || rect.width === 0 || rect.height === 0) {
    overlay.style.display = "none";
    return;
  }
  overlay.style.display = "block";
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
}

function handleMouseMove(e: MouseEvent, active: () => boolean) {
  if (!active()) {
    if (overlay) overlay.style.display = "none";
    lastTarget = null;
    return;
  }
  const el = getElementUnderPoint(e.clientX, e.clientY);
  if (el !== lastTarget) {
    lastTarget = el;
    if (!el) {
      updateOverlay(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    updateOverlay(rect);
  }
}

/**
 * Attach hover highlighting. Call from a component that has access to container and active flag.
 * Uses a single overlay div; updates its position/size on mousemove without React.
 */
export function attachElementHighlighter(
  container: HTMLElement,
  options: ElementHighlighterOptions
): () => void {
  if (overlay && overlay.parentNode) {
    detachElementHighlighter();
  }
  overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("data-echly-ui", "true");
  overlay.style.cssText = [
    "position:fixed",
    "pointer-events:none",
    "z-index:2147483646",
    "box-sizing:border-box",
    "border-radius:4px",
    `outline:${HIGHLIGHT_STYLE.outline}`,
    `background:${HIGHLIGHT_STYLE.background}`,
    "display:none",
  ].join(";");
  container.appendChild(overlay);

  mousemoveBound = (e: MouseEvent) => handleMouseMove(e, options.getActive);
  document.addEventListener("mousemove", mousemoveBound, { passive: true });

  return () => detachElementHighlighter();
}

export function detachElementHighlighter(): void {
  if (mousemoveBound) {
    document.removeEventListener("mousemove", mousemoveBound);
    mousemoveBound = null;
  }
  lastTarget = null;
  if (overlay?.parentNode) {
    overlay.parentNode.removeChild(overlay);
  }
  overlay = null;
}
