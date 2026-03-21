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

  const marker = document.createElement("div");
  marker.className = "echly-marker";
  marker.setAttribute("data-echly-ui", "true");
  marker.setAttribute("aria-label", `Feedback ${index}`);
  marker.textContent = String(index);
  marker.title = data.title ?? `Feedback #${index}`;

  marker.style.cssText = [
    "position:absolute",
    "width:24px",
    "height:24px",
    "border-radius:999px",
    "background:#FF553D",
    "color:white",
    "font-size:12px",
    "font-weight:600",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "box-shadow:0 2px 6px rgba(0,0,0,.35)",
    "cursor:pointer",
    "pointer-events:auto",
    "box-sizing:border-box",
  ].join(";");

  applyPosition(marker, x, y);

  const entry: MarkerEntry = {
    ...data,
    x,
    y,
    index,
    domElement: marker,
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
  entry.domElement.title = entry.title ?? `Feedback #${entry.index}`;
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
      applyPosition(entry.domElement, x, y);
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
