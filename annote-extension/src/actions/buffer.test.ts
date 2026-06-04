/**
 * Tests for the user-actions ring buffer.
 *
 * Run via: `npm run test:actions` (node:test + tsx).
 */

import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { ActionBuffer } from "./buffer.ts";
import type { UserAction } from "./types.ts";

function makeAction(overrides: Partial<UserAction> = {}): UserAction {
  return {
    id: overrides.id ?? "act-" + Math.random().toString(36).slice(2),
    type: "click",
    timestamp: Date.now(),
    element: {
      tag: "button",
      classes: ["btn", "btn-primary"],
      text: "Save",
    },
    ...overrides,
  };
}

describe("ActionBuffer — basic operations", () => {
  it("addAction stores an entry retrievable via snapshot", () => {
    const buf = new ActionBuffer();
    buf.addAction(makeAction({ id: "a" }));
    const snap = buf.snapshot();
    assert.equal(snap.actions.length, 1);
    assert.equal(snap.actions[0].id, "a");
    assert.equal(snap.count, 1);
  });

  it("snapshot shape includes actions, capturedAt, count", () => {
    const buf = new ActionBuffer();
    buf.addAction(makeAction());
    buf.addAction(makeAction());
    const snap = buf.snapshot();
    assert.equal(snap.actions.length, 2);
    assert.equal(snap.count, 2);
    assert.equal(typeof snap.capturedAt, "number");
  });

  it("clear empties the buffer", () => {
    const buf = new ActionBuffer();
    buf.addAction(makeAction());
    buf.addAction(makeAction());
    buf.clear();
    const snap = buf.snapshot();
    assert.equal(snap.actions.length, 0);
    assert.equal(snap.count, 0);
  });
});

describe("ActionBuffer — count eviction", () => {
  it("the 51st entry drops the 1st (default maxEntries=50)", () => {
    const buf = new ActionBuffer();
    const t = Date.now();
    for (let i = 0; i < 51; i++) {
      buf.addAction(makeAction({ id: `a${i}`, timestamp: t + i }));
    }
    const ids = buf.snapshot().actions.map((a) => a.id);
    assert.equal(ids.length, 50);
    assert.equal(ids[0], "a1"); // a0 evicted
    assert.equal(ids[ids.length - 1], "a50");
  });

  it("respects a custom maxEntries", () => {
    const buf = new ActionBuffer({ maxEntries: 3 });
    const t = Date.now();
    buf.addAction(makeAction({ id: "a", timestamp: t + 1 }));
    buf.addAction(makeAction({ id: "b", timestamp: t + 2 }));
    buf.addAction(makeAction({ id: "c", timestamp: t + 3 }));
    buf.addAction(makeAction({ id: "d", timestamp: t + 4 }));
    const ids = buf.snapshot().actions.map((a) => a.id);
    assert.deepEqual(ids, ["b", "c", "d"]);
  });
});

describe("ActionBuffer — age eviction", () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ["Date"], now: 1_000_000 });
  });
  afterEach(() => {
    mock.timers.reset();
  });

  it("entries older than maxAgeMs (300s default) are pruned at snapshot", () => {
    const buf = new ActionBuffer();
    buf.addAction(makeAction({ id: "old", timestamp: Date.now() }));
    // Advance past the 5-minute window.
    mock.timers.tick(301_000);
    buf.addAction(makeAction({ id: "fresh", timestamp: Date.now() }));
    const ids = buf.snapshot().actions.map((a) => a.id);
    assert.deepEqual(ids, ["fresh"]);
  });

  it("entries inside the window survive", () => {
    const buf = new ActionBuffer();
    buf.addAction(makeAction({ id: "a", timestamp: Date.now() }));
    mock.timers.tick(60_000);
    buf.addAction(makeAction({ id: "b", timestamp: Date.now() }));
    const ids = buf.snapshot().actions.map((a) => a.id);
    assert.deepEqual(ids, ["a", "b"]);
  });
});

describe("ActionBuffer — byte-cap eviction", () => {
  it("evicts oldest entries once total bytes exceeds maxTotalBytes", () => {
    // Build a fat entry so a small cap is meaningful.
    const fatText = "x".repeat(2_000);
    const buf = new ActionBuffer({ maxTotalBytes: 5_000, maxEntries: 1_000 });
    const t = Date.now();
    for (const id of ["a", "b", "c", "d"]) {
      buf.addAction(
        makeAction({
          id,
          timestamp: t + id.charCodeAt(0),
          element: { tag: "div", text: fatText },
        }),
      );
    }
    const ids = buf.snapshot().actions.map((a) => a.id);
    assert.ok(!ids.includes("a"), "oldest entry 'a' should be evicted");
    assert.ok(ids.includes("d"), "newest entry 'd' should survive");
  });
});

describe("ActionBuffer — snapshot isolation", () => {
  it("returns a deep copy; mutating snapshot does not affect buffer", () => {
    const buf = new ActionBuffer();
    buf.addAction(makeAction({ id: "a", element: { tag: "button", text: "Save" } }));
    const snap1 = buf.snapshot();
    snap1.actions[0].element!.text = "MUTATED";
    snap1.actions.push(makeAction({ id: "b" }));
    const snap2 = buf.snapshot();
    assert.equal(snap2.actions.length, 1);
    assert.equal(snap2.actions[0].element!.text, "Save");
  });
});
