/**
 * Shared type definitions for the console-log capture feature.
 *
 * These types describe entries stored in the MAIN-world ring buffer, the
 * postMessage protocol used to bridge MAIN <-> isolated worlds, and the
 * snapshot shape attached to a ticket at click-time.
 *
 * The companion type duplicated in `lib/domain/feedback.ts` (web app side)
 * must stay structurally identical — keep them in sync.
 */

export type ConsoleLogLevel = "log" | "info" | "warn" | "error" | "debug";

/**
 * Evidence-quality discriminator on a console log entry. The capture layers now
 * surface MORE — including low-signal noise (favicon 404s, deprecation warnings) —
 * so downstream analysis needs to weight entries by what they actually are rather
 * than treating every `level:"error"` identically. `kind` carries that signal:
 *
 *  - undefined           → an ordinary page console.* call (weight by `level`).
 *  - "resource-load-failure" → a synthetic entry for a failed <img>/<script>/<link>
 *                          element load (the browser's "Failed to load resource").
 *                          Lower signal than a real uncaught exception; an AI should
 *                          rank a TypeError above a favicon 404.
 *
 * Kept optional + additive so existing stored tickets (no `kind`) still validate.
 */
export type ConsoleLogKind = "resource-load-failure";

export interface ConsoleLogEntry {
  timestamp: number;
  level: ConsoleLogLevel;
  message: string;
  args?: string[];
  source?: string;
  /** Severity/type discriminator — see ConsoleLogKind. Absent for ordinary logs. */
  kind?: ConsoleLogKind;
}

export type ExceptionType = "error" | "unhandledrejection";

export interface ExceptionEntry {
  timestamp: number;
  message: string;
  stack?: string | null;
  source?: string | null;
  line?: number | null;
  column?: number | null;
  type: ExceptionType;
}

export interface ConsoleSnapshot {
  logs: ConsoleLogEntry[];
  exceptions: ExceptionEntry[];
  capturedAt: number;
}

// ─── postMessage bridge protocol ────────────────────────────────

export const CONSOLE_BRIDGE_SOURCE_ISOLATED = "annote-isolated" as const;
export const CONSOLE_BRIDGE_SOURCE_MAIN = "annote-main" as const;

export const CONSOLE_SNAPSHOT_REQUEST = "ECHLY_CONSOLE_SNAPSHOT_REQUEST" as const;
export const CONSOLE_SNAPSHOT_RESPONSE = "ECHLY_CONSOLE_SNAPSHOT_RESPONSE" as const;
export const CONSOLE_FLUSH_PUSH = "ECHLY_CONSOLE_FLUSH_PUSH" as const;

export interface ConsoleSnapshotRequest {
  source: typeof CONSOLE_BRIDGE_SOURCE_ISOLATED;
  type: typeof CONSOLE_SNAPSHOT_REQUEST;
  requestId: string;
}

export interface ConsoleSnapshotResponse {
  source: typeof CONSOLE_BRIDGE_SOURCE_MAIN;
  type: typeof CONSOLE_SNAPSHOT_RESPONSE;
  requestId: string;
  snapshot: ConsoleSnapshot;
}

export interface ConsoleFlushPush {
  source: typeof CONSOLE_BRIDGE_SOURCE_MAIN;
  type: typeof CONSOLE_FLUSH_PUSH;
  snapshot: ConsoleSnapshot;
}

export type ConsoleBridgeMessage =
  | ConsoleSnapshotRequest
  | ConsoleSnapshotResponse
  | ConsoleFlushPush;
