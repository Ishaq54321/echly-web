/**
 * Isolated-world relay for the capture-enabled gate.
 *
 * Lives in the isolated content-script world (installed from bootstrap.ts, so it
 * is present on every page from document_start — it does NOT depend on the MAIN
 * capture bundles being injected). Bridges the two channels:
 *
 *   service worker  ──chrome.runtime──▶  this relay  ──window.postMessage──▶  MAIN gate
 *
 * The SW knows the engagement lifecycle and sends ECHLY_SET_CAPTURE_ENABLED
 * (true/false) to the tab. MAIN-world scripts cannot receive chrome.runtime
 * messages, so this relay re-posts the decision into the page realm where the
 * gate (shared/captureGate.ts) listens.
 *
 * It also caches the last value the SW pushed and answers the MAIN gate's
 * one-shot STATE_REQUEST — closing the late-injection race where a capture
 * bundle is injected AFTER the SW already broadcast (e.g. re-inject on
 * navigation during a live engagement).
 *
 * FAIL-SAFE: the cached value starts false, and only an explicit `enabled ===
 * true` from the SW flips it true. A relay that never hears from the SW reports
 * OFF forever — wrappers stay transparent.
 */

import {
  CAPTURE_GATE_SET,
  CAPTURE_GATE_SOURCE_ISOLATED,
  CAPTURE_GATE_SOURCE_MAIN,
  CAPTURE_GATE_STATE_REQUEST,
  type CaptureGateSetMessage,
} from "./captureGate";

/** Runtime message the service worker sends to this isolated-world relay. */
export const SET_CAPTURE_ENABLED_MESSAGE = "ECHLY_SET_CAPTURE_ENABLED" as const;

/** Last value the SW pushed for THIS tab. Fail-safe default: OFF. */
let lastEnabled = false;
let relayInstalled = false;

/** Post the current enabled value into the MAIN realm. */
function postToMain(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const msg: CaptureGateSetMessage = {
      source: CAPTURE_GATE_SOURCE_ISOLATED,
      type: CAPTURE_GATE_SET,
      enabled: enabled === true,
    };
    window.postMessage(msg, "*");
  } catch {
    // postMessage shouldn't throw; if it does the MAIN gate stays at its last
    // known value (OFF by default), which is the safe direction.
  }
}

/**
 * Apply the SW's on/off decision: cache it and re-post into the MAIN realm.
 *
 * The chrome.runtime listener for ECHLY_SET_CAPTURE_ENABLED is NOT owned here
 * anymore — bootstrap routes that message through its single, always-present
 * chrome.runtime.onMessage listener (so the relay's window listener can be
 * installed lazily on first engagement without losing the first enable). Bootstrap
 * calls this for every ECHLY_SET_CAPTURE_ENABLED it sees. Calling this before
 * installCaptureGateRelay() is safe: it still caches lastEnabled (so the STATE_REQUEST
 * answer is correct once the window listener installs) and posts to MAIN.
 */
export function applyCaptureEnabled(enabled: boolean): void {
  lastEnabled = enabled === true;
  postToMain(lastEnabled);
}

export function installCaptureGateRelay(): void {
  if (relayInstalled) return;
  if (typeof window === "undefined") return;
  relayInstalled = true;

  // ── MAIN → isolated: answer a freshly-installed gate's STATE_REQUEST. ──
  // A capture bundle injected after the SW's broadcast posts STATE_REQUEST on
  // install; we reply with the last value the SW gave us so it converges
  // without waiting for the next SW broadcast.
  //
  // This window "message" listener is the reason the relay is installed LAZILY
  // (on first engagement, from bootstrap) rather than at document_start: it runs
  // on every postMessage the host page fires, and a dormant page must carry none
  // of the capture listeners. The SET decision itself arrives via chrome.runtime
  // (routed through bootstrap → applyCaptureEnabled), not this window channel.
  try {
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      if (event.origin !== "" && event.origin !== window.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const typed = data as { source?: unknown; type?: unknown };
      if (typed.source !== CAPTURE_GATE_SOURCE_MAIN) return;
      if (typed.type !== CAPTURE_GATE_STATE_REQUEST) return;
      postToMain(lastEnabled);
    });
  } catch {
    // Page blocked addEventListener — the SW's direct broadcasts still drive
    // the gate; only the late-injection pull is lost, and the SW re-broadcasts
    // on every (re-)inject anyway.
  }
}
