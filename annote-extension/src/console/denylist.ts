/**
 * Known-noisy console output that we drop at capture time.
 *
 * Each pattern is intentionally narrow and linear-time (no nested quantifiers,
 * no backtracking traps) — the MAIN-world wrapper tests every captured message
 * against this list before pushing to the buffer, so cost is paid per log.
 */

export const CONSOLE_DENYLIST: readonly RegExp[] = Object.freeze([
  // React DevTools install prompt (both the canonical and minified phrasings).
  /Download the React DevTools/i,
  /better development experience.*react-devtools/i,

  // Vue DevTools install prompt.
  /Download the Vue Devtools/i,
  /You are running Vue in development mode/i,

  // Next.js HMR / fast-refresh chatter.
  /\[Fast Refresh\]/,
  /\[HMR\]/,
  /\[Next\.js\]/,
  /hot-reloader-client/,

  // Webpack / Vite HMR chatter.
  /\[webpack-dev-server\]/,
  /\[webpack\] (?:Compiled|Compiling|Building)/,
  /\[vite\] (?:connected|connecting|hmr update|page reload)/i,
  /hmr update/i,

  // Tailwind JIT.
  /tailwindcss: .*JIT/i,

  // Analytics SDK debug output.
  /^\[GA\]/,
  /google-analytics/i,
  /^\[Segment\]/,
  /^\[Mixpanel\]/,
  /^\[Amplitude\]/,
  /^\[PostHog\]/,
  /posthog\.com.*debug/i,

  // Stripe.js debug.
  /\[Stripe\.js\]/,
  /stripe\.com\/v3/i,

  // Intercom widget debug.
  /\[Intercom\]/i,

  // Sentry SDK internals (avoid capturing Sentry's own breadcrumbs/logs).
  /\[Sentry\]/,
  /Sentry Logger \[(?:log|info|warn|error|debug)\]/,

  // LogRocket SDK internals.
  /\[LogRocket\]/,

  // Cross-origin iframe security warnings (very chatty on embed-heavy pages).
  /Blocked a frame with origin/i,
  /SecurityError: Blocked a frame/i,

  // NOTE (scoping fix): there is intentionally NO `chrome-extension://` MESSAGE
  // pattern here anymore. It used to live in this list and matched the scheme
  // ANYWHERE in a message string — which silently dropped legitimate PAGE logs and
  // errors that merely MENTION a chrome-extension:// URL (the common real case:
  // a browser-emitted CSP violation report naming a blocked extension resource, or
  // a page that logs "failed to talk to extension X at chrome-extension://…").
  // Those are real page evidence, not extension noise. The honest signal for
  // "this came FROM an extension" is the SOURCE/STACK origin, not the message text
  // — that is handled by EXTENSION_ORIGIN_PATTERN / isExtensionOrigin below, which
  // recordError + the unhandledrejection path consult against an entry's `source`
  // and `stack`. So extension-thrown errors are still filtered; page logs that
  // happen to name the scheme are no longer collateral.

  // Our OWN extension's stray logs, should any reach the page realm (Fix C-lite,
  // belt-and-suspenders). Anchored to the start so only our prefixes match, not
  // an arbitrary mention of the word elsewhere in a page's log line. Case-
  // insensitive and tolerant of a tag suffix because the widget logs under
  // several real prefixes — "[ECHLY]", "[Echly]", "[ECHLY PERF]", "[ECHLY BG]",
  // "[ECHLY MESSAGE]", "[ECHLY AUTH]", "[ECHLY ERROR]", "[Annote]". A literal
  // "[ECHLY]" anchor missed every variant with a space before the "]".
  // NOTE: the intentional synthetic capture watermarks ("[Annote] Console capture
  // paused…" / "resumed.") are written straight to the buffer via buffer.addLog
  // and never pass through this denylist, so they still surface as designed.
  /^\[(?:ECHLY|ANNOTE)(?:[ :][^\]]*)?\]/i,
]);

/**
 * Extension-origin signal for the SOURCE/STACK of a console entry (as opposed to
 * its message text). The console denylist above matches an entry's MESSAGE; this
 * matches the entry's `source` (script URL) or an Error's `stack`, which is where
 * a `chrome-extension://` origin actually shows up for an extension-thrown error
 * (e.g. our widget's own "Failed to fetch" rejection — whose message is just
 * "Failed to fetch" but whose stack frames are all chrome-extension://). Targets
 * the SCHEME specifically, never a host like annote.ai, so a real bug captured on
 * annote.ai (same-origin page traffic) is never filtered.
 */
export const EXTENSION_ORIGIN_PATTERN = /chrome-extension:\/\//i;

/** True if `text` (a script source URL or an Error stack) originates in an extension. */
export function isExtensionOrigin(text: string | null | undefined): boolean {
  if (!text) return false;
  return EXTENSION_ORIGIN_PATTERN.test(text);
}

export function isDenylisted(message: string): boolean {
  if (!message) return false;
  for (const pattern of CONSOLE_DENYLIST) {
    if (pattern.test(message)) return true;
  }
  return false;
}
