/**
 * Session Feedback Mode: helpers and safety checks.
 * Do not break existing region capture flow.
 */
import { isAnnoteElement } from "@/lib/captureContext";
import { ECHLY_DEBUG } from "@/lib/utils/logger";

const SESSION_LOG = "[SESSION]";

export function logSession(message: string): void {
  if (ECHLY_DEBUG && typeof console !== "undefined" && console.debug) {
    console.debug(`${SESSION_LOG} ${message}`);
  }
}

/**
 * Form fields ARE valid capture targets ("this field's placeholder is wrong"),
 * but their clicks must never be swallowed — the click still has to
 * focus/toggle/open the field. Click capture checks this to skip
 * preventDefault for them.
 */
export function isFormFieldElement(element: Element | null): boolean {
  if (!element) return false;
  const tag = element.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  const ce = element.getAttribute?.("contenteditable");
  if (ce === "true" || ce === "") return true;
  // Rich-text editors nest elements inside a contenteditable root.
  if ((element as HTMLElement).isContentEditable) return true;
  return false;
}

/** Elements we must never treat as capture targets (Echly UI, body/html). */
export function isSessionCaptureTarget(element: Element | null): boolean {
  if (!element || element === document.body || element === document.documentElement) {
    return false;
  }
  if (isAnnoteElement(element)) return false;
  const host = document.getElementById("echly-shadow-host");
  if (host && host.contains(element)) return false;
  return true;
}

/**
 * Single target-resolution used by BOTH the hover highlighter and click
 * capture, so what the user sees highlighted is exactly what a click
 * captures. Walks the hit-test stack to see through Echly overlay layers.
 */
export function findCaptureTargetAtPoint(x: number, y: number): Element | null {
  if (typeof document.elementsFromPoint !== "function") {
    const el = document.elementFromPoint(x, y);
    return el && isSessionCaptureTarget(el) ? el : null;
  }
  for (const el of document.elementsFromPoint(x, y)) {
    if (isSessionCaptureTarget(el)) return el;
  }
  return null;
}
