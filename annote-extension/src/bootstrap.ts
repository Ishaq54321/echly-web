/**
 * Bootstrap content script — tiny, statically injected on every page at document_start.
 * Responsibilities:
 *   - Register the chrome.runtime.onMessage listener immediately so messages are never lost.
 *   - Lazy-load widget.js (~360 KB) only when needed (user opens widget OR active session restored).
 *   - Buffer state and messages until widget mounts; flush after script.onload.
 *   - Manage keepalive port and host visibility (both work without the widget loaded).
 *   - Keep sessionRelay (postMessage ping/pong) available so web pages can detect the extension.
 */

import "./sessionRelay";
import { installBridgeListener } from "./console/bridge";
import { installNetworkBridgeListener } from "./network/bridge";
import { installActionsBridgeListener } from "./actions/bridge";
import { installCaptureGateRelay, applyCaptureEnabled, SET_CAPTURE_ENABLED_MESSAGE } from "./shared/captureGateRelay";

declare global {
  interface Window {
    __ECHLY_BOOTSTRAP_LOADED__?: boolean;
    __ECHLY_WIDGET_LOADED__?: boolean;
    __ECHLY_APPLY_GLOBAL_STATE__?: (state: GlobalUIState) => void;
    __ECHLY_ENSURE_KEEPALIVE__?: () => void;
    __ECHLY_DISCONNECT_KEEPALIVE__?: () => void;
  }
}

type GlobalUIState = {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  session: { id: string | null; status: "idle" | "active" | "paused" };
  sessionTitle: string | null;
  sessionLoading: boolean;
  feedback: {
    items: unknown[];
    nextCursor: string | null;
    hasMore: boolean;
    isFetching: boolean;
    recovering: boolean;
    recoveryAttempts: number;
  };
  counts: { total: number };
  captureMode: "voice" | "text";
  openCount: number;
  resolvedCount: number;
  feedbackLimitReached?: boolean;
  feedbackLimitMessage?: string | null;
  feedbackUpgradePlan?: string | null;
  feedbackJobs?: Array<{ id: string; status: string; createdAt: number; errorMessage?: string }>;
  editPauseTooltipVisible?: boolean;
};

type RuntimeMessage = {
  type?: string;
  state?: GlobalUIState;
  ticket?: { id: string; title: string; description?: string; type?: string };
  sessionId?: string;
  enabled?: boolean;
};

type GlobalStateResponse = { state?: GlobalUIState } | undefined;

const SHADOW_HOST_ID = "echly-shadow-host";

/* ─── Instant skeleton (Fix 3) ──────────────────────────────────────────────
   A ~1KB static clone of the widget's "Connecting to Annote…" pill
   (content.tsx authState==="loading"), painted synchronously the instant the SW
   sends ECHLY_OPENING — before the widget bundle (~360KB) has even started to
   download. It lives in its OWN host (echly-skeleton-host), separate from the
   widget's echly-shadow-host, so the widget's mount path (which calls
   host.attachShadow and only mounts React when its host doesn't yet exist) is
   left completely untouched. The two hosts pin to the same bottom-right corner,
   so they overlap exactly; the skeleton is removed in the SAME rAF the real pill
   commits its first paint (ECHLY_WIDGET_PAINTED), giving no flash-of-empty.
   No React, no imports, no fetch — inline strings only. */
const SKELETON_HOST_ID = "echly-skeleton-host";

