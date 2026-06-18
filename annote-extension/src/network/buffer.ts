/**
 * Ring buffer for captured network requests.
 *
 * Holds entries from the current page session, evicting by age (entries older
 * than maxAgeMs), by count (beyond maxEntries), and by total byte size (beyond
 * maxTotalBytes). Per-body truncation is the responsibility of the MAIN-world
 * wrapper (Phase N2); the buffer only enforces aggregate limits.
 *
 * Severity-tiered eviction (fault invariant): the COUNT and BYTE caps evict the
 * oldest NOISE request first and only fall back to evicting a fault once no
 * noise remains. A "fault" is a transport error (`errored`), an HTTP >= 400
 * status, or a request whose status is 0/null but carries a failure `kind`
 * (resource-load-failure / http-4xx / http-5xx from the Resource-Timing replay).
 * So an analytics burst (Segment/Datadog/etc., or any first-party 2xx noise the
 * denylist exempts) can no longer evict an older real 500. The caps stay the
 * same size — faults are preferentially RETAINED within the budget, not granted
 * a bigger one. Faults become faults at response time (a pending request is
 * noise until its status lands), and enforceLimits re-runs on every addRequest
 * AND updateRequest, so the tier is always re-evaluated against current status.
 *
 * Requests are typically inserted at request-start (`addRequest`) and then
 * patched at response-time (`updateRequest`) to fill in status, duration, and
 * response body. `updateRequest` no-ops silently if the request has already
 * been evicted — that's a real race when a slow response lands after the
 * buffer has rolled past it.
 *
 * Single-threaded by virtue of the JS event loop; no locking needed.
 */

import type { NetworkRequestEntry, NetworkSnapshot } from "./types";

/**
 * Fault tier for a network request: transport error, HTTP >= 400, or a 0/null
 * status carrying a failure `kind`. Protected from eviction by lower-severity
 * (2xx / analytics / pending) noise.
 */
function isFaultRequest(entry: NetworkRequestEntry): boolean {
  if (entry.errored === true) return true;
  if (typeof entry.status === "number" && entry.status >= 400) return true;
  return (
    entry.kind === "resource-load-failure" ||
    entry.kind === "http-4xx" ||
    entry.kind === "http-5xx"
  );
}

export interface NetworkBufferOptions {
  maxAgeMs?: number;
  maxEntries?: number;
  maxTotalBytes?: number;
}

const DEFAULTS: Required<NetworkBufferOptions> = {
  maxAgeMs: 300_000, // 5 minutes
  maxEntries: 50,
  maxTotalBytes: 102_400, // 100 KB — network entries are larger than console entries
};

function byteLength(s: string): number {
  if (typeof Blob !== "undefined") {
    try {
      return new Blob([s]).size;
    } catch {
      // fall through
    }
  }
  // Conservative fallback — over-count rather than under-count.
  return s.length * 4;
}

function entryBytes(entry: NetworkRequestEntry): number {
  try {
    return byteLength(JSON.stringify(entry));
  } catch {
    return 0;
  }
}

function cloneEntry(entry: NetworkRequestEntry): NetworkRequestEntry {
  // Defensive deep copy via JSON round-trip. Network entries are plain data
  // (strings, numbers, booleans, header maps) so this is safe and cheap.
  // Avoids `structuredClone` for compatibility with older test runners.
  return JSON.parse(JSON.stringify(entry)) as NetworkRequestEntry;
}

export class NetworkBuffer {
  private readonly opts: Required<NetworkBufferOptions>;
  private requests: NetworkRequestEntry[] = [];
  private byteTotal = 0;

  constructor(opts: NetworkBufferOptions = {}) {
    this.opts = { ...DEFAULTS, ...opts };
  }

  addRequest(entry: NetworkRequestEntry): void {
    this.requests.push(entry);
    this.byteTotal += entryBytes(entry);
    this.evictExpired();
    this.enforceLimits();
  }

  updateRequest(id: string, updates: Partial<NetworkRequestEntry>): void {
    const idx = this.requests.findIndex((r) => r.id === id);
    if (idx === -1) {
      // Already evicted — silently no-op. Slow responses that land after the
      // buffer has rolled past their start are a real race; throwing here
      // would crash the MAIN-world wrapper.
      return;
    }
    const prev = this.requests[idx];
    const prevBytes = entryBytes(prev);
    // Spread; `id` is forced back to the original to prevent accidental rename.
    const next: NetworkRequestEntry = { ...prev, ...updates, id: prev.id };
    this.requests[idx] = next;
    this.byteTotal += entryBytes(next) - prevBytes;
    if (this.byteTotal < 0) this.byteTotal = 0;
    this.enforceLimits();
  }

  snapshot(): NetworkSnapshot {
    this.evictExpired();
    return {
      requests: this.requests.map(cloneEntry),
      capturedAt: Date.now(),
    };
  }

  /**
   * Snapshot of the URLs currently in the buffer that were captured LIVE (fetch/
   * xhr/beacon — i.e. NOT already-replayed entries). Used by the Layer 2 Resource
   * Timing replay to dedup: a request observed live must not be re-added from
   * Resource Timing. The caller normalizes both sides identically (the replay
   * module owns the normalization), so we hand back the raw stored URLs and let it
   * normalize — keeping a single source of truth for normalization.
   */
  liveUrls(): Set<string> {
    const out = new Set<string>();
    for (const r of this.requests) {
      if (r.replayed === true) continue;
      out.add(r.url);
    }
    return out;
  }

  clear(): void {
    this.requests = [];
    this.byteTotal = 0;
  }

  // ─── private ────────────────────────────────────────────────────

  private evictExpired(): void {
    const cutoff = Date.now() - this.opts.maxAgeMs;
    while (this.requests.length > 0 && this.requests[0].timestamp < cutoff) {
      const dropped = this.requests.shift()!;
      this.byteTotal -= entryBytes(dropped);
    }
    if (this.byteTotal < 0) this.byteTotal = 0;
  }

  private enforceLimits(): void {
    const { maxEntries, maxTotalBytes } = this.opts;
    while (this.requests.length > maxEntries) {
      if (!this.evictOldestPreferNoise()) break;
    }
    while (this.byteTotal > maxTotalBytes && this.requests.length > 0) {
      if (!this.evictOldestPreferNoise()) break;
    }
    if (this.byteTotal < 0) this.byteTotal = 0;
  }

  /**
   * Remove a single request, preferring noise over faults. Entries are
   * timestamp-ascending (push order), so the first non-fault is the oldest
   * noise request; if every request is a fault we drop the oldest fault
   * (fault-vs-fault is permitted). Returns false when the buffer is empty.
   */
  private evictOldestPreferNoise(): boolean {
    if (this.requests.length === 0) return false;
    let idx = this.requests.findIndex((r) => !isFaultRequest(r));
    if (idx === -1) idx = 0; // all faults → drop the oldest fault
    const dropped = this.requests.splice(idx, 1)[0];
    this.byteTotal -= entryBytes(dropped);
    return true;
  }
}
