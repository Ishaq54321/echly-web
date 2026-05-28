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

  // Chrome extension content-script noise that isn't ours.
  /chrome-extension:\/\//,
]);

export function isDenylisted(message: string): boolean {
  if (!message) return false;
  for (const pattern of CONSOLE_DENYLIST) {
    if (pattern.test(message)) return true;
  }
  return false;
}
