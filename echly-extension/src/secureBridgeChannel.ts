/**
 * Secure channel negotiation between extension content script and page token bridge.
 * Uses a random channel id (ECHLY_SECURE_CHANNEL_<random>) and handshake so the bridge
 * only responds on that channel. Removes static channel usage.
 */

export const ECHLY_BRIDGE_HANDSHAKE_TYPE = "ECHLY_BRIDGE_HANDSHAKE";
export const ECHLY_BRIDGE_READY_TYPE = "ECHLY_BRIDGE_READY";
/** Well-known channel for handshake only; token traffic uses the negotiated channel. */
export const ECHLY_HANDSHAKE_CHANNEL = "ECHLY_BRIDGE_HANDSHAKE_CHANNEL";

export const ECHLY_REQUEST_TOKEN_TYPE = "ECHLY_REQUEST_TOKEN";
export const ECHLY_TOKEN_RESPONSE_TYPE = "ECHLY_TOKEN_RESPONSE";

export const ECHLY_EXTENSION_SOURCE = "ECHLY_EXTENSION";

const DEFAULT_HANDSHAKE_TIMEOUT_MS = 3000;

/**
 * Generate a random channel id for this page load.
 * Example: ECHLY_SECURE_CHANNEL_f83f1a6c
 */
export function generateChannelId(): string {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `ECHLY_SECURE_CHANNEL_${suffix}`;
}

let cachedChannel: string | null = null;

/**
 * Perform handshake with the page bridge. Content script sends ECHLY_BRIDGE_HANDSHAKE
 * with proposedChannel; bridge replies ECHLY_BRIDGE_READY with that channel.
 * Returns the channel id to use for token requests. Caches result for the page lifetime.
 */
export function performHandshake(timeoutMs: number = DEFAULT_HANDSHAKE_TIMEOUT_MS): Promise<string> {
  if (cachedChannel) return Promise.resolve(cachedChannel);

  const proposedChannel = generateChannelId();
  const targetOrigin = window.location.origin;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("ECHLY_BRIDGE_HANDSHAKE_TIMEOUT"));
    }, timeoutMs);

    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== ECHLY_BRIDGE_READY_TYPE) return;
      if (data.channel !== proposedChannel) return;

      window.removeEventListener("message", handler);
      clearTimeout(timer);
      cachedChannel = proposedChannel;
      resolve(proposedChannel);
    };

    window.addEventListener("message", handler);
    window.postMessage(
      {
        channel: ECHLY_HANDSHAKE_CHANNEL,
        type: ECHLY_BRIDGE_HANDSHAKE_TYPE,
        proposedChannel,
        source: ECHLY_EXTENSION_SOURCE,
      },
      targetOrigin
    );
  });
}

/** Reset cached channel (e.g. for tests or page navigation). */
export function resetChannel(): void {
  cachedChannel = null;
}