// Inlined logo (assets/annote-logo-icon.svg) so the skeleton needs zero network.
const SKELETON_LOGO_SVG =
  '<svg width="48" height="60" viewBox="0 0 44 55" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M43.0959 11.4316C41.0954 11.3859 36.1417 11.0038 31.2531 7.59108C28.4558 5.62764 26.1671 3.02527 24.5772 0H14.9759V9.25937C14.851 9.45229 14.6914 9.62036 14.5051 9.75501C14.4568 9.74508 14.4077 9.73997 14.3584 9.73978H0V24.8306H15.0908V11.9771C15.4507 11.6814 15.891 11.5001 16.3548 11.4565C19.6775 16.0751 23.1761 18.5533 25.4923 19.8908C33.0986 24.2809 43.0627 25.0798 43.0959 24.9455C43.0779 24.8015 43.0752 20.8834 43.0959 11.4316Z" fill="url(#esk0)"/>' +
  '<path d="M1.18097e-06 43.4318C2.00058 43.4775 6.95421 43.8596 11.8428 47.2723C14.6401 49.2358 16.9288 51.8382 18.5187 54.8634H28.12V45.604C28.2449 45.4112 28.4045 45.2431 28.5908 45.1084C28.6391 45.1184 28.6882 45.1235 28.7375 45.1236H43.0959V30.0328H28.0051V42.8863C27.6452 43.182 27.2049 43.3634 26.7411 43.4069C23.4184 38.7883 19.9198 36.31 17.6036 34.9726C9.99729 30.5825 0.0332261 29.7836 0 29.9179C0.0179988 30.0619 0.0207666 33.98 1.18097e-06 43.4318Z" fill="url(#esk1)"/>' +
  '<defs>' +
  '<linearGradient id="esk0" x1="1.5" y1="13.8135" x2="32.7219" y2="31.7272" gradientUnits="userSpaceOnUse"><stop stop-color="#974B89"/><stop offset="1" stop-color="#5148C7"/></linearGradient>' +
  '<linearGradient id="esk1" x1="0" y1="54.8634" x2="32.3504" y2="73.4246" gradientUnits="userSpaceOnUse"><stop stop-color="#573372"/><stop offset="1" stop-color="#FD0C63"/></linearGradient>' +
  '</defs></svg>';

/* Self-contained CSS — every value resolved to a literal. The widget's real CSS uses
   cascading custom properties (the glass / brand / soft tokens) that only exist once
   popup.css loads in the widget's shadow root, so the skeleton can't depend on those.
   Mirrors .auth-check-pill / .auth-check-body / .auth-check-logo / .auth-check-bar /
   .auth-check-text and their two keyframes from app/globals.css. */
const SKELETON_STYLE = `
:host { all: initial; }
.esk-pill {
  width: 320px;
  box-sizing: border-box;
  background: rgba(252, 251, 249, 0.86);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(28, 25, 23, 0.08);
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(28, 25, 23, 0.05), 0 1px 4px rgba(28, 25, 23, 0.035);
  font-family: "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.esk-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px 28px;
  gap: 16px;
}
.esk-logo {
  width: 64px; height: 64px;
  display: grid; place-items: center;
  animation: esk-breathe 2s ease-in-out infinite;
}
.esk-bar-wrap {
  width: 120px; height: 3px;
  border-radius: 3px;
  background: #F8F8F8;
  overflow: hidden;
  margin-top: 2px;
}
.esk-bar {
  width: 40%; height: 100%;
  border-radius: 3px;
  background: #5A49BF;
  animation: esk-slide 1.2s ease-in-out infinite;
}
.esk-text {
  font-size: 13px; font-weight: 500;
  color: #8A8096;
  letter-spacing: -0.003em;
}
@keyframes esk-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes esk-slide {
  0% { transform: translateX(-100%); width: 40%; }
  50% { transform: translateX(150%); width: 60%; }
  100% { transform: translateX(300%); width: 40%; }
}`;

/** Paint the static skeleton. Idempotent — a second ECHLY_OPENING (or the
 *  ECHLY_OPEN_WIDGET fast-path) is a no-op once the host exists. Synchronous so the
 *  browser can paint it on the very next frame. Never throws (restricted pages, no body). */
