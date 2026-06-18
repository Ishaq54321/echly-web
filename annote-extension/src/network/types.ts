/**
 * Shared type definitions for the network-capture feature.
 *
 * Mirrors the shape of `../console/types.ts` so future maintainers can pattern
 * across the two streams. Network entries carry both request- and response-side
 * surfaces (headers + bodies) plus an `errored` channel for transport failures
 * (DNS, CORS, abort) that never produced an HTTP status.
 *
 * The postMessage protocol uses the same isolated/main bridge as Console but
 * with an `ECHLY_NETWORK_*` prefix so the two cannot collide on a single page.
 */

/**
 * How the entry was captured:
 *  - "fetch" / "xhr"      → live wrapper capture during engagement.
 *  - "resource-timing"    → Layer 2 retroactive replay from the Resource Timing /
 *                           Navigation Timing API at engagement. Recovers requests
 *                           + resource loads that COMPLETED before the wrappers were
 *                           armed (the page-load window), including the broken-image
 *                           / favicon-type failures that never go through fetch/XHR.
 *  - "beacon"             → navigator.sendBeacon (analytics/error transport).
 */
export type NetworkSource = "fetch" | "xhr" | "resource-timing" | "beacon";

/**
 * Evidence-quality discriminator. Layer 2 surfaces MORE network noise (favicon
 * 404s, 4xx/5xx resource loads), so downstream analysis needs to weight entries
 * by what they are rather than just status. `kind` carries that:
 *  - undefined               → ordinary request; weight by `status`/`errored`.
 *  - "resource-load-failure" → a sub-resource (img/css/font/script) that failed to
 *                              load (Resource Timing entry with no/zero status or a
 *                              transferSize:0 cache-miss-error shape). Low signal.
 *  - "http-4xx" / "http-5xx" → a retroactively-observed client/server error status
 *                              from Resource Timing `responseStatus`. Higher signal.
 * Optional + additive so existing stored tickets still validate.
 */
export type NetworkKind = "resource-load-failure" | "http-4xx" | "http-5xx";

export interface NetworkRequestEntry {
  /** UUID generated at capture time (request-start). */
  id: string;
  /** Start time in ms epoch. */
  timestamp: number;
  /** Post-redaction URL. */
  url: string;
  /** HTTP method (uppercased: GET/POST/PUT/DELETE/PATCH/HEAD/OPTIONS). */
  method: string;
  /** Null if the request errored before receiving a status (DNS, abort, CORS, etc.). */
  status: number | null;
  statusText: string | null;
  /** Wall-clock duration in ms; null while pending or on transport error. */
  durationMs: number | null;
  source: NetworkSource;
  /** Severity/type discriminator — see NetworkKind. Absent for ordinary requests. */
  kind?: NetworkKind;
  /**
   * True when this entry was reconstructed from Resource/Navigation Timing at
   * engagement rather than observed live. Lets the dedup logic and the UI treat
   * replayed entries (which lack bodies/headers) distinctly from live ones.
   */
  replayed?: boolean;
  /** Post-redaction request headers. Header NAMES preserved, sensitive values masked. */
  requestHeaders: Record<string, string>;
  /** Post-redaction response headers. */
  responseHeaders: Record<string, string>;
  /** Post-redaction request body, truncated to the per-body byte cap. */
  requestBody: string | null;
  /** Raw byte length of the request body before truncation. */
  requestBodyOriginalSize: number | null;
  requestBodyTruncated: boolean;
  /** Post-redaction response body, truncated to the per-body byte cap. */
  responseBody: string | null;
  responseBodyOriginalSize: number | null;
  responseBodyTruncated: boolean;
  /** Parsed from the Content-Type response header; lets the UI pick a renderer. */
  responseContentType: string | null;
  /** True for transport-layer failures (CORS, DNS, abort). */
  errored: boolean;
  errorMessage: string | null;
  /** window.location.href at request-start — useful when a bug spans SPA routes. */
  initiatorPage: string | null;
}

export interface NetworkSnapshot {
  requests: NetworkRequestEntry[];
  capturedAt: number;
}

// ─── postMessage bridge protocol ────────────────────────────────

export const NETWORK_BRIDGE_SOURCE_ISOLATED = "annote-isolated" as const;
export const NETWORK_BRIDGE_SOURCE_MAIN = "annote-main" as const;

export const NETWORK_SNAPSHOT_REQUEST = "ECHLY_NETWORK_SNAPSHOT_REQUEST" as const;
export const NETWORK_SNAPSHOT_RESPONSE = "ECHLY_NETWORK_SNAPSHOT_RESPONSE" as const;
export const NETWORK_FLUSH_PUSH = "ECHLY_NETWORK_FLUSH_PUSH" as const;

export interface NetworkSnapshotRequest {
  source: typeof NETWORK_BRIDGE_SOURCE_ISOLATED;
  type: typeof NETWORK_SNAPSHOT_REQUEST;
  requestId: string;
}

export interface NetworkSnapshotResponse {
  source: typeof NETWORK_BRIDGE_SOURCE_MAIN;
  type: typeof NETWORK_SNAPSHOT_RESPONSE;
  requestId: string;
  snapshot: NetworkSnapshot;
}

export interface NetworkFlushPush {
  source: typeof NETWORK_BRIDGE_SOURCE_MAIN;
  type: typeof NETWORK_FLUSH_PUSH;
  snapshot: NetworkSnapshot;
}

export type NetworkBridgeMessage =
  | NetworkSnapshotRequest
  | NetworkSnapshotResponse
  | NetworkFlushPush;
