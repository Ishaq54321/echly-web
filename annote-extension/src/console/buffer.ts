/**
 * Ring buffer for captured console entries and exceptions.
 *
 * Holds entries from the current page session, evicting by age (oldest entries
 * older than maxAgeMs), by per-stream count, and by total bytes. Logs and
 * exceptions are tracked as separate streams so a flood of one cannot starve
 * the other.
 *
 * Severity-tiered eviction (fault invariant): the COUNT and BYTE caps evict the
 * oldest NOISE entry first and only fall back to evicting a fault once no noise
 * remains. A "fault" is an error-level console entry (including the synthetic
 * resource-load-failure, which is recorded at level "error") or ANY exception
 * (every uncaught error/rejection). So a burst of console.log can no longer
 * evict an older console.error, and the caps stay the same size — faults are
 * preferentially RETAINED within the existing budget, not granted a bigger one.
 * Fault-vs-fault eviction (oldest fault dropped only when the buffer is all
 * faults and still over a cap) is permitted; fault-vs-noise is not.
 *
 * Single-threaded by virtue of the JS event loop; no locking needed.
 */

import type { ConsoleLogEntry, ConsoleSnapshot, ExceptionEntry } from "./types";

/**
 * Fault tier for a console log entry: error-level entries (the synthetic
 * resource-load-failure is emitted at level "error", so it's covered). Protected
 * from eviction by lower-severity noise. Exceptions are always faults and need
 * no predicate.
 */
function isFaultLog(entry: ConsoleLogEntry): boolean {
  return entry.level === "error";
}

export interface ConsoleBufferOptions {
  maxAgeMs?: number;
  maxEntries?: number;
  maxEntryBytes?: number;
  maxTotalBytes?: number;
}

const DEFAULTS: Required<ConsoleBufferOptions> = {
  maxAgeMs: 300_000, // 5 minutes
  maxEntries: 50,
  maxEntryBytes: 2_048, // 2 KB per entry
  maxTotalBytes: 51_200, // 50 KB total across logs + exceptions
};

// JSON.stringify byte counter. UTF-8 byte length is approximated as
// `string.length` for ASCII and grows beyond that for multi-byte chars; we
// use Blob if available for accuracy, falling back to a 2x multiplier ceiling.
function byteLength(s: string): number {
  if (typeof Blob !== "undefined") {
    try {
      return new Blob([s]).size;
    } catch {
      // fall through
    }
  }
  // Conservative fallback: assume up to 4 bytes per char (worst case UTF-8).
  // We'd rather over-count and evict slightly early than under-count and ship.
  return s.length * 4;
}

function truncate(s: string, maxBytes: number): string {
  if (byteLength(s) <= maxBytes) return s;
  // Binary search on char length, since byte length is monotone in char length
  // for any given string.
  let lo = 0;
  let hi = s.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (byteLength(s.slice(0, mid)) + 1 /* trailing … */ <= maxBytes) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return s.slice(0, lo) + "…";
}

function entryBytes(entry: ConsoleLogEntry | ExceptionEntry): number {
  try {
    return byteLength(JSON.stringify(entry));
  } catch {
    return 0;
  }
}

export class ConsoleBuffer {
  private readonly opts: Required<ConsoleBufferOptions>;
  private logs: ConsoleLogEntry[] = [];
  private exceptions: ExceptionEntry[] = [];
  private logBytes = 0;
  private exceptionBytes = 0;

  constructor(opts: ConsoleBufferOptions = {}) {
    this.opts = { ...DEFAULTS, ...opts };
  }

  addLog(entry: ConsoleLogEntry): void {
    const sized = this.fitLogEntry(entry);
    this.logs.push(sized);
    this.logBytes += entryBytes(sized);
    this.evictExpired();
    this.enforceLimits();
  }

  addException(entry: ExceptionEntry): void {
    const sized = this.fitExceptionEntry(entry);
    this.exceptions.push(sized);
    this.exceptionBytes += entryBytes(sized);
    this.evictExpired();
    this.enforceLimits();
  }

  snapshot(): ConsoleSnapshot {
    this.evictExpired();
    return {
      logs: this.logs.slice(),
      exceptions: this.exceptions.slice(),
      capturedAt: Date.now(),
    };
  }

  clear(): void {
    this.logs = [];
    this.exceptions = [];
    this.logBytes = 0;
    this.exceptionBytes = 0;
  }

  // ─── private ────────────────────────────────────────────────────

