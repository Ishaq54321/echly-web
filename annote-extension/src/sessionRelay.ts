import { logger } from "@/lib/logger";

(function initSessionRelay() {
  if ((window as any).__ECHLY_RELAY_INITIALIZED__) return;
  (window as any).__ECHLY_RELAY_INITIALIZED__ = true;

  // Origin gate for privileged messages. ECHLY_EXTENSION_PING legitimately
  // arrives from any origin (it's the "is Annote installed" probe) and so
  // bypasses the check. Every other action — opening the recorder UI,
  // resuming a session, switching workspace — must originate from same-origin
  // page code so a foreign frame cannot forge them.
  function isSameOriginPost(event: MessageEvent): boolean {
    if (event.source !== window) return false;
    if (event.origin === "" || event.origin === window.origin) return true;
    return false;
  }

  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;
    const type = (data as { type?: unknown }).type;
    if (typeof type !== "string") return;

    if (type === "ECHLY_EXTENSION_PING") {
      // Cross-origin allowed: this is an installation probe.
      logger.debug("extension", "ping_received");
      window.postMessage({ type: "ECHLY_EXTENSION_PONG" }, "*");
      return;
    }

    // All remaining actions are privileged; require same-origin.
    if (!isSameOriginPost(event)) return;

    if (type === "ECHLY_OPEN_RECORDER") {
      logger.debug("extension", "open_recorder_requested");
      chrome.runtime.sendMessage({ type: "OPEN_RECORDER" }, (response) => {
        logger.debug("extension", "open_recorder_dispatched", response);
      });

      window.postMessage({ type: "ECHLY_RECORDER_OPENED" }, "*");
      return;
    }

    if (
      type === "ECHLY_RESUME_SESSION" &&
      typeof (data as { sessionId?: unknown }).sessionId === "string" &&
      ((data as { sessionId: string }).sessionId).length > 0
    ) {
      const sessionId = (data as { sessionId: string }).sessionId;
      logger.debug("extension", "resume_session_requested", { sessionId });
      chrome.runtime.sendMessage(
        { type: "RESUME_SESSION", sessionId },
        (response) => {
          logger.debug("extension", "resume_session_dispatched", response);
        }
      );
      window.postMessage({ type: "ECHLY_SESSION_RESUMED" }, "*");
      return;
    }

    // Dashboard signals a workspace switch — propagate to the background
    // worker so it can invalidate its cached extension token and refetch
    // the active workspace from the server.
    if (type === "ANNOTE_WORKSPACE_SWITCH") {
      logger.debug("extension", "workspace_switch_signal", {
        workspaceId: (data as { workspaceId?: unknown }).workspaceId ?? null,
      });
      chrome.runtime.sendMessage(
        {
          type: "WORKSPACE_SWITCHED",
          workspaceId:
            typeof (data as { workspaceId?: unknown }).workspaceId === "string"
              ? (data as { workspaceId: string }).workspaceId
              : null,
          uid:
            typeof (data as { uid?: unknown }).uid === "string"
              ? (data as { uid: string }).uid
              : null,
        },
        () => {
          /* ignore response */
        }
      );
    }
  });
})();
