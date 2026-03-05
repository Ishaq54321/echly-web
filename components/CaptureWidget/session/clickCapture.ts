/**
 * Click interception for Session Feedback Mode (capture phase).
 * Prevents default and stops propagation; returns only valid capture targets.
 */

import { isSessionCaptureTarget, logSession } from "./sessionMode";

let clickBound: ((e: MouseEvent) => void) | null = null;
let enabledRef: () => boolean = () => false;
let callbackRef: (element: Element) => void = () => {};

function handleClick(e: MouseEvent) {
  if (e.button !== 0) return;
  if (!enabledRef()) return;
  const target = e.target as Element | null;
  if (!target || !isSessionCaptureTarget(target)) return;
  e.preventDefault();
  e.stopPropagation();
  logSession("element clicked");
  callbackRef(target);
}

/**
 * Attach capture-phase click listener. Only invokes onElementClicked for valid targets.
 * Returns cleanup.
 */
export function attachClickCapture(
  _container: HTMLElement,
  options: {
    enabled: () => boolean;
    onElementClicked: (element: Element) => void;
  }
): () => void {
  enabledRef = options.enabled;
  callbackRef = options.onElementClicked;
  if (clickBound) {
    document.removeEventListener("click", clickBound, true);
  }
  clickBound = handleClick;
  document.addEventListener("click", clickBound, true);
  return () => detachClickCapture();
}

export function detachClickCapture(): void {
  if (clickBound) {
    document.removeEventListener("click", clickBound, true);
    clickBound = null;
  }
  enabledRef = () => false;
  callbackRef = () => {};
}
