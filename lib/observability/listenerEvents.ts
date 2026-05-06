/**
 * Telemetry chokepoint for realtime Firestore listeners.
 * Phase 1 routes to lib/logger.ts. Future Sentry/PostHog wiring lives here only —
 * downstream stores never import a logger directly.
 */
import { logger } from "@/lib/logger";

type Meta = Record<string, unknown> | undefined;

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
  const errorFields: Record<string, unknown> =
    error instanceof Error
      ? {
          errorName: error.name,
          errorMessage: error.message,
          errorCode: (error as { code?: unknown }).code,
        }
      : { errorMessage: String(error) };

  logger.error("listener", `error ${name}:${key}`, {
    ...errorFields,
    ...(meta ?? {}),
  });
}

export function recordListenerUpdate(name: string, key: string, meta?: Meta): void {
  logger.debug("listener", `update ${name}:${key}`, meta);
}
