(function initSessionRelay() {
  if ((window as any).__ECHLY_RELAY_INITIALIZED__) return;
  (window as any).__ECHLY_RELAY_INITIALIZED__ = true;

  window.addEventListener("message", (event) => {
    if (event.data?.type === "ECHLY_EXTENSION_PING") {
      console.log("[ECHLY][CONTENT] Received PING");
      window.postMessage({ type: "ECHLY_EXTENSION_PONG" }, "*");
    }

    if (event.data?.type === "ECHLY_OPEN_RECORDER") {
      console.log("[ECHLY][CONTENT] Received OPEN_RECORDER from dashboard");
      chrome.runtime.sendMessage({ type: "OPEN_RECORDER" }, (response) => {
        console.log("[ECHLY][CONTENT] Sent OPEN_RECORDER to background, response:", response);
      });

      window.postMessage({ type: "ECHLY_RECORDER_OPENED" }, "*");
    }
  });
})();