function paintSkeleton(): void {
  try {
    if (document.getElementById(SKELETON_HOST_ID)) return; // already shown
    // If the real widget already mounted, there is nothing to pre-paint.
    if (window.__ECHLY_WIDGET_LOADED__) return;
    const root = document.body || document.documentElement;
    if (!root) return;

    const host = document.createElement("div");
    host.id = SKELETON_HOST_ID;
    host.setAttribute("data-annote-ui", "true");
    // Same fixed corner as the widget host so they overlap exactly (no jump on swap).
    host.style.position = "fixed";
    host.style.bottom = "24px";
    host.style.right = "24px";
    host.style.top = "auto";
    host.style.left = "auto";
    host.style.zIndex = "2147483647";
    host.style.pointerEvents = "none"; // purely cosmetic; never intercept page clicks

    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = SKELETON_STYLE;
    const pill = document.createElement("div");
    pill.className = "esk-pill";
    pill.innerHTML =
      '<div class="esk-body">' +
      '<div class="esk-logo">' + SKELETON_LOGO_SVG + "</div>" +
      '<div class="esk-bar-wrap"><div class="esk-bar"></div></div>' +
      '<div class="esk-text">Connecting to Annote…</div>' +
      "</div>";
    shadow.appendChild(style);
    shadow.appendChild(pill);
    root.appendChild(host);
    bootstrapPerfMark("skeleton painted (ECHLY_OPENING received)");

    // Per-paint safety net: if the widget never commits its first paint (failed/blocked
    // injection, or an unauthenticated open whose widget bundle never runs) and no
    // ECHLY_CLOSE_WIDGET follows, drop the skeleton after 6s so it can't spin forever.
    // 6s comfortably exceeds a cold widget load; on any successful open the real pill has
    // already replaced it (ECHLY_WIDGET_PAINTED) well before this fires, and removeSkeleton
    // is a no-op once the host is gone. Armed here (not at bootstrap load) so the timer is
    // relative to when the skeleton actually appeared.
    setTimeout(() => {
      if (!window.__ECHLY_WIDGET_LOADED__) removeSkeleton();
    }, 6000);
  } catch {
    /* never let a cosmetic skeleton break the page */
  }
}

/** Remove the skeleton host if present. Called on widget first-paint and on close. */
function removeSkeleton(): void {
  const host = document.getElementById(SKELETON_HOST_ID);
  if (host) host.remove();
}

/* Open-path instrumentation (bootstrap side). Gated on window.__ECHLY_DEBUG__ so we don't
   pull the logger module into this tiny bundle. performance.now() here is page-relative;
   correlate with the SW's [ECHLY PERF] lines by wall-clock in the same console session. */
function bootstrapPerfMark(label: string): void {
  if ((window as Window & { __ECHLY_DEBUG__?: boolean }).__ECHLY_DEBUG__ === true) {
    const t = typeof performance !== "undefined" ? performance.now().toFixed(1) : "?";
    console.log(`[ECHLY PERF] bootstrap: ${label} @${t}ms`);
  }
}

