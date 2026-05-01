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
  });
})();
