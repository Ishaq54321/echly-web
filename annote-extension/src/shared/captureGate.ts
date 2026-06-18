/**
 * Capture-enabled runtime gate for the MAIN-world wrappers.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 * The three MAIN-world capture bundles (mainWorld.js / mainWorldNetwork.js /
 * mainWorldActions.js) monkey-patch the page's own fetch, XMLHttpRequest,
 * console.*, history.pushState/replaceState, and attach document/window event
 * listeners. Under Manifest V3 these patches CANNOT be cleanly uninstalled from
 * the isolated world — once injected, the wrappers live in the page realm and
 * only die when the page navigates (the "M3 lingering-wrappers limitation").
 *
 * That meant a wrapper installed during one engagement kept running on the page
 * AFTER the engagement ended — and a non-transparent wrapper (one that clones a
 * Request, reads/locks a Response body, schedules a microtask, or does any DOM
 * work) is observable to the page. The confirmed real bug: after opening then
 * closing Annote on a tab, our lingering fetch/XHR wrapper broke LinkedIn's
 * fetch-based URL-validation form.
 *
 * The fix is this gate. Each MAIN bundle reads `isCaptureEnabled()` on EVERY
 * wrapper invocation. When the gate is OFF, the wrapper does native-call-and-
 * return and ABSOLUTELY NOTHING ELSE — indistinguishable from the native
 * function never having been wrapped. The wrappers stay installed (we can't
 * remove them), but they become perfectly transparent passthroughs.
 *
 * ── Default-OFF / fail-safe ────────────────────────────────────────────────
 * The flag DEFAULTS TO FALSE in every code path. It only ever flips true on an
 * explicit `enabled: true` control message that the service worker sends while
 * a tab is part of an active Annote engagement. Cold start, race, missing
 * state, a tab that isn't engaged — all read OFF. Interference is only ever
 * possible during an explicit, confirmed engagement.
 *
 * ── Transport ──────────────────────────────────────────────────────────────
 * MAIN-world scripts cannot use chrome.runtime. The only channel both worlds
 * share is `window.postMessage`. The service worker sends the on/off decision
 * to the isolated-world relay (see shared/captureGateRelay.ts, installed from
 * bootstrap.ts); the relay re-posts it into the MAIN realm where this gate
 * listens. The gate is a per-bundle closure (each MAIN bundle tree-shakes its
 * own copy in — there is no shared runtime, only shared source, exactly like
 * privacy.ts), so all three bundles converge on the same value because they all
 * receive the same broadcast.
 *
 * Late-injection race: a capture bundle can be injected AFTER the SW already
 * sent the enable message (e.g. re-inject on navigation during a live
 * engagement). To avoid staying stuck OFF through a genuine engagement, the
 * gate posts a one-shot STATE_REQUEST on install; the isolated relay answers
 * with the last value the SW pushed. Combined with the SW re-broadcasting the
 * enable on every (re-)inject, the gate converges either way.
 */

/** Protocol constants — shared by the MAIN-world gate and the isolated relay. */
export const CAPTURE_GATE_SOURCE_ISOLATED = "annote-isolated" as const;
export const CAPTURE_GATE_SOURCE_MAIN = "annote-main" as const;

/** Isolated → MAIN: set the capture-enabled flag. `enabled` is a strict boolean. */
export const CAPTURE_GATE_SET = "ECHLY_CAPTURE_GATE_SET" as const;
/** MAIN → isolated: a freshly-installed gate asks for the current value. */
export const CAPTURE_GATE_STATE_REQUEST = "ECHLY_CAPTURE_GATE_STATE_REQUEST" as const;

export type CaptureGateSetMessage = {
  source: typeof CAPTURE_GATE_SOURCE_ISOLATED;
  type: typeof CAPTURE_GATE_SET;
  enabled: boolean;
};

export type CaptureGateStateRequestMessage = {
  source: typeof CAPTURE_GATE_SOURCE_MAIN;
  type: typeof CAPTURE_GATE_STATE_REQUEST;
};

/**
 * Per-bundle closure flag. FAIL-SAFE DEFAULT: false. Nothing in this module
 * ever sets it true except an explicitly-validated `enabled === true` control
 * message. A malformed/ambiguous message can only ever resolve to a boolean via
 * the `=== true` coercion below, so a garbage payload can never turn capture on.
 */
let captureEnabled = false;

/** Whether installCaptureGate() has already run in this realm (idempotent). */
let gateInstalled = false;

/**
 * One-shot OFF→ON transition subscribers. Registered by a bundle (console pre-
 * buffer drain — Layer 3; resource-timing replay — Layer 2) that needs to run
 * work exactly when this tab first becomes engaged. Each fires AT MOST ONCE: the
 * pre-engagement evidence drain/replay is a one-time recovery, not a per-toggle
 * action (a pause→resume mid-engagement must NOT re-drain a now-empty pre-buffer
 * or re-replay the same resource-timing entries). Fired synchronously the first
 * time the gate goes from OFF to ON. Never throws out to the gate's message
 * handler — a subscriber that throws is swallowed so it can't break the gate.
 */
