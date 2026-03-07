/**
 * Content script global UI state: visibility, expanded, session, session mode.
 * ECHLY_GLOBAL_STATE handling and widget visibility. Source of truth is background.
 */
import { echlyLog } from "@/lib/debug/echlyLogger";

export type GlobalUIState = {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionId: string | null;
  sessionModeActive: boolean;
  sessionPaused: boolean;
};

export type GlobalStateResponse = { state?: GlobalUIState } | undefined;

export function createContentState(config: { shadowHostId: string }): {
  getInitialState: () => GlobalUIState;
  setHostVisibility: (visible: boolean) => void;
  subscribeGlobalState: (setGlobalState: (state: GlobalUIState) => void) => () => void;
  normalizeGlobalState: (state: GlobalUIState | undefined) => GlobalUIState | null;
  dispatchGlobalState: (state: GlobalUIState) => void;
  syncInitialGlobalState: (host: HTMLDivElement) => void;
  ensureVisibilityStateRefresh: () => void;
} {
  const { shadowHostId } = config;

  function setHostVisibility(visible: boolean): void {
    const host = document.getElementById(shadowHostId);
    if (host) {
      (host as HTMLDivElement).style.display = visible ? "block" : "none";
    }
  }

  function getInitialState(): GlobalUIState {
    return {
      visible: false,
      expanded: false,
      isRecording: false,
      sessionId: null,
      sessionModeActive: false,
      sessionPaused: false,
    };
  }

  function subscribeGlobalState(setGlobalState: (state: GlobalUIState) => void): () => void {
    const handler = (e: CustomEvent<{ state: GlobalUIState }>) => {
      const s = e.detail?.state;
      if (s) {
        echlyLog("CONTENT", "global state received", s);
        setHostVisibility(s.visible);
        setGlobalState(s);
      }
    };
    window.addEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
    return () => window.removeEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
  }

  function normalizeGlobalState(state: GlobalUIState | undefined): GlobalUIState | null {
    if (!state) return null;
    return {
      visible: state.visible ?? false,
      expanded: state.expanded ?? false,
      isRecording: state.isRecording ?? false,
      sessionId: state.sessionId ?? null,
      sessionModeActive: state.sessionModeActive ?? false,
      sessionPaused: state.sessionPaused ?? false,
    };
  }

  function dispatchGlobalState(state: GlobalUIState): void {
    echlyLog("CONTENT", "dispatch event", { type: "ECHLY_GLOBAL_STATE" });
    window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state } }));
  }

  function syncInitialGlobalState(host: HTMLDivElement): void {
    chrome.runtime.sendMessage(
      { type: "ECHLY_GET_GLOBAL_STATE" },
      (response: GlobalStateResponse) => {
        const normalized = normalizeGlobalState(response?.state);
        if (!normalized) return;
        host.style.display = normalized.visible ? "block" : "none";
        dispatchGlobalState(normalized);
      }
    );
  }

  function ensureVisibilityStateRefresh(): void {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      chrome.runtime.sendMessage(
        { type: "ECHLY_GET_GLOBAL_STATE" },
        (response: GlobalStateResponse) => {
          const normalized = normalizeGlobalState(response?.state);
          if (!normalized) return;
          setHostVisibility(normalized.visible);
          dispatchGlobalState(normalized);
        }
      );
    });
  }

  return {
    getInitialState,
    setHostVisibility,
    subscribeGlobalState,
    normalizeGlobalState,
    dispatchGlobalState,
    syncInitialGlobalState,
    ensureVisibilityStateRefresh,
  };
}
