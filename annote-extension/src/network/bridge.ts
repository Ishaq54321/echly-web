/**
 * Isolated-world bridge to the MAIN-world network buffer.
 *
 * Mirrors `../console/bridge.ts` — same postMessage protocol with an
 * `ECHLY_NETWORK_*` prefix so the two streams cannot collide. The MAIN script
 * holds the ring buffer; we exchange data through `window.postMessage` only.
 *
 * Two paths:
 *   1. requestNetworkSnapshot() — request/response with a unique requestId.
 *      Used at click time. On timeout we fall back to the cached flush
 *      snapshot if we have one, else null. We never reject — network capture
 *      MUST NOT block ticket creation.
 *   2. installNetworkBridgeListener() — passive listener for
 *      ECHLY_NETWORK_FLUSH_PUSH events that the MAIN script fires on
 *      visibilitychange/beforeunload. The most recent push is cached so
 *      requestNetworkSnapshot has something to fall back to during a hard
 *      navigation that tears down the MAIN script before the next request.
 *
 * Phase R8 — wiring + parity: this listener was dead code (defined, never
 * called; the architecture audit flagged it). It is now installed from
 * bootstrap.ts alongside the console and actions listeners. It previously
 * forwarded ECHLY_NETWORK_FLUSH to the service worker, but no SW handler for
 * that message exists (and console/actions never forwarded — they cache in
 * the isolated world). We deliberately bring network to PARITY with its two
 * siblings: cache the latest flush snapshot locally and use it as the
 * requestNetworkSnapshot timeout fallback. SW-side aggregation of flushes is
 * a separate future phase; routing to a non-existent handler was a no-op.
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

let cachedFlushSnapshot: NetworkSnapshot | null = null;
let listenerInstalled = false;

/**
 * Listen for ECHLY_NETWORK_FLUSH_PUSH messages (fired by the MAIN script on
 * visibilitychange / beforeunload) and cache the most recent snapshot in the
 * isolated world, so requestNetworkSnapshot() can fall back to it when its
 * own request times out (e.g. the MAIN script was torn down by a hard
 * navigation but flushed before unload). Mirrors console/bridge.ts
 * installBridgeListener and actions/bridge.ts installActionsBridgeListener.
 */
export function installNetworkBridgeListener(): void {
  if (listenerInstalled) return;
  if (typeof window === "undefined") return;
  listenerInstalled = true;
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.origin !== "" && event.origin !== window.origin) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    const typed = data as { type?: unknown };
    if (typeof typed.type !== "string" || !typed.type.startsWith("ECHLY_")) return;
    const msg = data as NetworkFlushPush;
    if (
      msg.source === NETWORK_BRIDGE_SOURCE_MAIN &&
      msg.type === NETWORK_FLUSH_PUSH &&
      msg.snapshot &&
      Array.isArray(msg.snapshot.requests)
    ) {
      cachedFlushSnapshot = msg.snapshot;
      // Stage 3: forward this page's flush to the service worker so it accumulates
      // into the cross-navigation engagement buffer. Best-effort; swallow errors
      // (SW asleep / channel closed). The local cache above remains the click-time
      // fallback. Supersedes the old (removed) dead-code SW forward this bridge once
      // had — that targeted a non-existent handler; ECHLY_CAPTURE_FLUSH is now real.
      try {
        chrome.runtime
          .sendMessage({
            type: "ECHLY_CAPTURE_FLUSH",
            surface: "network",
            snapshot: msg.snapshot,
          })
          .catch(() => {});
      } catch {
        // chrome.runtime unavailable (page teardown) — ignore.
      }
    }
  });

  /* Stage 3 safety-net: respond to the SW's ECHLY_REQUEST_CAPTURE_FLUSH poke by
     pulling a live snapshot and forwarding it, so a tab killed without an unload
     event still contributes. Best-effort; the SW dedupes by request id. */
  try {
    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((req) => {
        if (req?.type === "ECHLY_REQUEST_CAPTURE_FLUSH") {
          void requestNetworkSnapshot(400).then((snapshot) => {
            if (!snapshot) return;
            try {
              chrome.runtime
                .sendMessage({ type: "ECHLY_CAPTURE_FLUSH", surface: "network", snapshot })
                .catch(() => {});
            } catch {
              // ignore
            }
          });
        }
        return false;
      });
    }
  } catch {
    // chrome.runtime unavailable — ignore.
  }
}

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
      if (event.origin !== "" && event.origin !== window.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const typed = data as { type?: unknown };
      if (typeof typed.type !== "string" || !typed.type.startsWith("ECHLY_")) return;
      const msg = data as NetworkSnapshotResponse;
      if (
        msg.source === NETWORK_BRIDGE_SOURCE_MAIN &&
        msg.type === NETWORK_SNAPSHOT_RESPONSE &&
        msg.requestId === requestId &&
        msg.snapshot &&
        Array.isArray(msg.snapshot.requests)
      ) {
        if (settled) return;
        settled = true;
        window.removeEventListener("message", onMessage);
        // Also cache as the latest known snapshot in case the next request
        // hits a navigated-away page (parity with console/actions bridges).
        cachedFlushSnapshot = msg.snapshot;
        resolve(msg.snapshot);
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
      // Fall back to the cached flush snapshot if we have one (MAIN script
      // torn down by hard navigation but flushed before unload). null when
      // we've never seen a flush — the actions surface treats absence as "no
      // data" the same way.
      resolve(cachedFlushSnapshot);
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
      // path resolves with the cached (or null) snapshot.
    }
  });
}
