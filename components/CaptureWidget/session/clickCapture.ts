/**
 * Click interception for Session Feedback Mode (capture phase).
 * Prevents default and stops propagation for ordinary elements; form fields
 * are captured WITHOUT swallowing the click so they still focus and operate.
 */

import {
  findCaptureTargetAtPoint,
  isFormFieldElement,
  isSessionCaptureTarget,
  logSession,
} from "./sessionMode";

let clickBound: ((e: MouseEvent) => void) | null = null;
let enabledRef: () => boolean = () => false;
let callbackRef: (element: Element) => void = () => {};

function handleClick(e: MouseEvent) {
  if (e.button !== 0) return;
  if (!enabledRef()) return;
  // Same resolution as the hover highlighter, so the highlighted element is
  // exactly the captured one.
  const direct = e.target as Element | null;
  const target =
    direct && isSessionCaptureTarget(direct)
      ? direct
      : findCaptureTargetAtPoint(e.clientX, e.clientY);
  if (!target) return;
  if (!isFormFieldElement(target)) {
    e.preventDefault();
    e.stopPropagation();
  }
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
