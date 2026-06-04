/**
 * Isolated-world bridge to the MAIN-world console buffer.
 *
 * The MAIN-world script (mainWorld.ts) holds the ring buffer; we live in the
 * isolated content-script world and cannot read its memory directly. We
 * exchange data through `window.postMessage` only — that's the one channel
 * both worlds share.
 *
 * Two paths:
 *   1. requestSnapshot() — request/response with a unique requestId. Used at
 *      click time. If the MAIN script is unreachable (CSP, navigation tear-
 *      down, never-loaded) we time out and return the cached flush snapshot
 *      if we have one, else an empty snapshot. We never reject — log capture
 *      MUST NOT block ticket creation.
 *   2. installBridgeListener() — passive listener for ECHLY_CONSOLE_FLUSH_PUSH
 *      events that the MAIN script fires on visibilitychange/beforeunload.
 *      The most recent push is cached so requestSnapshot has something to
 *      fall back to during a hard navigation.
 */

import type { ConsoleSnapshot, ConsoleSnapshotResponse, ConsoleFlushPush } from "./types";
import {
  CONSOLE_BRIDGE_SOURCE_ISOLATED,
  CONSOLE_BRIDGE_SOURCE_MAIN,
  CONSOLE_FLUSH_PUSH,
  CONSOLE_SNAPSHOT_REQUEST,
  CONSOLE_SNAPSHOT_RESPONSE,
} from "./types";

const EMPTY_SNAPSHOT = (): ConsoleSnapshot => ({
  logs: [],
  exceptions: [],
  capturedAt: Date.now(),
});

let cachedFlushSnapshot: ConsoleSnapshot | null = null;
let listenerInstalled = false;

export function installBridgeListener(): void {
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
    const msg = data as ConsoleFlushPush;
    if (
      msg.source === CONSOLE_BRIDGE_SOURCE_MAIN &&
      msg.type === CONSOLE_FLUSH_PUSH &&
      msg.snapshot &&
      Array.isArray(msg.snapshot.logs) &&
      Array.isArray(msg.snapshot.exceptions)
    ) {
      cachedFlushSnapshot = msg.snapshot;
      // Stage 3: forward this page's flush to the service worker so it accumulates
      // into the cross-navigation engagement buffer. Best-effort: the SW may be
      // asleep or the channel closed during teardown — swallow any error (the local
      // cache above is still the click-time fallback). One added side-effect; the
      // existing caching behavior is unchanged.
      try {
        chrome.runtime
          .sendMessage({
            type: "ECHLY_CAPTURE_FLUSH",
            surface: "console",
            snapshot: msg.snapshot,
          })
          .catch(() => {});
      } catch {
        // chrome.runtime unavailable (page teardown) — ignore.
      }
    }
  });

  /* Stage 3 safety-net: a tab killed without a visibilitychange/beforeunload event
     never fires flushPush, so the SW would miss its tail. The SW's keepalive alarm
     periodically pokes the active engaged tab with ECHLY_REQUEST_CAPTURE_FLUSH; we
     respond by pulling a live snapshot from the MAIN buffer and forwarding it to the
     SW exactly like a flush-push. Best-effort and idempotent (the SW dedupes by id). */
  try {
    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((req) => {
        if (req?.type === "ECHLY_REQUEST_CAPTURE_FLUSH") {
          void requestSnapshot(400).then((snapshot) => {
            try {
              chrome.runtime
                .sendMessage({ type: "ECHLY_CAPTURE_FLUSH", surface: "console", snapshot })
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
  // Fallback: timestamp + random. Uniqueness only needs to hold within the
  // listener's response window (a few hundred ms).
  return "req-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function requestSnapshot(timeoutMs = 1000): Promise<ConsoleSnapshot> {
  if (typeof window === "undefined") {
    return Promise.resolve(EMPTY_SNAPSHOT());
  }
  const requestId = genRequestId();
  return new Promise<ConsoleSnapshot>((resolve) => {
    let settled = false;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.origin !== "" && event.origin !== window.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const typed = data as { type?: unknown };
      if (typeof typed.type !== "string" || !typed.type.startsWith("ECHLY_")) return;
      const msg = data as ConsoleSnapshotResponse;
      if (
        msg.source === CONSOLE_BRIDGE_SOURCE_MAIN &&
        msg.type === CONSOLE_SNAPSHOT_RESPONSE &&
        msg.requestId === requestId &&
        msg.snapshot &&
        Array.isArray(msg.snapshot.logs) &&
        Array.isArray(msg.snapshot.exceptions)
      ) {
        if (settled) return;
        settled = true;
        window.removeEventListener("message", onMessage);
        // Also cache as the latest known snapshot in case the next request
        // hits a navigated-away page.
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
      // Fall back to the cached flush snapshot if we have one (e.g. MAIN
      // script torn down by hard navigation but flushed before unload).
      resolve(cachedFlushSnapshot ?? EMPTY_SNAPSHOT());
    }, timeoutMs);

    try {
      window.postMessage(
        {
          source: CONSOLE_BRIDGE_SOURCE_ISOLATED,
          type: CONSOLE_SNAPSHOT_REQUEST,
          requestId,
        },
        "*",
      );
    } catch {
      // postMessage shouldn't throw in practice; if it does, the timeout
      // path resolves with the cached/empty snapshot.
    }
  });
}
