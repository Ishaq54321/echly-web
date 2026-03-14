/**
 * Content script helper: request Firebase ID token from the page via postMessage.
 * Uses secure channel handshake (ECHLY_BRIDGE_HANDSHAKE → ECHLY_BRIDGE_READY) then
 * ECHLY_REQUEST_TOKEN with channel, nonce, source. Bridge responds with ECHLY_TOKEN_RESPONSE
 * to event.origin only. Only works on dashboard pages where the bridge is injected.
 */

import {
  performHandshake,
  ECHLY_REQUEST_TOKEN_TYPE,
  ECHLY_TOKEN_RESPONSE_TYPE,
  ECHLY_EXTENSION_SOURCE,
} from "./secureBridgeChannel";

const HANDSHAKE_TIMEOUT_MS = 1500;
const TOKEN_REQUEST_TIMEOUT_MS = 2000;

export async function requestTokenFromPage(): Promise<string | null> {
  let channel: string;
  try {
    channel = await performHandshake(HANDSHAKE_TIMEOUT_MS);
  } catch {
    return null;
  }

  const nonce = crypto.randomUUID();
  const targetOrigin = window.location.origin;

  return new Promise((resolve) => {
    const listener = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;
      if (data.channel !== channel) return;
      if (data.type !== ECHLY_TOKEN_RESPONSE_TYPE) return;
      if (data.nonce !== nonce) return;

      window.removeEventListener("message", listener);
      clearTimeout(timer);
      resolve(typeof data.token === "string" ? data.token : null);
    };

    window.addEventListener("message", listener);
    const timer = setTimeout(() => {
      window.removeEventListener("message", listener);
      resolve(null);
    }, TOKEN_REQUEST_TIMEOUT_MS);

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
}
