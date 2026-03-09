/**
 * Selective UI hiding for screenshot capture.
 * Hides Echly widget, panels, voice UI — but NOT the region selection overlay.
 * The selection overlay (echly-region-overlay, echly-region-cutout) must remain visible.
 *
 * Do NOT hide: #echly-root, #echly-capture-root, .echly-region-overlay, .echly-region-cutout
 */

const SHADOW_HOST_ID = "echly-shadow-host";

/**
 * Selectors for Echly UI to hide during capture.
 * Excludes: #echly-root, #echly-capture-root, .echly-region-overlay, .echly-region-cutout
 */
const UI_SELECTORS = [
  ".echly-sidebar-container",
  ".echly-floating-trigger-wrapper",
  ".echly-capture-card",
  ".echly-session-controls",
  ".echly-session-overlay-cursor",
  ".echly-session-tray",
  ".echly-session-panel",
  ".echly-session-widget",
  ".echly-session-context",
  ".echly-dim-layer",
  ".echly-region-confirm-bar",
  /* Feedback tray: voice mode selector and "Voice (Recommended)" pill */
  ".echly-mode-container",
  ".echly-mode-tile",
  ".echly-mode-card",
  ".echly-voice-pill-wrapper",
  ".echly-voice-pill",
];

export function hideEchlyUI(): Element[] {
  const host = document.getElementById(SHADOW_HOST_ID);
  if (!host || !host.shadowRoot) return [];

  const root = host.shadowRoot;
  const hidden: Element[] = [];

  UI_SELECTORS.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => {
      hidden.push(el);
      (el as HTMLElement).dataset.prevVisibility = (el as HTMLElement).style.visibility;
      (el as HTMLElement).style.visibility = "hidden";
    });
  });

  return hidden;
}

export function restoreEchlyUI(hidden: Element[]): void {
  hidden.forEach((el) => {
    const prev = (el as HTMLElement).dataset.prevVisibility;
    (el as HTMLElement).style.visibility = prev ?? "";
  });
}