const onEnabledOnceSubs: Array<() => void> = [];
let firedEnabledOnce = false;

/**
 * Register a callback to run exactly once, the first time capture transitions
 * OFF→ON in this realm. If the gate is ALREADY on when you subscribe (a late
 * subscriber after the enable broadcast already landed), the callback runs
 * synchronously right now. Safe to call from bundle init. Never throws.
 */
export function onCaptureEnabledOnce(cb: () => void): void {
  if (typeof cb !== "function") return;
  if (firedEnabledOnce && captureEnabled === true) {
    // Already engaged — run immediately so a late subscriber still recovers the
    // pre-engagement evidence.
    try {
      cb();
    } catch {
      // swallow — a faulty subscriber must never break capture.
    }
    return;
  }
  onEnabledOnceSubs.push(cb);
}

/** Fire the one-shot OFF→ON subscribers. Idempotent; drains the list. */
function fireEnabledOnce(): void {
  if (firedEnabledOnce) return;
  firedEnabledOnce = true;
  // Copy + clear first so a subscriber that (re-)subscribes can't loop.
  const subs = onEnabledOnceSubs.splice(0, onEnabledOnceSubs.length);
  for (const cb of subs) {
    try {
      cb();
    } catch {
      // swallow — one bad subscriber must not starve the others or break the gate.
    }
  }
}

/**
 * Read the current capture-enabled state. Called by every MAIN-world wrapper on
 * EVERY invocation — must be a trivial, synchronous, allocation-free read so the
 * disabled passthrough adds no measurable latency over the native call.
 */
export function isCaptureEnabled(): boolean {
  return captureEnabled === true;
}

/**
 * Install the MAIN-world side of the gate: listen for SET messages from the
 * isolated relay and request the current value once on install (to win the
 * late-injection race). Idempotent — safe to call from each bundle even though
 * the IIFE double-install guards already prevent re-running a whole bundle.
 *
 * Never throws: a page that blocks addEventListener still leaves captureEnabled
 * at its safe default (false), so the wrappers stay transparent.
 */
export function installCaptureGate(): void {
  if (gateInstalled) return;
  gateInstalled = true;
  if (typeof window === "undefined") return;

  try {
    window.addEventListener("message", (event) => {
      // ── DORMANT-PAGE HOT PATH (load-bearing) ──────────────────────────────
      // Since Layer 1 (declarative MAIN install at document_start) this listener
      // now runs on EVERY page — including never-engaged ones — for EVERY
      // postMessage the host fires. On postMessage-saturated SPAs (LinkedIn fires
      // thousands during load) this is squarely the listener that the LinkedIn
      // load-blocking fix was about. So it MUST early-exit on the very first,
      // cheapest comparison before touching `event.data` (reading it can force a
      // structured-clone deserialization of a large foreign payload):
      //   1. `event.source !== window` — an identity compare, no deserialization,
      //      rejects every cross-frame/iframe/embed message (the bulk of LinkedIn's
      //      traffic) immediately.
      //   2. origin compare — still no `event.data` read.
      // Only AFTER both pass do we touch `event.data`. Same discipline as the
      // sessionRelay / console-network-actions snapshot bridges. Do not reorder
      // these or hoist a `const data = event.data` above the source check.
      if (event.source !== window) return;
      if (event.origin !== "" && event.origin !== window.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const typed = data as { source?: unknown; type?: unknown; enabled?: unknown };
      if (typed.source !== CAPTURE_GATE_SOURCE_ISOLATED) return;
      if (typed.type !== CAPTURE_GATE_SET) return;
      // Strict boolean coercion: only an explicit `true` enables capture; every
      // other value (undefined, "true", 1, null) resolves to false. Fail-safe.
      const next = typed.enabled === true;
      const wasOff = captureEnabled !== true;
      captureEnabled = next;
      // First OFF→ON transition: fire the one-shot subscribers (Layer 3 console
      // pre-buffer drain, Layer 2 resource-timing replay). Guarded by fireEnabledOnce's
      // own idempotency, so a later pause→resume can't re-fire them.
      if (next && wasOff) fireEnabledOnce();
    });
  } catch {
    // Page blocked addEventListener — leave captureEnabled at its OFF default.
  }

  // One-shot pull so a gate installed AFTER the SW's broadcast still learns the
  // current value. The isolated relay answers from the last SW-pushed state.
  try {
    const req: CaptureGateStateRequestMessage = {
      source: CAPTURE_GATE_SOURCE_MAIN,
      type: CAPTURE_GATE_STATE_REQUEST,
    };
    window.postMessage(req, "*");
  } catch {
    // postMessage shouldn't throw; if it does, we stay OFF until the SW's next
    // broadcast (every (re-)inject during an engagement re-sends it).
  }
}
