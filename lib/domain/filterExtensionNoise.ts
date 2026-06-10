/**
 * Render-time filter for extension-originated capture noise.
 *
 * The extension now drops its own console/network/exception noise at CAPTURE
 * time (see annote-extension/src/console/denylist.ts +
 * annote-extension/src/network/denylist.ts). But tickets filed BEFORE that fix
 * already have the noise persisted — an exception whose stack is all
 * chrome-extension://, our widget's own chrome-extension:// requests, a stray
 * "[ECHLY …]" log. This module strips those entries when a stored ticket is
 * read, so historical tickets display clean in the DevTools tabs AND re-analyze
 * cleanly (the AI assembler runs the same filter), keeping both consistent with
 * freshly-captured tickets.
 *
 * CRITICAL — preserve dogfooding: we match the chrome-extension:// / moz-extension://
 * SCHEME (and our own log prefix), NEVER a host like annote.ai. A bug captured ON
 * annote.ai keeps the dashboard's own same-origin page console/network; a user's
 * first-party API calls on their own site are untouched.
 */

import type {
  ConsoleLogEntry,
  ExceptionEntry,
  NetworkRequestEntry,
} from "@/lib/domain/feedback";

/** The extension-origin scheme signal — matches the SCHEME, never a host. */
const EXTENSION_SCHEME = /(?:chrome|moz)-extension:\/\//i;

/**
 * Our widget's own log prefixes, anchored to the start of the message so a
 * page's own log that merely mentions the word mid-line is never dropped.
 * Mirrors annote-extension/src/console/denylist.ts's prefix pattern, tolerant
 * of a tag suffix ("[ECHLY PERF]", "[Echly]", "[Annote]", …).
 */
const WIDGET_LOG_PREFIX = /^\[(?:ECHLY|ANNOTE)(?:[ :][^\]]*)?\]/i;

/** True if a stored console entry was emitted by our extension. */
export function isExtensionConsoleEntry(entry: ConsoleLogEntry): boolean {
  if (WIDGET_LOG_PREFIX.test(entry.message ?? "")) return true;
  if (EXTENSION_SCHEME.test(entry.message ?? "")) return true;
  if (entry.source && EXTENSION_SCHEME.test(entry.source)) return true;
  if (Array.isArray(entry.args) && entry.args.some((a) => EXTENSION_SCHEME.test(a))) {
    return true;
  }
  return false;
}

/** True if a stored exception originated in our extension (stack/source/message). */
export function isExtensionExceptionEntry(entry: ExceptionEntry): boolean {
  if (entry.stack && EXTENSION_SCHEME.test(entry.stack)) return true;
  if (entry.source && EXTENSION_SCHEME.test(entry.source)) return true;
  if (EXTENSION_SCHEME.test(entry.message ?? "")) return true;
  return false;
}

/** True if a stored network entry was our extension's own request. */
export function isExtensionNetworkEntry(entry: NetworkRequestEntry): boolean {
  return EXTENSION_SCHEME.test(entry.url ?? "");
}

/**
 * Strip extension-originated entries from a stored ticket's capture arrays.
 * Returns the cleaned arrays plus how many of each were removed, so callers can
 * (optionally) decrement the denormalized counts they display alongside.
 * Pure — undefined arrays stay undefined (the API contract omits absent fields).
 */
export function filterExtensionNoise<
  T extends {
    consoleLogs?: ConsoleLogEntry[] | null;
    exceptions?: ExceptionEntry[] | null;
    networkRequests?: NetworkRequestEntry[] | null;
  },
>(
  ticket: T,
): {
  consoleLogs: ConsoleLogEntry[] | undefined;
  exceptions: ExceptionEntry[] | undefined;
  networkRequests: NetworkRequestEntry[] | undefined;
  removed: { consoleLogs: number; exceptions: number; networkRequests: number };
} {
  const removed = { consoleLogs: 0, exceptions: 0, networkRequests: 0 };

  const consoleLogs = ticket.consoleLogs?.filter((c) => {
    const drop = isExtensionConsoleEntry(c);
    if (drop) removed.consoleLogs += 1;
    return !drop;
  });
  const exceptions = ticket.exceptions?.filter((e) => {
    const drop = isExtensionExceptionEntry(e);
    if (drop) removed.exceptions += 1;
    return !drop;
  });
  const networkRequests = ticket.networkRequests?.filter((r) => {
    const drop = isExtensionNetworkEntry(r);
    if (drop) removed.networkRequests += 1;
    return !drop;
  });

  return { consoleLogs, exceptions, networkRequests, removed };
}
