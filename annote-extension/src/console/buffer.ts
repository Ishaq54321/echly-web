/**
 * Ring buffer for captured console entries and exceptions.
 *
 * Holds entries from the current page session, evicting by age (oldest entries
 * older than maxAgeMs) and by size (oldest first, until total bytes fit). Logs
 * and exceptions share the same eviction policy but are tracked as separate
 * streams so a flood of one cannot starve the other.
 *
 * Single-threaded by virtue of the JS event loop; no locking needed.
 */

import type { ConsoleLogEntry, ConsoleSnapshot, ExceptionEntry } from "./types";

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
    while (this.logs.length > maxEntries) {
      const dropped = this.logs.shift()!;
      this.logBytes -= entryBytes(dropped);
    }
    while (this.exceptions.length > maxEntries) {
      const dropped = this.exceptions.shift()!;
      this.exceptionBytes -= entryBytes(dropped);
    }
    // Cross-stream byte cap: drop oldest entry across both streams until under.
    while (this.logBytes + this.exceptionBytes > maxTotalBytes) {
      const oldestLog = this.logs[0];
      const oldestException = this.exceptions[0];
      if (!oldestLog && !oldestException) break;
      const dropLog =
        oldestLog && (!oldestException || oldestLog.timestamp <= oldestException.timestamp);
      if (dropLog) {
        const dropped = this.logs.shift()!;
        this.logBytes -= entryBytes(dropped);
      } else {
        const dropped = this.exceptions.shift()!;
        this.exceptionBytes -= entryBytes(dropped);
      }
    }
    if (this.logBytes < 0) this.logBytes = 0;
    if (this.exceptionBytes < 0) this.exceptionBytes = 0;
  }
}
