/**
 * LAYER 2 — Resource Timing replay.
 *
 * Recovers network/resource evidence that COMPLETED before the live fetch/XHR
 * wrappers were armed — the page-load window that even document_start install
 * can miss for requests the browser kicked off from HTML before our JS ran (the
 * HTML parser's <img>/<link>/<script> fetches), and any request that finished
 * before the user engaged.
 *
 * At engagement we read the Resource Timing API (`performance.getEntriesByType
 * ("resource")`) and Navigation Timing (`"navigation"`) and reconstruct a
 * best-effort NetworkRequestEntry for each. These entries are intentionally
 * thin: the Resource Timing API exposes timing + sizes + (in newer Chrome)
 * `responseStatus`, but NEVER request/response bodies or headers — those are
 * simply not recorded by the browser for past requests. So a replayed entry
 * carries `replayed: true`, no body, and a `kind`/severity derived from status
 * and the load shape.
 *
 * What this catches that fetch/XHR wrappers structurally cannot:
 *  - Broken <img>/<link rel=stylesheet>/<script>/favicon loads — these never go
 *    through fetch or XHR, so the wrappers never see them. A failed one shows up
 *    in Resource Timing with a zero/short duration and transferSize 0 (and, where
 *    supported, responseStatus 4xx/5xx).
 *  - 4xx/5xx sub-resource fetches that completed during page load before arming.
 *
 * Dedup: a request caught BOTH live (fetch/XHR) and by Resource Timing must not
 * double-list. We skip any replayed entry whose (normalized URL, method) already
 * exists in the live buffer. Resource Timing has no method, so we key the live
 * side by URL and treat a URL match as a duplicate regardless of method — the
 * replayed entry is strictly less informative than the live one, so dropping it
 * on a URL collision never loses signal.
 *
 * Filtering: the SAME network denylist as live capture is applied, so analytics
 * vendors / fonts / replay tooling are excluded consistently. Extension-origin
 * (chrome-extension://) is denied by isNetworkDenylisted too.
 *
 * Runs at most once per realm (one-shot, at the first OFF→ON gate transition) so
 * it can't re-scan and re-add the same historical entries on a pause→resume.
 */

import { isNetworkDenylisted } from "./denylist";
import { redactUrl } from "./redactNetwork";
import type { NetworkKind, NetworkRequestEntry } from "./types";

