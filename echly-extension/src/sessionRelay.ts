/**
 * Session relay: runs as a content script on the dashboard extension-auth page only.
 * Listens for token messages from the page (postMessage) and forwards to the background
 * so the extension can receive the short-lived token without ever handling login credentials.
 */
window.addEventListener("message", (event: MessageEvent) => {
  if (event.data?.type === "ECHLY_EXTENSION_TOKEN" && typeof event.data.token === "string") {
    chrome.runtime.sendMessage({
      type: "ECHLY_EXTENSION_TOKEN",
      token: event.data.token,
      user: event.data.user,
    }).catch(() => {});
  }
});
