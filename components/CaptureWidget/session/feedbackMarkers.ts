/**
 * Session Feedback Markers — visual indicators where feedback was captured.
 * Purely UI layer; markers live only during the active session.
 */
import { ECHLY_DEBUG } from "@/lib/utils/logger";

/** Below modal UI (e.g. 2147483645); layer uses 2147483644. */
const MARKER_Z_INDEX = 2147483644;
const LOG_PREFIX = "[SESSION]";

export type FeedbackMarkerData = {
  id: string;
  x: number;
  y: number;
  element?: HTMLElement;
  title?: string;
};

export type FeedbackMarkerOptions = {
  onMarkerClick?: (marker: FeedbackMarkerData & { index: number }) => void;
  getSessionPaused?: () => boolean;
};

type MarkerEntry = FeedbackMarkerData & {
  index: number;
  domElement: HTMLDivElement;
  offsetX: number;
  offsetY: number;
};

let container: HTMLElement | null = null;
const markers: MarkerEntry[] = [];
let scrollBound: (() => void) | null = null;
let resizeBound: (() => void) | null = null;

function getCenterFromElement(el: HTMLElement): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function applyPosition(domEl: HTMLDivElement, x: number, y: number): void {
  domEl.style.left = `${x}px`;
  domEl.style.top = `${y}px`;
  domEl.style.transform = "translate(-50%, -50%)";
}

function setupScrollResizeListeners(): void {
  if (scrollBound && resizeBound) return;
  scrollBound = () => updateMarkerPositions();
  resizeBound = () => updateMarkerPositions();
  window.addEventListener("scroll", scrollBound, { passive: true, capture: true });
  window.addEventListener("resize", resizeBound);
}

function teardownScrollResizeListeners(): void {
  if (scrollBound) {
    window.removeEventListener("scroll", scrollBound, { capture: true });
    scrollBound = null;
  }
  if (resizeBound) {
    window.removeEventListener("resize", resizeBound);
    resizeBound = null;
  }
}

/**
 * Create a numbered marker at the given position (or derived from element).
 * Appends to the same capture layer container as SessionOverlay / ElementHighlighter.
 */
