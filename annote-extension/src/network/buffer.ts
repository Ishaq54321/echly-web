/**
 * Ring buffer for captured network requests.
 *
 * Holds entries from the current page session, evicting by age (entries older
 * than maxAgeMs), by count (oldest first beyond maxEntries), and by total byte
 * size (oldest first beyond maxTotalBytes). Per-body truncation is the
 * responsibility of the MAIN-world wrapper (Phase N2); the buffer only
 * enforces aggregate limits.
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
      const dropped = this.requests.shift()!;
      this.byteTotal -= entryBytes(dropped);
    }
    while (this.byteTotal > maxTotalBytes && this.requests.length > 0) {
      const dropped = this.requests.shift()!;
      this.byteTotal -= entryBytes(dropped);
    }
    if (this.byteTotal < 0) this.byteTotal = 0;
  }
}