if (window.__ECHLY_BOOTSTRAP_LOADED__) {
  // Already loaded (rare — content_scripts shouldn't double-fire, but be defensive).
} else {
  window.__ECHLY_BOOTSTRAP_LOADED__ = true;

  // ─── Capture bridges: LAZY-INSTALLED on first engagement (dormant-footprint fix) ───
  // The four capture-related listeners — console bridge, network bridge, actions
  // bridge, and the capture-gate relay — each add a window "message" listener that
  // runs SYNCHRONOUSLY on EVERY postMessage the host page fires. On postMessage-
  // saturated SPAs (LinkedIn's iframe/embed/analytics traffic = thousands of messages
  // during load), four such listeners at document_start were 4× per-message main-thread
  // work during the load window, which delayed the page from settling (confirmed: the
  // symptom vanished with the extension disabled).
  //
  // They are meaningless on a never-engaged page (no MAIN-world capture bundle is ever
  // injected until the tray opens — that's already engagement-gated in background.ts).
  // So we DON'T install them at load. We install them the first time the SW tells this
  // tab capture is arming (ECHLY_SET_CAPTURE_ENABLED, handled in the onMessage listener
  // below). A genuinely dormant page carries ZERO of these four — only sessionRelay's
  // window listener (for install-detection) plus this chrome.runtime.onMessage listener.
  //
  // Once installed they stay for the page's life (matching prior behavior). Idempotent:
  // every install*() guards on its own listenerInstalled/relayInstalled flag.
  let captureBridgesInstalled = false;
  function installCaptureBridges(): void {
    if (captureBridgesInstalled) return;
    captureBridgesInstalled = true;
    // Console-capture bridge listener: caches MAIN-world flush pushes so we
    // can still return a snapshot during a hard navigation that tears down
    // the MAIN script before the next requestSnapshot fires.
    installBridgeListener();
    // Sibling listener for the network capture stream. Same contract — cache
    // the most recent NETWORK_FLUSH_PUSH so a click-time snapshot request after
    // a hard navigation has a fallback.
    installNetworkBridgeListener();
    // Sibling listener for the user-actions capture stream. Same contract —
    // cache the most recent ACTIONS_FLUSH_PUSH so a click-time snapshot request
    // after a hard navigation has a fallback.
    installActionsBridgeListener();
    // Capture-enabled gate relay: answers a freshly-injected MAIN gate's
    // STATE_REQUEST (window.postMessage) with the last value the SW pushed.
    // The SET decision itself is routed through THIS file's onMessage listener
    // (→ applyCaptureEnabled) rather than a relay-owned chrome.runtime listener,
    // so the very first ECHLY_SET_CAPTURE_ENABLED is never lost to the lazy gate.
    installCaptureGateRelay();
  }

  let widgetLoaded = false;
  let widgetLoading: Promise<void> | null = null;
  let latestGlobalState: GlobalUIState | null = null;
  const pendingEvents: Array<{ type: string; detail?: unknown }> = [];

  // ─── Widget-ready signal ────────────────────────────────────────
  // The widget dispatches "ECHLY_WIDGET_READY" once it has mounted.
  // We resolve a promise on that event instead of polling the
  // __ECHLY_WIDGET_LOADED__ flag every 50ms (pure artificial latency).
  let widgetReadyResolver: (() => void) | null = null;
  const widgetReadyPromise = new Promise<void>((resolve) => {
    widgetReadyResolver = resolve;
  });
  window.addEventListener(
    "ECHLY_WIDGET_READY",
    () => {
      widgetReadyResolver?.();
      widgetReadyResolver = null;
    },
    { once: true }
  );

  // ─── Skeleton → widget swap (Fix 3.4) ───────────────────────────
  // The widget dispatches ECHLY_WIDGET_PAINTED from a requestAnimationFrame AFTER
  // React's first render commits (content.tsx). That is the reliable swap signal —
  // ECHLY_WIDGET_READY fires synchronously at widget entry, BEFORE paint, so removing
  // the skeleton on READY would flash empty. Remove on PAINTED → the real pill is
  // already on screen, so the skeleton disappears under it with no visible gap.
  window.addEventListener(
    "ECHLY_WIDGET_PAINTED",
    () => {
      bootstrapPerfMark("widget first paint (ECHLY_WIDGET_PAINTED) — skeleton removed");
      removeSkeleton();
    },
    { once: true }
  );
  // (The skeleton's own safety-net timeout is armed per-paint inside paintSkeleton, not
  // here — a load-time timer would have long fired before any open >6s after page load.)

  // ─── Keepalive port ─────────────────────────────────────────────
  let keepalivePort: chrome.runtime.Port | null = null;
  let keepaliveSessionActive = false;

  function ensureKeepalivePort(): void {
    if (keepalivePort) return;
    try {
      keepalivePort = chrome.runtime.connect({ name: "echly-keepalive" });
      keepalivePort.onDisconnect.addListener(() => {
        keepalivePort = null;
        if (keepaliveSessionActive) {
          setTimeout(ensureKeepalivePort, 1000);
        }
      });
    } catch {
      keepalivePort = null;
    }
  }

  function disconnectKeepalivePort(): void {
    keepaliveSessionActive = false;
    if (keepalivePort) {
      try { keepalivePort.disconnect(); } catch { /* noop */ }
      keepalivePort = null;
    }
  }

  window.__ECHLY_ENSURE_KEEPALIVE__ = () => {
    keepaliveSessionActive = true;
    ensureKeepalivePort();
  };
  window.__ECHLY_DISCONNECT_KEEPALIVE__ = disconnectKeepalivePort;

  // ─── Host visibility ────────────────────────────────────────────
  function setHostVisibility(visible: boolean): void {
    const host = document.getElementById(SHADOW_HOST_ID) as HTMLDivElement | null;
    if (host) {
      host.style.display = visible ? "block" : "none";
      host.style.pointerEvents = visible ? "auto" : "none";
      host.style.visibility = visible ? "visible" : "hidden";
    }
  }

  function getShouldShowTray(state: GlobalUIState): boolean {
    return state.visible === true || state.session.status !== "idle";
  }

  function setHostVisibilityFromState(state: GlobalUIState): void {
    setHostVisibility(getShouldShowTray(state));
  }

  // ─── Normalize global state ─────────────────────────────────────
  function normalizeGlobalState(state: GlobalUIState | undefined): GlobalUIState | null {
    if (!state) return null;
    return {
      visible: state.visible ?? false,
      expanded: state.expanded ?? false,
      isRecording: state.isRecording ?? false,
      session: {
        id: state.session?.id ?? null,
        status:
          state.session?.status === "active" || state.session?.status === "paused"
            ? state.session.status
            : "idle",
      },
      sessionTitle: state.sessionTitle ?? null,
      sessionLoading: state.sessionLoading ?? false,
      feedback: {
        items: Array.isArray(state.feedback?.items) ? state.feedback.items : [],
        nextCursor: typeof state.feedback?.nextCursor === "string" ? state.feedback.nextCursor : null,
        hasMore: state.feedback?.hasMore === true,
        isFetching: state.feedback?.isFetching === true,
        recovering: state.feedback?.recovering === true,
        recoveryAttempts:
          typeof state.feedback?.recoveryAttempts === "number" ? state.feedback.recoveryAttempts : 0,
      },
      counts: { total: typeof state.counts?.total === "number" ? state.counts.total : 0 },
      openCount: typeof state.openCount === "number" ? state.openCount : 0,
      resolvedCount: typeof state.resolvedCount === "number" ? state.resolvedCount : 0,
      captureMode: state.captureMode === "text" ? "text" : "voice",
      feedbackLimitReached: state.feedbackLimitReached === true,
      feedbackLimitMessage: typeof state.feedbackLimitMessage === "string" ? state.feedbackLimitMessage : null,
      feedbackUpgradePlan: typeof state.feedbackUpgradePlan === "string" ? state.feedbackUpgradePlan : null,
      feedbackJobs: Array.isArray(state.feedbackJobs) ? state.feedbackJobs : [],
      editPauseTooltipVisible: state.editPauseTooltipVisible === true,
    };
  }

  function syncKeepaliveFromState(state: GlobalUIState): void {
    if (state.session.status !== "idle") {
      keepaliveSessionActive = true;
      ensureKeepalivePort();
    } else {
      disconnectKeepalivePort();
    }
  }

  // ─── Widget loader ──────────────────────────────────────────────
  function loadWidget(): Promise<void> {
    if (widgetLoaded) return Promise.resolve();
    if (widgetLoading) return widgetLoading;

    bootstrapPerfMark("widget import requested (ECHLY_LOAD_WIDGET)");
    widgetLoading = new Promise<void>((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "ECHLY_LOAD_WIDGET" }, (response) => {
        if (chrome.runtime.lastError) {
          widgetLoading = null;
          console.error("[Echly] Failed to load widget:", chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.success) {
          const onWidgetReady = () => {
            widgetLoaded = true;
            widgetLoading = null;
            if (latestGlobalState) {
              try { window.__ECHLY_APPLY_GLOBAL_STATE__?.(latestGlobalState); } catch (e) {
                console.error("[ECHLY] apply state on load failed", e);
              }
              window.dispatchEvent(
                new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: latestGlobalState } })
              );
            }
            for (const ev of pendingEvents) {
              window.dispatchEvent(new CustomEvent(ev.type, { detail: ev.detail }));
            }
            pendingEvents.length = 0;
            fetchAndApplyState();
            resolve();
          };

          // The widget is already mounted if it fired ECHLY_WIDGET_READY
          // before this listener attached (re-injection / fast path).
          if (window.__ECHLY_WIDGET_LOADED__) {
            onWidgetReady();
            return;
          }

          // Otherwise wait for the widget's ready event. The 5s timeout is a
          // safety net so a failed injection rejects instead of hanging.
          let settled = false;
          const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            widgetLoading = null;
            reject(new Error("Widget failed to initialize"));
          }, 5000);
          void widgetReadyPromise.then(() => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            onWidgetReady();
          });
        } else {
          widgetLoading = null;
          reject(new Error(response?.error || "Background failed to inject widget"));
        }
      });
    });
    return widgetLoading;
  }

  function dispatchOrBuffer(type: string, detail?: unknown): void {
    if (widgetLoaded) {
      window.dispatchEvent(new CustomEvent(type, { detail }));
    } else {
      pendingEvents.push({ type, detail });
    }
  }

  // ─── Initial state sync ─────────────────────────────────────────
  function fetchAndApplyState(opts?: { autoLoadIfActive?: boolean }): void {
    chrome.runtime.sendMessage({ type: "ECHLY_GET_GLOBAL_STATE" }, (response: GlobalStateResponse) => {
      if (chrome.runtime.lastError) return;
      const normalized = normalizeGlobalState(response?.state);
      if (!normalized) return;
      latestGlobalState = normalized;
      setHostVisibilityFromState(normalized);
      syncKeepaliveFromState(normalized);
      if (widgetLoaded) {
        try { window.__ECHLY_APPLY_GLOBAL_STATE__?.(normalized); } catch (e) {
          console.error("[ECHLY] apply state failed", e);
        }
        window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: normalized } }));
      } else if (opts?.autoLoadIfActive && getShouldShowTray(normalized)) {
        loadWidget().catch(() => { /* logged in onerror */ });
      }
    });
  }

  // ─── Message listener (registered immediately) ──────────────────
  chrome.runtime.onMessage.addListener((msg: RuntimeMessage) => {
    const type = msg?.type;
    if (!type) return false;

    if (type === SET_CAPTURE_ENABLED_MESSAGE) {
      const enabled = (msg as { enabled?: unknown }).enabled === true;
      // The SW's capture on/off decision for this tab. This is the lazy-install
      // trigger for the four capture bridges (dormant-footprint fix above).
      //
      // ENABLE (true) — capture is arming. Install the bridges NOW, BEFORE applying
      // the value, so the relay's window listener exists to answer the MAIN gate's
      // STATE_REQUEST and the console/network/actions flush listeners are present
      // before any capture data can flow. Then applyCaptureEnabled caches the value
      // (for the STATE_REQUEST answer) and posts it into the MAIN realm — driving
      // the gate ON directly, so a STATE_REQUEST that raced ahead of this message
      // (the MAIN bundle posts it during executeScript, before the SW sends enable)
      // converges regardless. Idempotent on re-arm.
      //
      // DISABLE (false) — must NOT install anything. The SW broadcasts OFF defensively
      // to every tab the user activates while not engaged (background.ts onActivated),
      // including pages that were NEVER engaged and so carry no MAIN wrapper and no
      // bridges. Installing listeners here would re-create the dormant footprint this
      // fix removes. If the bridges ARE already installed (this tab was engaged before
      // — a lingering M3 wrapper may still be live in MAIN), drive the gate OFF so that
      // wrapper goes transparent. If they are NOT installed, there is nothing to gate:
      // no-op, page stays truly untouched.
      if (enabled) {
        installCaptureBridges();
        applyCaptureEnabled(true);
      } else if (captureBridgesInstalled) {
        applyCaptureEnabled(false);
      }
      return false;
    }

    if (type === "ECHLY_OPENING") {
      // Fix 3.2: the SW fired this as the very first thing on an explicit open. Paint the
      // static skeleton synchronously — well before ECHLY_OPEN_WIDGET arrives and the widget
      // bundle downloads. Idempotent and self-removing on first paint / close / timeout.
      paintSkeleton();
      return false;
    }

    if (type === "ECHLY_GLOBAL_STATE" && msg.state) {
      const normalized = normalizeGlobalState(msg.state);
      if (!normalized) return false;
      latestGlobalState = normalized;
      setHostVisibilityFromState(normalized);
      syncKeepaliveFromState(normalized);
      if (widgetLoaded) {
        try { window.__ECHLY_APPLY_GLOBAL_STATE__?.(normalized); } catch (e) {
          console.error("[ECHLY] apply state (msg) failed", e);
        }
        window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: normalized } }));
      } else if (getShouldShowTray(normalized) && !widgetLoading) {
        loadWidget().catch(() => { /* logged in onerror */ });
      }
      return false;
    }

    if (type === "ECHLY_OPEN_WIDGET") {
      // Fix 3.3: fast-path skeleton for opens where ECHLY_OPENING wasn't sent (or was
      // missed). No-op if it's already up or the widget already mounted.
      paintSkeleton();
      setHostVisibility(true);
      loadWidget()
        .then(() => {
          window.dispatchEvent(new CustomEvent("ECHLY_OPEN_WIDGET"));
        })
        .catch(() => { /* error already logged */ });
      return false;
    }

    if (type === "ECHLY_CLOSE_WIDGET") {
      // Fix 3.5: if the user closes before the widget ever painted, tear the skeleton
      // down too so it can't linger on a page with no widget behind it.
      removeSkeleton();
      setHostVisibility(false);
      if (widgetLoaded) {
        window.dispatchEvent(new CustomEvent("ECHLY_CLOSE_WIDGET"));
      }
      return false;
    }

    if (type === "ECHLY_TOGGLE") {
      // Widget owns toggle logic; load it if not present.
      loadWidget()
        .then(() => {
          window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET"));
        })
        .catch(() => { /* noop */ });
      return false;
    }

    if (type === "ECHLY_RESET_WIDGET") {
      dispatchOrBuffer("ECHLY_RESET_WIDGET");
      return false;
    }

    if (type === "ECHLY_SHAKE_PILL") {
      // Forward to widget (or buffer until widget loads — though widget
      // must already be loaded if we're getting this message).
      dispatchOrBuffer("ECHLY_SHAKE_PILL");
      return false;
    }

    if (type === "ECHLY_REFRESH_SESSION") {
      // Dashboard switched workspace — invalidate widget-side caches.
      dispatchOrBuffer("ECHLY_REFRESH_SESSION");
      return false;
    }

    if (type === "ECHLY_START_SESSION") {
      loadWidget()
        .then(() => {
          window.dispatchEvent(new CustomEvent("ECHLY_START_SESSION_REQUEST"));
        })
        .catch(() => { /* noop */ });
      return false;
    }

    if (type === "ECHLY_OPEN_PREVIOUS_SESSIONS") {
      chrome.runtime.sendMessage(
        { type: "GET_AUTH_STATE" },
        (r: { authenticated?: boolean; user?: { uid: string } } | undefined) => {
          if (chrome.runtime.lastError) return;
          if (!r?.authenticated || !r?.user?.uid) return;
          loadWidget()
            .then(() => {
              window.dispatchEvent(new CustomEvent("ECHLY_OPEN_PREVIOUS_SESSIONS"));
            })
            .catch(() => { /* noop */ });
        }
      );
      return false;
    }

    if (type === "ECHLY_RESUME_SESSION" && typeof msg.sessionId === "string" && msg.sessionId.length > 0) {
      const sessionId: string = msg.sessionId;
      chrome.runtime.sendMessage(
        { type: "GET_AUTH_STATE" },
        (r: { authenticated?: boolean; user?: { uid: string } } | undefined) => {
          if (chrome.runtime.lastError) return;
          if (!r?.authenticated || !r?.user?.uid) return;
          loadWidget()
            .then(() => {
              window.dispatchEvent(
                new CustomEvent("ECHLY_RESUME_SESSION", { detail: { sessionId } })
              );
            })
            .catch(() => { /* noop */ });
        }
      );
      return false;
    }

    if (type === "ECHLY_FEEDBACK_CREATED" && msg.ticket && msg.sessionId) {
      if (widgetLoaded) {
        window.dispatchEvent(
          new CustomEvent("ECHLY_FEEDBACK_CREATED", {
            detail: { ticket: msg.ticket, sessionId: msg.sessionId },
          })
        );
      }
      // If widget not loaded, the next ECHLY_GLOBAL_STATE will reflect this — safe to drop.
      return false;
    }

    if (type === "ECHLY_SESSION_STATE_SYNC") {
      fetchAndApplyState();
      return false;
    }

    return false;
  });

  // ─── Visibility change resync ───────────────────────────────────
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    fetchAndApplyState();
  });

  // ─── Initial load: auto-load widget if session active ───────────
  fetchAndApplyState({ autoLoadIfActive: true });
}
