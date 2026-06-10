/**
 * Capture-time denylist for known-noisy third-party network traffic.
 *
 * Every pattern is linear-time (no nested quantifiers, no backtracking shapes).
 * Matched against either the URL's hostname (`match: "host"`) or the full URL
 * string (`match: "url"`). The MAIN-world wrapper consults this before pushing
 * a request to the ring buffer, so cost is paid per request.
 *
 * Important: first-party requests (same origin as the host page) are NEVER
 * denied. If a user has their own /analytics endpoint, we want to capture it.
 */

export interface NetworkDenylistPattern {
  readonly pattern: RegExp;
  readonly match: "url" | "host";
}

export const NETWORK_DENYLIST: readonly NetworkDenylistPattern[] = Object.freeze([
  // ─── Analytics ──────────────────────────────────────────────────
  // Google Analytics + Tag Manager.
  { pattern: /(?:^|\.)google-analytics\.com$/i, match: "host" },
  { pattern: /(?:^|\.)googletagmanager\.com$/i, match: "host" },
  { pattern: /(?:^|\.)g\.doubleclick\.net$/i, match: "host" },
  { pattern: /\/(?:g|j|r)\/collect(?:[/?]|$)/i, match: "url" },
  { pattern: /\/gtag\/js(?:[?]|$)/i, match: "url" },

  // Segment.
  { pattern: /^api\.segment\.io$/i, match: "host" },
  { pattern: /^cdn\.segment\.com$/i, match: "host" },

  // Mixpanel.
  { pattern: /^api(?:-js)?\.mixpanel\.com$/i, match: "host" },
  { pattern: /^cdn\.mxpnl\.com$/i, match: "host" },

  // Amplitude.
  { pattern: /(?:^|\.)amplitude\.com$/i, match: "host" },

  // PostHog (cloud + EU + self-hosted reverse-proxy convention).
  { pattern: /(?:^|\.)posthog\.com$/i, match: "host" },
  { pattern: /(?:^|\.)i\.posthog\.com$/i, match: "host" },

  // Heap.
  { pattern: /(?:^|\.)heapanalytics\.com$/i, match: "host" },

  // Hotjar.
  { pattern: /(?:^|\.)hotjar\.com$/i, match: "host" },
  { pattern: /(?:^|\.)hotjar\.io$/i, match: "host" },

  // ─── Error / session replay tooling ─────────────────────────────
  // Sentry.
  { pattern: /(?:^|\.)sentry\.io$/i, match: "host" },
  { pattern: /(?:^|\.)ingest\.sentry\.io$/i, match: "host" },

  // LogRocket.
  { pattern: /^cdn\.lr-ingest\.io$/i, match: "host" },
  { pattern: /(?:^|\.)logrocket\.com$/i, match: "host" },
  { pattern: /(?:^|\.)lr-in\.com$/i, match: "host" },

  // FullStory.
  { pattern: /(?:^|\.)fullstory\.com$/i, match: "host" },

  // Datadog RUM / browser SDK.
  { pattern: /(?:^|\.)datadoghq\.com$/i, match: "host" },
  { pattern: /(?:^|\.)datadoghq\.eu$/i, match: "host" },
  { pattern: /(?:^|\.)ddog-gov\.com$/i, match: "host" },

  // ─── Widget telemetry (widget itself stays; telemetry only) ─────
  // Intercom telemetry endpoint.
  { pattern: /^api-iam\.intercom\.io$/i, match: "host" },

  // ─── Asset CDNs (third-party only) ──────────────────────────────
  { pattern: /^cdn\.jsdelivr\.net$/i, match: "host" },
  { pattern: /^unpkg\.com$/i, match: "host" },
  { pattern: /^cdnjs\.cloudflare\.com$/i, match: "host" },
  { pattern: /^stackpath\.bootstrapcdn\.com$/i, match: "host" },

  // ─── Font services ──────────────────────────────────────────────
  { pattern: /^fonts\.googleapis\.com$/i, match: "host" },
  { pattern: /^fonts\.gstatic\.com$/i, match: "host" },
  { pattern: /(?:^|\.)typekit\.net$/i, match: "host" },
  { pattern: /(?:^|\.)fontawesome\.com$/i, match: "host" },
]);

/**
 * GA4 Measurement Protocol wire-format check. Catches first-party-proxied
 * (server-side GTM) beacons the host patterns can't see — they ride the
 * customer's own origin, so hostname matching never fires. We fingerprint the
 * GA4 collect payload itself: protocol version `v=2` plus a `G-`-prefixed
 * measurement id (`tid`). Both must be present, so a real first-party API call
 * that merely happens to carry one of these params is not affected.
 *
 * Deliberately GA4-only: Segment / Plausible / Fathom / PostHog proxied forms
 * were assessed and rejected for false-positive risk (see diagnosis). Uses
 * `parsed.searchParams` (order-independent, no regex backtracking) to preserve
 * the file's linear-time invariant.
 */
export function isProxiedAnalyticsBeacon(parsed: URL): boolean {
  return (
    parsed.searchParams.get("v") === "2" &&
    /^G-/.test(parsed.searchParams.get("tid") ?? "")
  );
}

/**
 * Returns true if the URL should be excluded from network capture.
 *
 * Same-origin requests are never denied — protects against false positives on
 * customers who run their own /analytics or /collect endpoints under their own
 * domain. If URL parsing fails for any reason we return false (better to
 * capture noise than to silently lose a request).
 */
export function isNetworkDenylisted(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.href : "http://localhost/");

    // Extension-origin requests are always denied — our widget's own traffic
    // (API calls, dynamic-import chunk loads from chrome-extension://, and the
    // "Failed to fetch" transport errors they throw) must never be captured as
    // if it were the page's. Checked BEFORE the same-origin escape: an
    // extension-page context would otherwise treat its own chrome-extension://
    // origin as "first party" and let the noise through. Matches the
    // chrome-extension:/moz-extension: SCHEME, NOT a host — so a real page
    // request on annote.ai (same-origin first-party traffic) is never filtered.
    if (parsed.protocol === "chrome-extension:" || parsed.protocol === "moz-extension:") {
      return true;
    }

    // GA4 Measurement Protocol beacons are denied even when proxied through
    // the host's own origin — checked BEFORE the same-origin escape below,
    // which would otherwise let first-party-proxied analytics through.
    if (isProxiedAnalyticsBeacon(parsed)) return true;

    // Same-origin escape hatch: never deny first-party requests.
    if (typeof window !== "undefined" && window.location && parsed.origin === window.location.origin) {
      return false;
    }

    const host = parsed.hostname;
    for (const { pattern, match } of NETWORK_DENYLIST) {
      if (match === "host") {
        if (pattern.test(host)) return true;
      } else {
        if (pattern.test(url)) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
