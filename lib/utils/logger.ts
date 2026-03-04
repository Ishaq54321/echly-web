/**
 * Development-only logger. No-op in production.
 * Use for debug logs; keep console.error for actual failures.
 */
export const isDev = process.env.NODE_ENV === "development";

export function log(...args: unknown[]): void {
  if (isDev) console.log(...args);
}

export function warn(...args: unknown[]): void {
  if (isDev) console.warn(...args);
}

/** Echly AI pipeline diagnostics only. Use for high-value debug; avoids terminal noise. */
export function echlyDebug(label: string, data: unknown): void {
  if (isDev) console.log(`ECHLY DEBUG — ${label}:`, data);
}
