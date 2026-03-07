/**
 * Event bridge: translates extension messages into DOM CustomEvents.
 * ECHLY_GLOBAL_STATE, ECHLY_FEEDBACK_CREATED, ECHLY_TOGGLE_WIDGET.
 */
import { echlyLog } from "@/lib/debug/echlyLogger";
import type { GlobalUIState } from "./contentState";

type MessagePayload = {
  type?: string;
  state?: GlobalUIState;
  ticket?: { id: string; title: string; description: string; type?: string };
  sessionId?: string;
};

/**
 * Listen for extension messages and dispatch DOM events. Single global listener.
 * Pass the host element so visibility can be updated without getElementById.
 */
export function setupContentEventBridge(host: HTMLDivElement): void {
  const win = window as Window & { __ECHLY_MESSAGE_LISTENER__?: boolean };
  if (win.__ECHLY_MESSAGE_LISTENER__) return;
  win.__ECHLY_MESSAGE_LISTENER__ = true;
  chrome.runtime.onMessage.addListener((msg: MessagePayload) => {
    if (msg.type === "ECHLY_FEEDBACK_CREATED" && msg.ticket && msg.sessionId) {
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_FEEDBACK_CREATED" });
      window.dispatchEvent(
        new CustomEvent("ECHLY_FEEDBACK_CREATED", { detail: { ticket: msg.ticket, sessionId: msg.sessionId } })
      );
      return;
    }
    if (msg.type === "ECHLY_GLOBAL_STATE" && msg.state) {
      echlyLog("CONTENT", "global state received", msg.state);
      host.style.display = msg.state.visible ? "block" : "none";
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_GLOBAL_STATE" });
      window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: msg.state } }));
    }
    if (msg.type === "ECHLY_TOGGLE") {
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_TOGGLE_WIDGET" });
      window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET"));
    }
  });
}
