/**
 * Tests for the network ring buffer.
 *
 * Run via: `npm run test:network` (node:test + tsx).
 */

import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { NetworkBuffer } from "./buffer.ts";
import type { NetworkRequestEntry } from "./types.ts";

function makeEntry(overrides: Partial<NetworkRequestEntry> = {}): NetworkRequestEntry {
  return {
    id: overrides.id ?? "req-" + Math.random().toString(36).slice(2),
    timestamp: overrides.timestamp ?? Date.now(),
    url: "https://api.example.com/v1/items",
    method: "GET",
    status: 200,
    statusText: "OK",
    durationMs: 42,
    source: "fetch",
    requestHeaders: { "Content-Type": "application/json" },
    responseHeaders: { "Content-Type": "application/json" },
    requestBody: null,
    requestBodyOriginalSize: null,
    requestBodyTruncated: false,
    responseBody: '{"ok":true}',
    responseBodyOriginalSize: 11,
    responseBodyTruncated: false,
    responseContentType: "application/json",
    errored: false,
    errorMessage: null,
    initiatorPage: "https://app.example.com/dashboard",
    ...overrides,
  };
}

describe("NetworkBuffer — basic operations", () => {
  it("addRequest stores an entry retrievable via snapshot", () => {
    const buf = new NetworkBuffer();
    const entry = makeEntry({ id: "a" });
    buf.addRequest(entry);
    const snap = buf.snapshot();
    assert.equal(snap.requests.length, 1);
    assert.equal(snap.requests[0].id, "a");
  });

  it("clear empties the buffer", () => {
    const buf = new NetworkBuffer();
    buf.addRequest(makeEntry());
    buf.addRequest(makeEntry());
    buf.clear();
    assert.equal(buf.snapshot().requests.length, 0);
  });
});

describe("NetworkBuffer — count eviction", () => {
  it("addRequest beyond maxEntries evicts oldest", () => {
    const buf = new NetworkBuffer({ maxEntries: 3 });
    const t = Date.now();
    buf.addRequest(makeEntry({ id: "a", timestamp: t + 1 }));
    buf.addRequest(makeEntry({ id: "b", timestamp: t + 2 }));
    buf.addRequest(makeEntry({ id: "c", timestamp: t + 3 }));
    buf.addRequest(makeEntry({ id: "d", timestamp: t + 4 }));
    const ids = buf.snapshot().requests.map((r) => r.id);
    assert.deepEqual(ids, ["b", "c", "d"]);
  });
});

describe("NetworkBuffer — updateRequest", () => {
  it("patches a matching entry in place", () => {
    const buf = new NetworkBuffer();
    buf.addRequest(makeEntry({ id: "a", status: null, durationMs: null }));
    buf.updateRequest("a", { status: 201, durationMs: 17, responseBody: '{"new":true}' });
    const got = buf.snapshot().requests[0];
    assert.equal(got.status, 201);
    assert.equal(got.durationMs, 17);
    assert.equal(got.responseBody, '{"new":true}');
  });

  it("preserves id even if updates tries to rename it", () => {
    const buf = new NetworkBuffer();
    buf.addRequest(makeEntry({ id: "a" }));
    buf.updateRequest("a", { id: "evil-rename" } as Partial<NetworkRequestEntry>);
    assert.equal(buf.snapshot().requests[0].id, "a");
  });

  it("no-ops silently when the id is unknown", () => {
    const buf = new NetworkBuffer();
    buf.addRequest(makeEntry({ id: "a" }));
    // Must not throw, must not mutate state.
    assert.doesNotThrow(() => buf.updateRequest("does-not-exist", { status: 500 }));
    assert.equal(buf.snapshot().requests.length, 1);
    assert.equal(buf.snapshot().requests[0].id, "a");
  });
});

describe("NetworkBuffer — snapshot isolation", () => {
  it("returns a deep copy; mutating snapshot does not affect buffer", () => {
    const buf = new NetworkBuffer();
    buf.addRequest(makeEntry({ id: "a", responseBody: "original" }));
    const snap1 = buf.snapshot();
    snap1.requests[0].responseBody = "MUTATED";
    snap1.requests[0].requestHeaders["evil"] = "injected";
    snap1.requests.push(makeEntry({ id: "b" }));
    const snap2 = buf.snapshot();
    assert.equal(snap2.requests.length, 1);
    assert.equal(snap2.requests[0].responseBody, "original");
    assert.equal(snap2.requests[0].requestHeaders["evil"], undefined);
  });
});

describe("NetworkBuffer — age eviction", () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ["Date"], now: 1_000_000 });
  });
  afterEach(() => {
    mock.timers.reset();
  });

  it("snapshot prunes entries older than maxAgeMs", () => {
    const buf = new NetworkBuffer({ maxAgeMs: 60_000 });
    buf.addRequest(makeEntry({ id: "old", timestamp: Date.now() }));
    // Advance Date.now() past the cutoff.
    mock.timers.tick(120_000);
    buf.addRequest(makeEntry({ id: "fresh", timestamp: Date.now() }));
    const ids = buf.snapshot().requests.map((r) => r.id);
    assert.deepEqual(ids, ["fresh"]);
  });
});

describe("NetworkBuffer — byte-cap eviction", () => {
  it("evicts oldest entries once total bytes exceeds maxTotalBytes", () => {
    // Build a fat entry so a small cap is meaningful.
    const fatBody = "x".repeat(2_000);
    const buf = new NetworkBuffer({ maxTotalBytes: 5_000, maxEntries: 1_000 });
    const t = Date.now();
    buf.addRequest(makeEntry({ id: "a", timestamp: t + 1, responseBody: fatBody }));
    buf.addRequest(makeEntry({ id: "b", timestamp: t + 2, responseBody: fatBody }));
    buf.addRequest(makeEntry({ id: "c", timestamp: t + 3, responseBody: fatBody }));
    buf.addRequest(makeEntry({ id: "d", timestamp: t + 4, responseBody: fatBody }));
    const ids = buf.snapshot().requests.map((r) => r.id);
    // Oldest dropped first; "d" definitely survives.
    assert.ok(!ids.includes("a"), "oldest entry 'a' should be evicted");
    assert.ok(ids.includes("d"), "newest entry 'd' should survive");
  });
});
