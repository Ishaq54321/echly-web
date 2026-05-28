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

export type NetworkSource = "fetch" | "xhr";

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
