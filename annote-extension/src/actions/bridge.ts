/**
 * Isolated-world bridge to the MAIN-world user-actions buffer.
 *
 * Mirrors `../console/bridge.ts` and `../network/bridge.ts` — same
 * postMessage protocol with an `ECHLY_ACTIONS_*` prefix so the three
 * streams cannot collide. The MAIN script holds the ring buffer; we
 * exchange data through `window.postMessage` only — that's the one
 * channel both worlds share.
 *
 * Two paths:
 *   1. requestActionsSnapshot() — request/response with a unique requestId.
 *      Used at click time. Resolves to null on timeout (never throws) so
 *      ticket creation cannot be blocked by actions capture. On timeout we
 *      fall back to the cached flush snapshot if we have one (mirrors the
 *      console bridge's EMPTY fallback shape, but null because the actions
 *      surface treats absence as "no data available" rather than "empty").
 *   2. installActionsBridgeListener() — passive listener for
 *      ECHLY_ACTIONS_FLUSH_PUSH events fired by the MAIN script on
 *      visibilitychange/beforeunload. The most recent push is cached so
 *      requestActionsSnapshot has something to fall back to during a hard
 *      navigation. Wired into bootstrap.ts (not dead code — see the
 *      architecture audit note about network's listener being unwired).
 */

import type {
  ActionsSnapshot,
  ActionsSnapshotResponse,
  ActionsFlushPush,
} from "./types";
import {
  ACTIONS_BRIDGE_SOURCE_ISOLATED,
  ACTIONS_BRIDGE_SOURCE_MAIN,
  ACTIONS_FLUSH_PUSH,
  ACTIONS_SNAPSHOT_REQUEST,
  ACTIONS_SNAPSHOT_RESPONSE,
} from "./types";

let cachedActionsFlushSnapshot: ActionsSnapshot | null = null;
let listenerInstalled = false;

export function installActionsBridgeListener(): void {
  if (listenerInstalled) return;
  if (typeof window === "undefined") return;
  listenerInstalled = true;
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.origin !== "" && event.origin !== window.origin) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    const typed = data as { type?: unknown };
    if (typeof typed.type !== "string" || !typed.type.startsWith("ECHLY_ACTIONS_")) return;
    const msg = data as ActionsFlushPush;
    if (
      msg.source === ACTIONS_BRIDGE_SOURCE_MAIN &&
      msg.type === ACTIONS_FLUSH_PUSH &&
      msg.snapshot &&
      Array.isArray(msg.snapshot.actions)
    ) {
      cachedActionsFlushSnapshot = msg.snapshot;
      // Stage 3: forward this page's flush to the service worker so it accumulates
      // into the cross-navigation engagement buffer. Best-effort; swallow errors
      // (SW asleep / channel closed). The local cache above remains the click-time
      // fallback.
      try {
        chrome.runtime
          .sendMessage({
            type: "ECHLY_CAPTURE_FLUSH",
            surface: "actions",
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
     event still contributes. Best-effort; the SW dedupes by action id. */
  try {
    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((req) => {
        if (req?.type === "ECHLY_REQUEST_CAPTURE_FLUSH") {
          void requestActionsSnapshot(400).then((snapshot) => {
            if (!snapshot) return;
            try {
              chrome.runtime
                .sendMessage({ type: "ECHLY_CAPTURE_FLUSH", surface: "actions", snapshot })
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

export function requestActionsSnapshot(
  timeoutMs = 500,
): Promise<ActionsSnapshot | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }
  const requestId = genRequestId();
  return new Promise<ActionsSnapshot | null>((resolve) => {
    let settled = false;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.origin !== "" && event.origin !== window.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const typed = data as { type?: unknown };
      if (typeof typed.type !== "string" || !typed.type.startsWith("ECHLY_ACTIONS_")) return;
      const msg = data as ActionsSnapshotResponse;
      if (
        msg.source === ACTIONS_BRIDGE_SOURCE_MAIN &&
        msg.type === ACTIONS_SNAPSHOT_RESPONSE &&
        msg.requestId === requestId &&
        msg.snapshot &&
        Array.isArray(msg.snapshot.actions)
      ) {
        if (settled) return;
        settled = true;
        window.removeEventListener("message", onMessage);
        // Also cache as the latest known snapshot in case the next request
        // hits a navigated-away page.
        cachedActionsFlushSnapshot = msg.snapshot;
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
      // torn down by hard navigation but flushed before unload).
      resolve(cachedActionsFlushSnapshot);
    }, timeoutMs);

    try {
      window.postMessage(
        {
          source: ACTIONS_BRIDGE_SOURCE_ISOLATED,
          type: ACTIONS_SNAPSHOT_REQUEST,
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
