/**
 * Session Feedback Mode: helpers and safety checks.
 * Do not break existing region capture flow.
 */

import { isEchlyElement } from "@/lib/captureContext";

const SESSION_LOG = "[SESSION]";

export function logSession(message: string): void {
  if (typeof console !== "undefined" && console.debug) {
    console.debug(`${SESSION_LOG} ${message}`);
  }
}

/** Elements we must never treat as capture targets (Echly UI + form controls). */
export function isSessionCaptureTarget(element: Element | null): boolean {
  if (!element || element === document.body) return false;
  if (isEchlyElement(element)) return false;
  const host = document.getElementById("echly-shadow-host");
  if (host && host.contains(element)) return false;
  const tag = element.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return false;
  const ce = element.getAttribute?.("contenteditable");
  if (ce === "true" || ce === "") return false;
  return true;
}