/** Minimal structural view of a PerformanceResourceTiming we actually read. */
interface ResourceTimingLike {
  name?: unknown; // the resource URL
  initiatorType?: unknown; // "img" | "css" | "script" | "link" | "fetch" | "xmlhttprequest" | ...
  startTime?: unknown;
  responseEnd?: unknown;
  duration?: unknown;
  transferSize?: unknown;
  encodedBodySize?: unknown;
  responseStatus?: unknown; // newer Chrome only — the HTTP status of the response
  entryType?: unknown; // "resource" | "navigation"
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Map an HTTP status to our severity discriminator (or undefined for non-error). */
function kindForStatus(status: number | null): NetworkKind | undefined {
  if (status === null) return undefined;
  if (status >= 500 && status <= 599) return "http-5xx";
  if (status >= 400 && status <= 499) return "http-4xx";
  return undefined;
}

/**
 * Stable id for a replayed entry. We can't use crypto.randomUUID for determinism
 * needs (none here), but we DO want it collision-free against live ids. Prefix
 * "rt-" plus an index keeps it distinct and human-readable in logs.
 */
function replayId(index: number): string {
  return `rt-${index}`;
}

/**
 * Normalize a URL for dedup comparison: strip the fragment (Resource Timing
 * already excludes it, but live capture may include it) and return the rest.
 * Never throws — falls back to the raw string.
 *
 * Exported so the caller can normalize the buffer's live URLs through the EXACT
 * same function, guaranteeing both sides of the dedup compare identically.
 */
export function normalizeForDedup(url: string): string {
  try {
    const u = new URL(url, typeof window !== "undefined" ? window.location.href : "http://localhost/");
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Build replayed NetworkRequestEntry[] from the Resource + Navigation Timing
 * entries currently available, excluding any whose URL already appears in
 * `liveUrls` (the set of normalized URLs already in the buffer from live
 * fetch/XHR capture) and anything the network denylist rejects.
 *
 * `liveUrls` MUST be normalized via normalizeForDedup by the caller. The caller
 * also owns merging the returned entries into the buffer (so all cap/eviction
 * logic stays centralized in NetworkBuffer).
 *
 * Never throws — Resource Timing access is wrapped; a failure yields [].
 */
export function buildResourceTimingReplay(liveUrls: ReadonlySet<string>): NetworkRequestEntry[] {
  const out: NetworkRequestEntry[] = [];
  let perf: Performance | undefined;
  try {
    perf = typeof performance !== "undefined" ? performance : undefined;
  } catch {
    perf = undefined;
  }
  if (!perf || typeof perf.getEntriesByType !== "function") return out;

  const timeOrigin = num((perf as Performance & { timeOrigin?: number }).timeOrigin) ?? 0;

  let entries: ResourceTimingLike[] = [];
  try {
    const resources = (perf.getEntriesByType("resource") as unknown as ResourceTimingLike[]) || [];
    let navs: ResourceTimingLike[] = [];
    try {
      navs = (perf.getEntriesByType("navigation") as unknown as ResourceTimingLike[]) || [];
    } catch {
      navs = [];
    }
    // Navigation entry first (the document load itself), then sub-resources in the
    // order the browser recorded them (roughly chronological by startTime).
    entries = navs.concat(resources);
  } catch {
    return out;
  }

  // Dedup within the replay set itself: a resource fetched twice (cache + network,
  // or retried) appears as multiple timing entries; we keep the FIRST per URL —
  // and prefer one that carries an error status if a later duplicate has it.
  const seenReplayUrls = new Set<string>();
  let index = 0;

  for (const e of entries) {
    index += 1;
    try {
      const rawUrl = str(e.name);
      if (!rawUrl) continue;

      // Same denylist as live capture (analytics/fonts/replay/extension-origin).
      if (isNetworkDenylisted(rawUrl)) continue;

      const normalized = normalizeForDedup(rawUrl);

      // Dedup against LIVE entries — a request caught both ways is the live one's.
      if (liveUrls.has(normalized)) continue;
      // Dedup within the replay set.
      if (seenReplayUrls.has(normalized)) continue;
      seenReplayUrls.add(normalized);

      const initiator = str(e.initiatorType).toLowerCase();
      const startTime = num(e.startTime) ?? 0;
      const responseEnd = num(e.responseEnd);
      const durationMs = num(e.duration);
      const transferSize = num(e.transferSize);
      const encodedBodySize = num(e.encodedBodySize);
      const status = num(e.responseStatus); // undefined on older Chrome → null

      // Classify severity. responseStatus is the authoritative signal when present.
      let kind = kindForStatus(status);

      // Resource-load-failure heuristic for sub-resources WITHOUT a usable status
      // (older Chrome, or opaque cross-origin where responseStatus is masked to 0):
      // a non-fetch/xhr initiator (img/css/script/link/...) that transferred zero
      // bytes AND produced zero encoded body is the classic broken-resource shape.
      // We only mark this for element-type initiators — a legitimately empty 200
      // (204, beacon) on a fetch should NOT be called a failure.
      const isSubResource =
        initiator !== "" &&
        initiator !== "fetch" &&
        initiator !== "xmlhttprequest" &&
        initiator !== "beacon" &&
        initiator !== "navigation";
      const looksFailed =
        kind === undefined &&
        isSubResource &&
        transferSize === 0 &&
        (encodedBodySize === 0 || encodedBodySize === null) &&
        // A cached resource also has transferSize 0 but a NON-zero duration and a
        // non-zero decodedBodySize; a genuine failure typically has near-zero
        // duration. Guard on a short/zero duration to avoid flagging cache hits.
        (durationMs === null || durationMs <= 1);
      if (looksFailed) kind = "resource-load-failure";

      // statusText: we don't have it from Resource Timing; leave null.
      const entry: NetworkRequestEntry = {
        id: replayId(index),
        timestamp: Math.round(timeOrigin + startTime),
        url: redactUrl(rawUrl),
        // Resource Timing does not record the HTTP method. Sub-resource loads are
        // overwhelmingly GET; fetch/xhr-initiated entries we can't know, so GET is
        // the honest best-effort default. The `replayed` flag tells consumers the
        // method is inferred, not observed.
        method: "GET",
        status,
        statusText: null,
        durationMs:
          durationMs !== null
            ? Math.round(durationMs)
            : responseEnd !== null
              ? Math.round(responseEnd - startTime)
              : null,
        source: "resource-timing",
        kind,
        replayed: true,
        requestHeaders: {},
        responseHeaders: {},
        requestBody: null,
        requestBodyOriginalSize: null,
        requestBodyTruncated: false,
        // Resource Timing NEVER exposes the body — make that explicit rather than
        // emitting a misleading empty string.
        responseBody: "<not captured: reconstructed from Resource Timing>",
        responseBodyOriginalSize: null,
        responseBodyTruncated: false,
        responseContentType: null,
        // `errored` reflects transport failure. A resource-load-failure or a status
        // we couldn't read but that looks failed counts; a 4xx/5xx is an HTTP error
        // (status present), not a transport error, so errored stays false there.
        errored: kind === "resource-load-failure",
        errorMessage: kind === "resource-load-failure" ? "Resource failed to load" : null,
        initiatorPage: (() => {
          try {
            return window.location.href;
          } catch {
            return null;
          }
        })(),
      };
      out.push(entry);
    } catch {
      // swallow this one entry — never let a single malformed timing record abort
      // the whole replay.
    }
  }

  return out;
}
