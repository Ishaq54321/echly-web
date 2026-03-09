/**
 * Development-only logger. No-op in production.
 * Use for debug logs; keep console.error for actual failures.
 */
const _nodeDev =
  typeof process !== "undefined" && process.env?.NODE_ENV === "development";
const _windowDebug =
  typeof window !== "undefined" &&
  (window as Window & { __ECHLY_DEBUG__?: boolean }).__ECHLY_DEBUG__ === true;

/** When true, debug logs run. Set window.__ECHLY_DEBUG__ = true in console to enable in extension. */
export const ECHLY_DEBUG = _nodeDev || _windowDebug;

export const isDev =
  typeof process !== "undefined" && process.env?.NODE_ENV === "development";

export function log(...args: unknown[]): void {
  if (ECHLY_DEBUG) console.log(...args);
}

export function warn(...args: unknown[]): void {
  if (ECHLY_DEBUG) console.warn(...args);
}

/** Echly AI pipeline diagnostics only. Use for high-value debug; avoids terminal noise. */
export function echlyDebug(label: string, data: unknown): void {
  if (ECHLY_DEBUG) console.log(`ECHLY DEBUG — ${label}:`, data);
}