  private fitLogEntry(entry: ConsoleLogEntry): ConsoleLogEntry {
    const { maxEntryBytes } = this.opts;
    if (entryBytes(entry) <= maxEntryBytes) return entry;
    // Truncate message first, then args proportionally. Both get an ellipsis
    // tail so consumers can see something was clipped.
    const trimmedMessage = truncate(entry.message, Math.floor(maxEntryBytes * 0.6));
    const argBudget = Math.max(0, maxEntryBytes - byteLength(trimmedMessage) - 128);
    const argSlice = entry.args ? entry.args.map((a) => truncate(a, Math.max(64, Math.floor(argBudget / entry.args!.length)))) : entry.args;
    return { ...entry, message: trimmedMessage, args: argSlice };
  }

  private fitExceptionEntry(entry: ExceptionEntry): ExceptionEntry {
    const { maxEntryBytes } = this.opts;
    if (entryBytes(entry) <= maxEntryBytes) return entry;
    const trimmedMessage = truncate(entry.message, Math.floor(maxEntryBytes * 0.4));
    const trimmedStack = entry.stack ? truncate(entry.stack, Math.floor(maxEntryBytes * 0.5)) : entry.stack;
    return { ...entry, message: trimmedMessage, stack: trimmedStack };
  }

  private evictExpired(): void {
    const cutoff = Date.now() - this.opts.maxAgeMs;
    while (this.logs.length > 0 && this.logs[0].timestamp < cutoff) {
      const dropped = this.logs.shift()!;
      this.logBytes -= entryBytes(dropped);
    }
    while (this.exceptions.length > 0 && this.exceptions[0].timestamp < cutoff) {
      const dropped = this.exceptions.shift()!;
      this.exceptionBytes -= entryBytes(dropped);
    }
    if (this.logBytes < 0) this.logBytes = 0;
    if (this.exceptionBytes < 0) this.exceptionBytes = 0;
  }

  private enforceLimits(): void {
    const { maxEntries, maxTotalBytes } = this.opts;
    // Per-stream count cap. Entries are timestamp-ascending (push order), so the
    // first matching entry is the oldest. Drop the oldest NOISE log first; only
    // drop a fault (error-level) when the stream is all faults and still over
    // count. Exceptions are all faults, so this is plain oldest-first there.
    while (this.logs.length > maxEntries) {
      const idx = this.logs.findIndex((e) => !isFaultLog(e));
      const dropped = this.logs.splice(idx === -1 ? 0 : idx, 1)[0];
      this.logBytes -= entryBytes(dropped);
    }
    while (this.exceptions.length > maxEntries) {
      const dropped = this.exceptions.shift()!;
      this.exceptionBytes -= entryBytes(dropped);
    }
    // Cross-stream byte cap. Evict the oldest NOISE entry across both streams
    // until under; only once no noise remains do we drop the oldest fault. This
    // stops a console.log flood (or any non-error noise) from evicting an older
    // console.error / exception while the buffer is over its byte budget.
    while (this.logBytes + this.exceptionBytes > maxTotalBytes) {
      if (!this.evictOldestPreferNoise()) break;
    }
    if (this.logBytes < 0) this.logBytes = 0;
    if (this.exceptionBytes < 0) this.exceptionBytes = 0;
  }

  /**
   * Remove a single entry for the byte cap, preferring noise over faults.
   * Picks the oldest noise log if one exists; otherwise the oldest fault across
   * both streams (logs ∪ exceptions) by timestamp. Returns false when both
   * streams are empty. Exceptions carry no noise, so noise can only come from
   * the logs stream.
   */
  private evictOldestPreferNoise(): boolean {
    const noiseIdx = this.logs.findIndex((e) => !isFaultLog(e));
    if (noiseIdx !== -1) {
      const dropped = this.logs.splice(noiseIdx, 1)[0];
      this.logBytes -= entryBytes(dropped);
      return true;
    }
    // No noise anywhere — drop the oldest FAULT across both streams.
    const oldestLog = this.logs[0];
    const oldestException = this.exceptions[0];
    if (!oldestLog && !oldestException) return false;
    const dropLog =
      oldestLog && (!oldestException || oldestLog.timestamp <= oldestException.timestamp);
    if (dropLog) {
      const dropped = this.logs.shift()!;
      this.logBytes -= entryBytes(dropped);
    } else {
      const dropped = this.exceptions.shift()!;
      this.exceptionBytes -= entryBytes(dropped);
    }
    return true;
  }
}
