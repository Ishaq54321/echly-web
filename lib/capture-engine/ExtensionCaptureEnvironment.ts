/**
 * Capture environment adapter for the Chrome extension.
 * Implements CaptureEnvironment by delegating to existing content-script helpers
 * and extension messaging (chrome.runtime.sendMessage). No behavior change;
 * this is a thin forwarding layer.
 */
import type { CaptureEnvironment } from "./CaptureEnvironment";

function logSendMessageFailure(context: string, err: unknown): void {
  console.error(`[ECHLY] ${context}`, err);
}

/** Dependencies provided by the extension content script (existing helpers). */
export type ExtensionCaptureEnvironmentDeps = {
  createSession: () => Promise<
    { id: string } | { limitReached: true; message: string; upgradePlan: unknown } | null
  >;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  notifyFeedbackCreated: (ticket: {
    id: string;
    title: string;
    actionSteps?: string[];
    type?: string;
  }) => void;
};

export class ExtensionCaptureEnvironment implements CaptureEnvironment {
  private deps: ExtensionCaptureEnvironmentDeps;

  constructor(deps: ExtensionCaptureEnvironmentDeps) {
    this.deps = deps;
  }

  createSession(): Promise<
    { id: string } | { limitReached: true; message: string; upgradePlan: unknown } | null
  > {
    return this.deps.createSession();
  }

  authenticatedFetch(url: string, options?: RequestInit): Promise<Response> {
    return this.deps.authenticatedFetch(url, options);
  }

  notifyFeedbackCreated(ticket: {
    id: string;
    title: string;
    actionSteps?: string[];
    type?: string;
  }): void {
    this.deps.notifyFeedbackCreated(ticket);
  }

  setActiveSession(sessionId: string): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId }, () => {
        const err = chrome.runtime.lastError;
        if (err) {
          console.error("[ECHLY] ECHLY_SET_ACTIVE_SESSION", err.message ?? String(err));
        }
      });
    }
  }

  startSessionMode(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime
        .sendMessage({ type: "ECHLY_SESSION_MODE_START" })
        .catch((err) => logSendMessageFailure("ECHLY_SESSION_MODE_START", err));
    }
  }

  pauseSessionMode(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime
        .sendMessage({ type: "ECHLY_SESSION_MODE_PAUSE" })
        .catch((err) => logSendMessageFailure("ECHLY_SESSION_MODE_PAUSE", err));
    }
  }

  resumeSessionMode(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime
        .sendMessage({ type: "ECHLY_SESSION_MODE_RESUME" })
        .catch((err) => logSendMessageFailure("ECHLY_SESSION_MODE_RESUME", err));
    }
  }

  endSessionMode(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime
        .sendMessage({ type: "ECHLY_SESSION_MODE_END" })
        .catch((err) => logSendMessageFailure("ECHLY_SESSION_MODE_END", err));
    }
  }

  reportActivity(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime
        .sendMessage({ type: "ECHLY_SESSION_ACTIVITY" })
        .catch((err) => logSendMessageFailure("ECHLY_SESSION_ACTIVITY", err));
    }
  }

  expandWidget(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime
        .sendMessage({ type: "ECHLY_EXPAND_WIDGET" })
        .catch((err) => logSendMessageFailure("ECHLY_EXPAND_WIDGET", err));
    }
  }

  collapseWidget(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime
        .sendMessage({ type: "ECHLY_COLLAPSE_WIDGET" })
        .catch((err) => logSendMessageFailure("ECHLY_COLLAPSE_WIDGET", err));
    }
  }

  openLogin(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime
        .sendMessage({ type: "ECHLY_TRIGGER_LOGIN" })
        .catch((err) => logSendMessageFailure("ECHLY_TRIGGER_LOGIN", err));
    }
  }

  openDashboard(url: string): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime
        .sendMessage({ type: "ECHLY_OPEN_TAB", url })
        .catch((err) => logSendMessageFailure("ECHLY_OPEN_TAB", err));
    }
  }

  captureTabScreenshot(): Promise<string | null> {
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: "CAPTURE_TAB" },
        (response: { success?: boolean; screenshot?: string } | undefined) => {
          if (!response || !response.success) {
            resolve(null);
          } else {
            resolve(response.screenshot ?? null);
          }
        }
      );
    });
  }
}
