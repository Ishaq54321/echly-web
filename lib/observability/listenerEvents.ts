/**
 * Telemetry chokepoint for realtime Firestore listeners.
 * Phase 1 routes to lib/logger.ts. Future Sentry/PostHog wiring lives here only —
 * downstream stores never import a logger directly.
 */
import { logger } from "@/lib/logger";

type Meta = Record<string, unknown> | undefined;

/**
 * Firestore error codes that represent an EXPECTED listener teardown rather than
 * a fault: the watched doc was deleted, or the viewer's read access ended while
 * a snapshot was still open. Both fire the onSnapshot error callback with these
 * codes, but they are normal lifecycle transitions — the session/feedback stores
 * already surface them to the UI as `accessRevoked` / `exists === false` and the
 * page redirects. Logging them at `error` is noise (e.g. deleting the session
 * you're viewing yells one red error per open listener). Downgrade to `debug` so
 * genuine listener faults (failed-precondition, unavailable, etc.) still surface.
 */
const EXPECTED_TEARDOWN_CODES = new Set(["permission-denied", "not-found"]);

export function recordListenerAttach(name: string, key: string, meta?: Meta): void {
  logger.debug("listener", `attach ${name}:${key}`, meta);
}

export function recordListenerDetach(name: string, key: string, meta?: Meta): void {
  logger.debug("listener", `detach ${name}:${key}`, meta);
}

export function recordListenerError(
  name: string,
  key: string,
  error: unknown,
  meta?: Meta
): void {
  const code =
    error instanceof Error ? (error as { code?: unknown }).code : undefined;

  const errorFields: Record<string, unknown> =
    error instanceof Error
      ? {
          errorName: error.name,
          errorMessage: error.message,
          errorCode: code,
        }
      : { errorMessage: String(error) };

  const fields = { ...errorFields, ...(meta ?? {}) };

  // Expected teardown (doc deleted / access ended mid-view) is a lifecycle
  // signal the consuming store already handles — log it quietly so it doesn't
  // read as a fault in the console.
  if (typeof code === "string" && EXPECTED_TEARDOWN_CODES.has(code)) {
    logger.debug("listener", `teardown ${name}:${key} (${code})`, fields);
    return;
  }

  logger.error("listener", `error ${name}:${key}`, fields);
}

export function recordListenerUpdate(name: string, key: string, meta?: Meta): void {
  logger.debug("listener", `update ${name}:${key}`, meta);
}
