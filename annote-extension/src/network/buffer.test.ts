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

describe("NetworkBuffer — fault invariant (severity-tiered eviction)", () => {
  it("count cap: an older 500 survives a flood of newer 200s", () => {
    const buf = new NetworkBuffer({ maxEntries: 3 });
    const t = Date.now();
    // The real fault arrives FIRST, then noise floods past the count cap.
    buf.addRequest(makeEntry({ id: "fault", timestamp: t + 1, status: 500 }));
    buf.addRequest(makeEntry({ id: "n1", timestamp: t + 2, status: 200 }));
    buf.addRequest(makeEntry({ id: "n2", timestamp: t + 3, status: 200 }));
    buf.addRequest(makeEntry({ id: "n3", timestamp: t + 4, status: 200 }));
    buf.addRequest(makeEntry({ id: "n4", timestamp: t + 5, status: 200 }));
    const ids = buf.snapshot().requests.map((r) => r.id);
    assert.ok(ids.includes("fault"), "the 500 must survive the noise flood");
    assert.equal(ids.length, 3, "count cap still bounds the buffer to 3");
    // Oldest NOISE evicted first — the earliest 200s go, not the fault.
    assert.ok(!ids.includes("n1"));
    assert.ok(!ids.includes("n2"));
  });

  it("byte cap: an older errored request survives a byte flood of 200s", () => {
    const fatBody = "x".repeat(2_000);
    const buf = new NetworkBuffer({ maxTotalBytes: 5_000, maxEntries: 1_000 });
    const t = Date.now();
    buf.addRequest(
      makeEntry({ id: "fault", timestamp: t + 1, status: null, errored: true, responseBody: fatBody })
    );
    buf.addRequest(makeEntry({ id: "n1", timestamp: t + 2, responseBody: fatBody }));
    buf.addRequest(makeEntry({ id: "n2", timestamp: t + 3, responseBody: fatBody }));
    buf.addRequest(makeEntry({ id: "n3", timestamp: t + 4, responseBody: fatBody }));
    const ids = buf.snapshot().requests.map((r) => r.id);
    assert.ok(ids.includes("fault"), "the errored request must survive the byte flood");
  });

  it("a request that BECOMES a fault on update is then protected from eviction", () => {
    const buf = new NetworkBuffer({ maxEntries: 3 });
    const t = Date.now();
    buf.addRequest(makeEntry({ id: "pending", timestamp: t + 1, status: null, durationMs: null }));
    // Promote to a 500 — now a fault.
    buf.updateRequest("pending", { status: 500, durationMs: 30 });
    buf.addRequest(makeEntry({ id: "n1", timestamp: t + 2 }));
    buf.addRequest(makeEntry({ id: "n2", timestamp: t + 3 }));
    buf.addRequest(makeEntry({ id: "n3", timestamp: t + 4 }));
    const ids = buf.snapshot().requests.map((r) => r.id);
    assert.ok(ids.includes("pending"), "the promoted 500 must survive once it's a fault");
  });

  it("a kind-only failure (status null, http-5xx) is treated as a fault", () => {
    const buf = new NetworkBuffer({ maxEntries: 2 });
    const t = Date.now();
    buf.addRequest(
      makeEntry({ id: "replay-5xx", timestamp: t + 1, status: null, kind: "http-5xx", source: "resource-timing", replayed: true })
    );
    buf.addRequest(makeEntry({ id: "n1", timestamp: t + 2 }));
    buf.addRequest(makeEntry({ id: "n2", timestamp: t + 3 }));
    const ids = buf.snapshot().requests.map((r) => r.id);
    assert.ok(ids.includes("replay-5xx"), "a replayed 5xx with null status must be protected");
  });

  it("all-fault buffer still bounds by count (fault-vs-fault eviction permitted)", () => {
    const buf = new NetworkBuffer({ maxEntries: 2 });
    const t = Date.now();
    buf.addRequest(makeEntry({ id: "f1", timestamp: t + 1, status: 500 }));
    buf.addRequest(makeEntry({ id: "f2", timestamp: t + 2, status: 503 }));
    buf.addRequest(makeEntry({ id: "f3", timestamp: t + 3, status: 404 }));
    const ids = buf.snapshot().requests.map((r) => r.id);
    assert.equal(ids.length, 2, "count cap holds even when every entry is a fault");
    assert.ok(!ids.includes("f1"), "oldest fault evicted when no noise remains");
    assert.ok(ids.includes("f3"), "newest fault retained");
  });
});
