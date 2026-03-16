/**
 * Capture environment adapter for the Chrome extension.
 * Implements CaptureEnvironment by delegating to existing content-script helpers
 * and extension messaging (chrome.runtime.sendMessage). No behavior change;
 * this is a thin forwarding layer.
 */
import type { CaptureEnvironment } from "./CaptureEnvironment";

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
      chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId }, () => {});
    }
  }

  startSessionMode(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch(() => {});
    }
  }

  pauseSessionMode(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_PAUSE" }).catch(() => {});
    }
  }

  resumeSessionMode(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_RESUME" }).catch(() => {});
    }
  }

  endSessionMode(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_END" }).catch(() => {});
    }
  }

  reportActivity(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_ACTIVITY" }).catch(() => {});
    }
  }

  expandWidget(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_EXPAND_WIDGET" }).catch(() => {});
    }
  }

  collapseWidget(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_COLLAPSE_WIDGET" }).catch(() => {});
    }
  }

  openLogin(): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_TRIGGER_LOGIN" }).catch(() => {});
    }
  }

  openDashboard(url: string): void {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_OPEN_TAB", url }).catch(() => {});
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
