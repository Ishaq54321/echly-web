/**
 * Tests for the console ring buffer — focused on the FAULT INVARIANT:
 * error-level logs and exceptions (faults) are never evicted to make room for
 * lower-severity noise (log/info/warn/debug), at either the count or byte cap.
 *
 * Run via: `npm run test:console` (node:test + tsx).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ConsoleBuffer } from "./buffer.ts";
import type { ConsoleLogEntry, ExceptionEntry } from "./types.ts";

// Recent base so the default 5-minute age window never expires the fixtures
// (offsets are tiny ms deltas, all well within maxAgeMs).
const T = Date.now();

function log(over: Partial<ConsoleLogEntry> & { timestamp: number }): ConsoleLogEntry {
  return { level: "log", message: "noise", ...over };
}
function exc(over: Partial<ExceptionEntry> & { timestamp: number }): ExceptionEntry {
  return { type: "error", message: "boom", ...over };
}

describe("ConsoleBuffer — basic operations", () => {
  it("stores logs and exceptions retrievable via snapshot", () => {
    const buf = new ConsoleBuffer();
    buf.addLog(log({ timestamp: T + 1, message: "hi" }));
    buf.addException(exc({ timestamp: T + 2, message: "kaboom" }));
    const snap = buf.snapshot();
    assert.equal(snap.logs.length, 1);
    assert.equal(snap.exceptions.length, 1);
  });
});

describe("ConsoleBuffer — fault invariant (count cap)", () => {
  it("an older console.error survives a flood of newer console.log", () => {
    const buf = new ConsoleBuffer({ maxEntries: 3 });
    // The real error arrives FIRST, then log noise floods past the count cap.
    buf.addLog(log({ timestamp: T + 1, level: "error", message: "TypeError: x" }));
    buf.addLog(log({ timestamp: T + 2, message: "n1" }));
    buf.addLog(log({ timestamp: T + 3, message: "n2" }));
    buf.addLog(log({ timestamp: T + 4, message: "n3" }));
    buf.addLog(log({ timestamp: T + 5, message: "n4" }));
    const msgs = buf.snapshot().logs.map((l) => l.message);
    assert.ok(msgs.includes("TypeError: x"), "the error must survive the log flood");
    assert.equal(msgs.length, 3, "count cap still bounds the logs stream to 3");
    assert.ok(!msgs.includes("n1"), "oldest noise evicted first");
  });

  it("the synthetic resource-load-failure (level error) is protected", () => {
    const buf = new ConsoleBuffer({ maxEntries: 2 });
    buf.addLog(
      log({ timestamp: T + 1, level: "error", kind: "resource-load-failure", message: "Failed to load resource: <img> /x.png" })
    );
    buf.addLog(log({ timestamp: T + 2, message: "n1" }));
    buf.addLog(log({ timestamp: T + 3, message: "n2" }));
    const msgs = buf.snapshot().logs.map((l) => l.message);
    assert.ok(msgs.some((m) => m.includes("Failed to load resource")));
  });
});

describe("ConsoleBuffer — fault invariant (cross-stream byte cap)", () => {
  it("a console.error is not evicted by a byte flood of console.log noise", () => {
    const fat = "x".repeat(1_500);
    const buf = new ConsoleBuffer({ maxTotalBytes: 6_000, maxEntries: 1_000, maxEntryBytes: 4_000 });
    buf.addLog(log({ timestamp: T + 1, level: "error", message: "REAL ERROR " + fat }));
    buf.addLog(log({ timestamp: T + 2, message: fat }));
    buf.addLog(log({ timestamp: T + 3, message: fat }));
    buf.addLog(log({ timestamp: T + 4, message: fat }));
    buf.addLog(log({ timestamp: T + 5, message: fat }));
    const errs = buf.snapshot().logs.filter((l) => l.level === "error");
    assert.equal(errs.length, 1, "the error survives the byte-cap eviction of noise");
  });

  it("exceptions (always faults) are not evicted by log noise under the byte cap", () => {
    const fat = "x".repeat(1_500);
    const buf = new ConsoleBuffer({ maxTotalBytes: 6_000, maxEntries: 1_000, maxEntryBytes: 4_000 });
    buf.addException(exc({ timestamp: T + 1, message: "UNCAUGHT " + fat }));
    buf.addLog(log({ timestamp: T + 2, message: fat }));
    buf.addLog(log({ timestamp: T + 3, message: fat }));
    buf.addLog(log({ timestamp: T + 4, message: fat }));
    buf.addLog(log({ timestamp: T + 5, message: fat }));
    assert.equal(buf.snapshot().exceptions.length, 1, "the exception survives the log flood");
  });

  it("byte cap still bounds an all-fault buffer (fault-vs-fault eviction)", () => {
    const fat = "x".repeat(1_500);
    const buf = new ConsoleBuffer({ maxTotalBytes: 4_000, maxEntries: 1_000, maxEntryBytes: 4_000 });
    buf.addLog(log({ timestamp: T + 1, level: "error", message: "e1 " + fat }));
    buf.addLog(log({ timestamp: T + 2, level: "error", message: "e2 " + fat }));
    buf.addLog(log({ timestamp: T + 3, level: "error", message: "e3 " + fat }));
    const msgs = buf.snapshot().logs.map((l) => l.message);
    assert.ok(msgs.some((m) => m.startsWith("e3")), "newest fault retained when all are faults");
    assert.ok(!msgs.some((m) => m.startsWith("e1")), "oldest fault evicted when no noise remains");
  });
});
