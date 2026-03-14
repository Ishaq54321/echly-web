/**
 * Content script helper: request Firebase ID token from the page via postMessage.
 * Uses secure channel handshake then ECHLY_REQUEST_TOKEN with channel, nonce, source.
 * The page must run pageTokenBridge.js (dashboard only). Returns { token } or { token: null }.
 */

import {
  performHandshake,
  ECHLY_REQUEST_TOKEN_TYPE,
  ECHLY_TOKEN_RESPONSE_TYPE,
  ECHLY_EXTENSION_SOURCE,
} from "./secureBridgeChannel";

const DEFAULT_TIMEOUT_MS = 5000;
const HANDSHAKE_TIMEOUT_MS = 3000;

export type RequestPageTokenResult = { token: string | null };

/**
 * Request a fresh Firebase ID token from the page. The page must be the dashboard.
 * Uses nonce-based secure channel; returns { token: null } on timeout or if not signed in.
 */
export function requestTokenFromPage(timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<RequestPageTokenResult> {
  return (async () => {
    let channel: string;
    try {
      channel = await performHandshake(HANDSHAKE_TIMEOUT_MS);
    } catch {
      return { token: null };
    }

    const nonce = crypto.randomUUID();
    const targetOrigin = window.location.origin;

    return new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        const data = event.data;
        if (!data) return;
        if (data.channel !== channel) return;
        if (data.type !== ECHLY_TOKEN_RESPONSE_TYPE) return;
        if (data.nonce !== nonce) return;

        window.removeEventListener("message", handler);
        clearTimeout(timer);
        const token = typeof data.token === "string" ? data.token : null;
        resolve({ token });
      };

      window.addEventListener("message", handler);
      const timer = setTimeout(() => {
        window.removeEventListener("message", handler);
        resolve({ token: null });
      }, timeoutMs);

      window.postMessage(
        {
          channel,
          type: ECHLY_REQUEST_TOKEN_TYPE,
          nonce,
          source: ECHLY_EXTENSION_SOURCE,
        },
        targetOrigin
      );
    });
  })();
}
