import { logger } from "@/lib/logger";

(function initSessionRelay() {
  if ((window as any).__ECHLY_RELAY_INITIALIZED__) return;
  (window as any).__ECHLY_RELAY_INITIALIZED__ = true;

  window.addEventListener("message", (event) => {
    if (event.data?.type === "ECHLY_EXTENSION_PING") {
      logger.debug("extension", "ping_received");
      window.postMessage({ type: "ECHLY_EXTENSION_PONG" }, "*");
    }

    if (event.data?.type === "ECHLY_OPEN_RECORDER") {
      logger.debug("extension", "open_recorder_requested");
      chrome.runtime.sendMessage({ type: "OPEN_RECORDER" }, (response) => {
        logger.debug("extension", "open_recorder_dispatched", response);
      });

      window.postMessage({ type: "ECHLY_RECORDER_OPENED" }, "*");
    }

    if (
      event.data?.type === "ECHLY_RESUME_SESSION" &&
      typeof event.data?.sessionId === "string" &&
      event.data.sessionId.length > 0
    ) {
      logger.debug("extension", "resume_session_requested", {
        sessionId: event.data.sessionId,
      });
      chrome.runtime.sendMessage(
        { type: "RESUME_SESSION", sessionId: event.data.sessionId },
        (response) => {
          logger.debug("extension", "resume_session_dispatched", response);
        }
      );
      window.postMessage({ type: "ECHLY_SESSION_RESUMED" }, "*");
    }

    // Dashboard signals a workspace switch — propagate to the background
    // worker so it can invalidate its cached extension token and refetch
    // the active workspace from the server.
    if (event.data?.type === "ANNOTE_WORKSPACE_SWITCH") {
      logger.debug("extension", "workspace_switch_signal", {
        workspaceId: event.data?.workspaceId ?? null,
      });
      chrome.runtime.sendMessage(
        {
          type: "WORKSPACE_SWITCHED",
          workspaceId:
            typeof event.data?.workspaceId === "string"
              ? event.data.workspaceId
              : null,
          uid: typeof event.data?.uid === "string" ? event.data.uid : null,
        },
        () => {
          /* ignore response */
        }
      );
    }
  });
})();
