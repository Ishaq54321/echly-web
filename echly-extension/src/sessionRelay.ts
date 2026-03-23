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
  });
})();
