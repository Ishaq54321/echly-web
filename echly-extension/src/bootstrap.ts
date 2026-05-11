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
};

type GlobalStateResponse = { state?: GlobalUIState } | undefined;

const SHADOW_HOST_ID = "echly-shadow-host";

if (window.__ECHLY_BOOTSTRAP_LOADED__) {
  // Already loaded (rare — content_scripts shouldn't double-fire, but be defensive).
} else {
  window.__ECHLY_BOOTSTRAP_LOADED__ = true;

  let widgetLoaded = false;
  let widgetLoading: Promise<void> | null = null;
  let latestGlobalState: GlobalUIState | null = null;
  const pendingEvents: Array<{ type: string; detail?: unknown }> = [];

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

    widgetLoading = new Promise<void>((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "ECHLY_LOAD_WIDGET" }, (response) => {
        if (chrome.runtime.lastError) {
          widgetLoading = null;
          console.error("[Echly] Failed to load widget:", chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.success) {
          const checkReady = (attempts: number) => {
            if (window.__ECHLY_WIDGET_LOADED__) {
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
              setTimeout(() => fetchAndApplyState(), 50);
              resolve();
            } else if (attempts < 50) {
              setTimeout(() => checkReady(attempts + 1), 50);
            } else {
              widgetLoading = null;
              reject(new Error("Widget failed to initialize"));
            }
          };
          checkReady(0);
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
      setHostVisibility(true);
      loadWidget()
        .then(() => {
          window.dispatchEvent(new CustomEvent("ECHLY_OPEN_WIDGET"));
        })
        .catch(() => { /* error already logged */ });
      return false;
    }

    if (type === "ECHLY_CLOSE_WIDGET") {
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