export function createMarker(
  captureLayerContainer: HTMLElement,
  data: FeedbackMarkerData,
  options: FeedbackMarkerOptions = {}
): void {
  const { onMarkerClick, getSessionPaused } = options;

  if (!captureLayerContainer) return;

  const markerLayer = document.getElementById("echly-marker-layer");
  if (!markerLayer) return;

  container = markerLayer;
  const index = markers.length + 1;

  let x = data.x;
  let y = data.y;
  if (data.element) {
    const center = getCenterFromElement(data.element);
    x = center.x;
    y = center.y;
  }

  // Collision nudge — offset if within 28px of any existing marker
  let offsetX = 0;
  let offsetY = 0;
  const MIN_DISTANCE = 28;
  const NUDGE_STEP = 22;
  let attempts = 0;
  while (
    attempts < 12 &&
    markers.some(
      (m) =>
        Math.hypot(m.x + m.offsetX - (x + offsetX), m.y + m.offsetY - (y + offsetY)) < MIN_DISTANCE
    )
  ) {
    const angle = (attempts * Math.PI) / 3;
    offsetX = Math.round(Math.cos(angle) * NUDGE_STEP * (1 + Math.floor(attempts / 6)));
    offsetY = Math.round(Math.sin(angle) * NUDGE_STEP * (1 + Math.floor(attempts / 6)));
    attempts++;
  }

  const marker = document.createElement("div");
  marker.className = "echly-marker";
  marker.setAttribute("data-echly-ui", "true");
  marker.setAttribute("aria-label", `Feedback ${index}`);
  marker.textContent = String(index);
  marker.style.cssText = [
    "position:absolute",
    "width:26px",
    "height:26px",
    "border-radius:50%",
    "background:#5A49BF",
    "color:#fff",
    "font-size:11px",
    "font-weight:700",
    "font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "box-shadow:0 2px 8px rgba(90,73,191,0.35),0 0 0 2px #fff",
    "pointer-events:auto",
    "box-sizing:border-box",
    "z-index:1",
    "transition:transform 0.15s ease,box-shadow 0.15s ease",
  ].join(";");
  marker.style.setProperty("cursor", "pointer", "important");

  const tooltip = document.createElement("span");
  tooltip.className = "echly-marker-tooltip";
  tooltip.setAttribute("data-echly-ui", "true");
  tooltip.style.cssText = [
    "position:absolute",
    "bottom:calc(100% + 8px)",
    "left:50%",
    "transform:translateX(-50%)",
    "padding:6px 10px",
    "border-radius:8px",
    "background:#15101F",
    "color:#fff",
    "font-size:12px",
    "font-weight:500",
    "font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",
    "white-space:nowrap",
    "max-width:200px",
    "overflow:hidden",
    "text-overflow:ellipsis",
    "pointer-events:none",
    "opacity:0",
    "transition:opacity 0.15s ease",
    "z-index:10",
    "box-shadow:0 4px 12px rgba(0,0,0,0.15)",
  ].join(";");
  tooltip.textContent = data.title ?? `Feedback #${index}`;
  marker.appendChild(tooltip);

  marker.addEventListener("mouseenter", () => {
    marker.style.transform = "translate(-50%,-50%) scale(1.12)";
    marker.style.boxShadow = "0 4px 12px rgba(90,73,191,0.45),0 0 0 2px #fff";
    tooltip.style.opacity = "1";
  });
  marker.addEventListener("mouseleave", () => {
    marker.style.transform = "translate(-50%,-50%) scale(1)";
    marker.style.boxShadow = "0 2px 8px rgba(90,73,191,0.35),0 0 0 2px #fff";
    tooltip.style.opacity = "0";
  });

  applyPosition(marker, x + offsetX, y + offsetY);

  const entry: MarkerEntry = {
    ...data,
    x,
    y,
    index,
    domElement: marker,
    offsetX,
    offsetY,
  };
  markers.push(entry);

  marker.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (getSessionPaused?.()) return;
    if (ECHLY_DEBUG) console.log(`${LOG_PREFIX} marker clicked`, entry.id);
    onMarkerClick?.({ id: entry.id, x: entry.x, y: entry.y, element: entry.element, title: entry.title, index: entry.index });
  });

  container.appendChild(marker);
  if (markers.length === 1) setupScrollResizeListeners();

  if (ECHLY_DEBUG) console.log(`${LOG_PREFIX} marker created`, entry.id, index);
}

/**
 * Update an existing marker's id and/or title (e.g. when server id/title is known).
 */
export function updateMarker(
  markerId: string,
  updates: { id?: string; title?: string }
): void {
  const entry = markers.find((m) => m.id === markerId);
  if (!entry) return;
  if (updates.id != null) entry.id = updates.id;
  if (updates.title != null) entry.title = updates.title;
  const tooltipEl = entry.domElement.querySelector(".echly-marker-tooltip");
  if (tooltipEl) tooltipEl.textContent = entry.title ?? `Feedback #${entry.index}`;
}

/**
 * Remove a single marker by id (e.g. when capture is cancelled or submission fails).
 */
export function removeMarker(markerId: string): void {
  const idx = markers.findIndex((m) => m.id === markerId);
  if (idx === -1) return;
  const entry = markers[idx];
  entry.domElement.remove();
  markers.splice(idx, 1);
  if (markers.length === 0) teardownScrollResizeListeners();
}

/**
 * Update all marker positions (e.g. after scroll/resize).
 * Uses stored element reference when available.
 */
export function updateMarkerPositions(): void {
  for (const entry of markers) {
    if (entry.element && entry.element.isConnected) {
      const { x, y } = getCenterFromElement(entry.element);
      entry.x = x;
      entry.y = y;
      applyPosition(entry.domElement, x + (entry.offsetX || 0), y + (entry.offsetY || 0));
    }
    // If no element, keep existing position (fixed viewport coords at creation time)
  }
}

/**
 * Remove all markers and clear in-memory state. Call when session ends.
 * Only clears children of #echly-marker-layer.
 */
export function removeAllMarkers(): void {
  const markerLayer = document.getElementById("echly-marker-layer");
  if (markerLayer) {
    while (markerLayer.firstChild) {
      markerLayer.removeChild(markerLayer.firstChild);
    }
  }
  for (const entry of markers) {
    if (ECHLY_DEBUG) console.log(`${LOG_PREFIX} marker removed`, entry.id);
  }
  markers.length = 0;
  container = null;
  teardownScrollResizeListeners();
}
