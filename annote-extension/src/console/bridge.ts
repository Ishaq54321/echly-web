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
    const data = event.data as ConsoleFlushPush | undefined;
    if (!data || typeof data !== "object") return;
    if (
      data.source === CONSOLE_BRIDGE_SOURCE_MAIN &&
      data.type === CONSOLE_FLUSH_PUSH &&
      data.snapshot &&
      Array.isArray(data.snapshot.logs) &&
      Array.isArray(data.snapshot.exceptions)
    ) {
      cachedFlushSnapshot = data.snapshot;
    }
  });
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
      const data = event.data as ConsoleSnapshotResponse | undefined;
      if (!data || typeof data !== "object") return;
      if (
        data.source === CONSOLE_BRIDGE_SOURCE_MAIN &&
        data.type === CONSOLE_SNAPSHOT_RESPONSE &&
        data.requestId === requestId &&
        data.snapshot &&
        Array.isArray(data.snapshot.logs) &&
        Array.isArray(data.snapshot.exceptions)
      ) {
        if (settled) return;
        settled = true;
        window.removeEventListener("message", onMessage);
        // Also cache as the latest known snapshot in case the next request
        // hits a navigated-away page.
        cachedFlushSnapshot = data.snapshot;
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
