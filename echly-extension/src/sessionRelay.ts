/**
 * Runs only on app origin (dashboard). Fetches extension token with cookie and sends to background.
 * This allows the background to have a token after the user signs in on the dashboard.
 */
import { API_BASE } from "../config";

(function () {
  fetch(`${API_BASE}/api/extension/session`, { method: "POST", credentials: "include" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Session failed"))))
    .then((data: { extensionToken?: string; user?: { uid?: string; email?: string | null } }) => {
      if (data.extensionToken) {
        chrome.runtime.sendMessage({
          type: "ECHLY_SET_EXTENSION_TOKEN",
          extensionToken: data.extensionToken,
          user: data.user,
        }).catch(() => {});
      }
    })
    .catch(() => {});
})();
