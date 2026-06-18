/**
 * Tests for the Layer 2 Resource Timing replay (buildResourceTimingReplay).
 *
 * Covers:
 *  - 4xx/5xx classification from responseStatus → kind http-4xx / http-5xx.
 *  - broken sub-resource heuristic (img/script/link with transferSize 0 + ~0
 *    duration) → kind resource-load-failure + errored:true.
 *  - the network denylist is applied (analytics host excluded).
 *  - dedup against the live URL set (a request already captured live is skipped).
 *  - dedup within the replay set (a URL appearing twice yields one entry).
 *  - replayed:true + source:"resource-timing" + no real response body.
 *  - never throws when performance is unavailable.
 *
 * Installs a minimal `performance` + `window.location` stub (Node has neither in
 * the shape we read). Run via: `npm run test:network`.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildResourceTimingReplay, normalizeForDedup } from "./resourceTiming.ts";

const HOST = "https://app.example.com";

type Entry = Record<string, unknown>;

function installPerf(resources: Entry[], navs: Entry[] = []): void {
  (globalThis as { window?: unknown }).window = {
    location: { href: `${HOST}/`, origin: HOST },
    origin: HOST,
  };
  (globalThis as { performance?: unknown }).performance = {
    timeOrigin: 1_000_000,
    getEntriesByType(type: string): Entry[] {
      if (type === "resource") return resources;
      if (type === "navigation") return navs;
      return [];
    },
  };
}

afterEach(() => {
  delete (globalThis as { performance?: unknown }).performance;
  delete (globalThis as { window?: unknown }).window;
});

describe("buildResourceTimingReplay — status classification", () => {
  beforeEach(() => {
    installPerf([
      { name: `${HOST}/api/a`, initiatorType: "fetch", startTime: 10, duration: 50, responseStatus: 200, transferSize: 500, encodedBodySize: 480 },
      { name: `${HOST}/api/b`, initiatorType: "fetch", startTime: 20, duration: 30, responseStatus: 404, transferSize: 120, encodedBodySize: 100 },
      { name: `${HOST}/api/c`, initiatorType: "xmlhttprequest", startTime: 30, duration: 80, responseStatus: 500, transferSize: 200, encodedBodySize: 180 },
    ]);
  });

  it("flags 4xx as http-4xx and 5xx as http-5xx, leaves 200 unmarked", () => {
    const out = buildResourceTimingReplay(new Set());
    const byUrl = new Map(out.map((e) => [e.url, e]));
    assert.equal(byUrl.get(`${HOST}/api/a`)?.kind, undefined);
    assert.equal(byUrl.get(`${HOST}/api/b`)?.kind, "http-4xx");
    assert.equal(byUrl.get(`${HOST}/api/c`)?.kind, "http-5xx");
    // 4xx/5xx are HTTP errors, not transport errors — errored stays false.
    assert.equal(byUrl.get(`${HOST}/api/b`)?.errored, false);
    assert.equal(byUrl.get(`${HOST}/api/c`)?.errored, false);
  });

  it("marks every entry replayed + source resource-timing + no real body", () => {
    const out = buildResourceTimingReplay(new Set());
    for (const e of out) {
      assert.equal(e.source, "resource-timing");
      assert.equal(e.replayed, true);
      assert.equal(e.method, "GET");
      assert.match(String(e.responseBody), /not captured/i);
    }
  });

  it("derives an epoch timestamp from timeOrigin + startTime", () => {
    const out = buildResourceTimingReplay(new Set());
    const a = out.find((e) => e.url === `${HOST}/api/a`);
    assert.equal(a?.timestamp, 1_000_000 + 10);
  });
});

describe("buildResourceTimingReplay — broken sub-resource heuristic", () => {
  it("flags a zero-byte, zero-duration img/script/link as resource-load-failure", () => {
    installPerf([
      // Broken image: no responseStatus, transferSize 0, encodedBodySize 0, ~0 duration.
      { name: `${HOST}/broken.png`, initiatorType: "img", startTime: 5, duration: 0, transferSize: 0, encodedBodySize: 0 },
      // A cached image (transferSize 0 but non-zero duration + body) must NOT be flagged.
      { name: `${HOST}/cached.png`, initiatorType: "img", startTime: 6, duration: 12, transferSize: 0, encodedBodySize: 900 },
      // A fetch with an empty 204 body must NOT be heuristically flagged (only element initiators).
      { name: `${HOST}/api/empty`, initiatorType: "fetch", startTime: 7, duration: 0, transferSize: 0, encodedBodySize: 0 },
    ]);
    const out = buildResourceTimingReplay(new Set());
    const byUrl = new Map(out.map((e) => [e.url, e]));
    assert.equal(byUrl.get(`${HOST}/broken.png`)?.kind, "resource-load-failure");
    assert.equal(byUrl.get(`${HOST}/broken.png`)?.errored, true);
    assert.equal(byUrl.get(`${HOST}/cached.png`)?.kind, undefined);
    assert.equal(byUrl.get(`${HOST}/api/empty`)?.kind, undefined);
  });
});

describe("buildResourceTimingReplay — filtering + dedup", () => {
  it("applies the network denylist (analytics host excluded)", () => {
    installPerf([
      { name: "https://www.google-analytics.com/collect?v=2", initiatorType: "img", startTime: 1, duration: 5, transferSize: 50 },
      { name: `${HOST}/keep`, initiatorType: "fetch", startTime: 2, duration: 5, responseStatus: 200, transferSize: 50, encodedBodySize: 40 },
    ]);
    const out = buildResourceTimingReplay(new Set());
    assert.equal(out.length, 1);
    assert.equal(out[0].url, `${HOST}/keep`);
  });

  it("skips a URL already captured live (dedup against liveUrls)", () => {
    installPerf([
      { name: `${HOST}/api/live`, initiatorType: "fetch", startTime: 1, duration: 5, responseStatus: 200, transferSize: 50, encodedBodySize: 40 },
      { name: `${HOST}/api/replayonly`, initiatorType: "fetch", startTime: 2, duration: 5, responseStatus: 200, transferSize: 50, encodedBodySize: 40 },
    ]);
    const live = new Set([normalizeForDedup(`${HOST}/api/live`)]);
    const out = buildResourceTimingReplay(live);
    assert.equal(out.length, 1);
    assert.equal(out[0].url, `${HOST}/api/replayonly`);
  });

  it("dedupes a URL appearing twice in the timing entries", () => {
    installPerf([
      { name: `${HOST}/twice`, initiatorType: "img", startTime: 1, duration: 5, transferSize: 50, encodedBodySize: 40 },
      { name: `${HOST}/twice`, initiatorType: "img", startTime: 9, duration: 5, transferSize: 50, encodedBodySize: 40 },
    ]);
    const out = buildResourceTimingReplay(new Set());
    assert.equal(out.length, 1);
  });
});

describe("buildResourceTimingReplay — robustness", () => {
  it("returns [] and never throws when performance is unavailable", () => {
    (globalThis as { window?: unknown }).window = { location: { href: `${HOST}/`, origin: HOST }, origin: HOST };
    delete (globalThis as { performance?: unknown }).performance;
    assert.deepEqual(buildResourceTimingReplay(new Set()), []);
  });

  it("skips a single malformed entry without aborting the rest", () => {
    installPerf([
      { /* no name */ initiatorType: "img", startTime: 1 },
      { name: `${HOST}/ok`, initiatorType: "fetch", startTime: 2, duration: 5, responseStatus: 200, transferSize: 50, encodedBodySize: 40 },
    ]);
    const out = buildResourceTimingReplay(new Set());
    assert.equal(out.length, 1);
    assert.equal(out[0].url, `${HOST}/ok`);
  });
});
