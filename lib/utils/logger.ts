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
