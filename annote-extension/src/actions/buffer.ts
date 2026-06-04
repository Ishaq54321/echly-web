/**
 * Ring buffer for captured user actions.
 *
 * Holds actions from the current page session, evicting by age (entries
 * older than maxAgeMs), by count (oldest first beyond maxEntries), and by
 * total byte size (oldest first beyond maxTotalBytes).
 *
 * Eviction policy and snapshot semantics match `../network/buffer.ts` (and,
 * by extension, `../console/buffer.ts`) so all three capture streams share a
 * single mental model. The only difference vs network is that actions are
 * append-only — there is no `updateRequest`-equivalent, because an action is
 * always known fully at the moment it's captured.
 *
 * Single-threaded by virtue of the JS event loop; no locking needed.
 */

import type { ActionsSnapshot, UserAction } from "./types";

export interface ActionBufferOptions {
  maxAgeMs?: number;
  maxEntries?: number;
  maxTotalBytes?: number;
}

const DEFAULTS: Required<ActionBufferOptions> = {
  maxAgeMs: 300_000, // 5 minutes — same window as console / network buffers.
  maxEntries: 50,
  // Actions are smaller than network entries (no headers/bodies) but larger
  // than console entries (carry an ElementDescriptor). 50 KB roughly matches
  // the console buffer's aggregate cap and is plenty for 50 entries.
  maxTotalBytes: 51_200,
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

function entryBytes(entry: UserAction): number {
  try {
    return byteLength(JSON.stringify(entry));
  } catch {
    return 0;
  }
}

function cloneEntry(entry: UserAction): UserAction {
  // Defensive deep copy via JSON round-trip. Actions are plain data; avoids
  // structuredClone for compatibility with older test runners (parallels
  // network/buffer.ts).
  return JSON.parse(JSON.stringify(entry)) as UserAction;
}

export class ActionBuffer {
  private readonly opts: Required<ActionBufferOptions>;
  private actions: UserAction[] = [];
  private byteTotal = 0;

  constructor(opts: ActionBufferOptions = {}) {
    this.opts = { ...DEFAULTS, ...opts };
  }

  addAction(entry: UserAction): void {
    this.actions.push(entry);
    this.byteTotal += entryBytes(entry);
    this.evictExpired();
    this.enforceLimits();
  }

  snapshot(): ActionsSnapshot {
    this.evictExpired();
    const cloned = this.actions.map(cloneEntry);
    return {
      actions: cloned,
      capturedAt: Date.now(),
      count: cloned.length,
    };
  }

  clear(): void {
    this.actions = [];
    this.byteTotal = 0;
  }

  // ─── private ────────────────────────────────────────────────────

  private evictExpired(): void {
    const cutoff = Date.now() - this.opts.maxAgeMs;
    while (this.actions.length > 0 && this.actions[0].timestamp < cutoff) {
      const dropped = this.actions.shift()!;
      this.byteTotal -= entryBytes(dropped);
    }
    if (this.byteTotal < 0) this.byteTotal = 0;
  }

  private enforceLimits(): void {
    const { maxEntries, maxTotalBytes } = this.opts;
    while (this.actions.length > maxEntries) {
      const dropped = this.actions.shift()!;
      this.byteTotal -= entryBytes(dropped);
    }
    while (this.byteTotal > maxTotalBytes && this.actions.length > 0) {
      const dropped = this.actions.shift()!;
      this.byteTotal -= entryBytes(dropped);
    }
    if (this.byteTotal < 0) this.byteTotal = 0;
  }
}
