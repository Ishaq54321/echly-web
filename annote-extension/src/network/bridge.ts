/**
 * Isolated-world bridge to the MAIN-world network buffer.
 *
 * Mirrors `../console/bridge.ts` — same postMessage protocol with an
 * `ECHLY_NETWORK_*` prefix so the two streams cannot collide. The MAIN script
 * holds the ring buffer; we exchange data through `window.postMessage` only.
 *
 * Two paths:
 *   1. requestNetworkSnapshot() — request/response with a unique requestId.
 *      Used at click time. Resolves to null on timeout (never throws) so log
 *      capture cannot block ticket creation.
 *   2. installNetworkBridgeListener() — passive listener for
 *      ECHLY_NETWORK_FLUSH_PUSH events; forwards them to the service worker so
 *      a buffer flush on visibilitychange/beforeunload isn't lost when the
 *      page tears down before a ticket is filed.
 */

import type {
  NetworkSnapshot,
  NetworkSnapshotResponse,
  NetworkFlushPush,
} from "./types";
import {
  NETWORK_BRIDGE_SOURCE_ISOLATED,
  NETWORK_BRIDGE_SOURCE_MAIN,
  NETWORK_FLUSH_PUSH,
  NETWORK_SNAPSHOT_REQUEST,
  NETWORK_SNAPSHOT_RESPONSE,
} from "./types";

function genRequestId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return "req-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function requestNetworkSnapshot(
  timeoutMs = 500,
): Promise<NetworkSnapshot | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }
  const requestId = genRequestId();
  return new Promise<NetworkSnapshot | null>((resolve) => {
    let settled = false;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data as NetworkSnapshotResponse | undefined;
      if (!data || typeof data !== "object") return;
      if (
        data.source === NETWORK_BRIDGE_SOURCE_MAIN &&
        data.type === NETWORK_SNAPSHOT_RESPONSE &&
        data.requestId === requestId &&
        data.snapshot &&
        Array.isArray(data.snapshot.requests)
      ) {
        if (settled) return;
        settled = true;
        window.removeEventListener("message", onMessage);
        resolve(data.snapshot);
      }
    };
    window.addEventListener("message", onMessage);
    setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        window.removeEventListener("message", onMessage);
      } catch {
        // ignore
      }
      resolve(null);
    }, timeoutMs);

    try {
      window.postMessage(
        {
          source: NETWORK_BRIDGE_SOURCE_ISOLATED,
          type: NETWORK_SNAPSHOT_REQUEST,
          requestId,
        },
        "*",
      );
    } catch {
      // postMessage shouldn't throw in practice; if it does, the timeout
      // path resolves null.
    }
  });
}

/**
 * Listen for ECHLY_NETWORK_FLUSH_PUSH messages (fired by the MAIN script on
 * visibilitychange / beforeunload) and forward them to the service worker.
 * Fire-and-forget — the service worker handler is a stub for now; persistence
 * is wired in a later polish phase.
 */
export function installNetworkBridgeListener(): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const onMessage = (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data as NetworkFlushPush | undefined;
    if (!data || typeof data !== "object") return;
    if (
      data.source !== NETWORK_BRIDGE_SOURCE_MAIN ||
      data.type !== NETWORK_FLUSH_PUSH ||
      !data.snapshot ||
      !Array.isArray(data.snapshot.requests)
    ) {
      return;
    }
    try {
      chrome.runtime
        .sendMessage({ type: "ECHLY_NETWORK_FLUSH", snapshot: data.snapshot })
        .catch(() => {
          // SW may be inactive or the message handler is the no-op stub;
          // either way, dropping is acceptable for the flush path.
        });
    } catch {
      // chrome.runtime missing (e.g. orphaned content script post-update).
    }
  };
  window.addEventListener("message", onMessage);
  return () => {
    try {
      window.removeEventListener("message", onMessage);
    } catch {
      // ignore
    }
  };
}
