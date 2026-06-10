/**
 * Unit tests for the byte-cap eviction used by POST /api/feedback validation.
 * Run with: node --import tsx --test lib/server/evictOldestUntilFits.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { evictOldestUntilFits } from "./evictOldestUntilFits";

function entryOfSize(id: number, bytes: number): { id: number; pad: string } {
  // JSON.stringify adds {"id":N,"pad":"…"} overhead; pad to roughly `bytes`.
  return { id, pad: "x".repeat(Math.max(0, bytes - 20)) };
}

test("under the cap: nothing evicted, order preserved", () => {
  const entries = [entryOfSize(1, 100), entryOfSize(2, 100)];
  const { kept, evicted } = evictOldestUntilFits(entries, 10_000);
  assert.equal(evicted, 0);
  assert.deepEqual(kept.map((e) => e.id), [1, 2]);
});

test("over the cap: evicts from the FRONT (oldest) until it fits", () => {
  const entries = [1, 2, 3, 4, 5].map((id) => entryOfSize(id, 1_000));
  const { kept, evicted } = evictOldestUntilFits(entries, 2_500);
  assert.equal(evicted, 3);
  assert.deepEqual(kept.map((e) => e.id), [4, 5]); // newest survive
  assert.ok(JSON.stringify(kept).length <= 2_500);
});

test("a single entry over the cap evicts everything rather than keeping an oversized doc", () => {
  const entries = [entryOfSize(1, 5_000)];
  const { kept, evicted } = evictOldestUntilFits(entries, 1_000);
  assert.equal(evicted, 1);
  assert.deepEqual(kept, []);
});

test("custom sizeOf is honored (used for the tagged console∪exception merge)", () => {
  const entries = [
    { stream: "log", entry: entryOfSize(1, 900) },
    { stream: "exc", entry: entryOfSize(2, 900) },
    { stream: "log", entry: entryOfSize(3, 900) },
  ];
  const { kept, evicted } = evictOldestUntilFits(entries, 2_000, (t) =>
    JSON.stringify(t.entry).length
  );
  assert.equal(evicted, 1);
  assert.deepEqual(kept.map((t) => t.entry.id), [2, 3]);
});

test("empty input is a no-op", () => {
  const { kept, evicted } = evictOldestUntilFits([], 100);
  assert.deepEqual(kept, []);
  assert.equal(evicted, 0);
});
