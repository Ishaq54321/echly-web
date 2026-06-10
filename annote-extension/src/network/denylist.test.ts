/**
 * Tests for the network-capture denylist module.
 *
 * Covers the GA4 proxied-beacon check (isProxiedAnalyticsBeacon) and its
 * interaction with isNetworkDenylisted's same-origin escape hatch:
 *  - a first-party-proxied GA4 beacon is DENIED even when same-origin, because
 *    the wire-format check runs BEFORE the escape.
 *  - a real first-party API call carrying neither / only one of the GA4 tokens
 *    is CAPTURED — the escape still wins.
 *  - classic cross-origin google-analytics.com is still denied via the host
 *    patterns (unaffected by the new check).
 *
 * The same-origin escape only runs when `window` is defined, so the cases that
 * exercise it install a minimal `window.location` stub (Node has no `window`).
 *
 * Run via: `npm run test:network`.
 */

import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isNetworkDenylisted, isProxiedAnalyticsBeacon } from "./denylist.ts";

// The host page we pretend to be running on for the same-origin cases. Any
// first-party URL below shares this origin, so the escape hatch would fire
// unless the GA4 check denies first.
const HOST_ORIGIN = "https://shop.example.com";

function setWindowOrigin(origin: string): void {
  (globalThis as { window?: unknown }).window = {
    location: { href: `${origin}/`, origin },
  };
}

function clearWindow(): void {
  delete (globalThis as { window?: unknown }).window;
}

afterEach(clearWindow);

describe("isProxiedAnalyticsBeacon()", () => {
  it("is true only when both v=2 and a G- tid are present", () => {
    const beacon = new URL(
      `${HOST_ORIGIN}/xa5e8f/ga/g/c?v=2&tid=G-PNX8D8QNBT&cid=123&en=page_view`,
    );
    assert.equal(isProxiedAnalyticsBeacon(beacon), true);
  });

  it("is false with only v=2 (no tid)", () => {
    assert.equal(
      isProxiedAnalyticsBeacon(new URL(`${HOST_ORIGIN}/api/orders?v=2`)),
      false,
    );
  });

  it("is false with only a G- tid (no v=2)", () => {
    assert.equal(
      isProxiedAnalyticsBeacon(new URL(`${HOST_ORIGIN}/track?tid=G-XXXX`)),
      false,
    );
  });

  it("is false when v has a non-2 value even with a G- tid", () => {
    assert.equal(
      isProxiedAnalyticsBeacon(new URL(`${HOST_ORIGIN}/c?v=1&tid=G-XXXX`)),
      false,
    );
  });

  it("is order-independent (tid before v)", () => {
    assert.equal(
      isProxiedAnalyticsBeacon(new URL(`${HOST_ORIGIN}/c?tid=G-ABC&v=2`)),
      true,
    );
  });
});

describe("isNetworkDenylisted() — proxied GA4 vs the same-origin escape", () => {
  it("denies a first-party-proxied GA4 beacon even when same-origin", () => {
    setWindowOrigin(HOST_ORIGIN);
    // Evidence URL shape: server-side GTM proxies the GA4 collect endpoint
    // under the host's own path, so it is same-origin and the escape would
    // normally let it through.
    const beacon = `${HOST_ORIGIN}/xa5e8f/ga/g/c?v=2&tid=G-PNX8D8QNBT&cid=987&en=page_view`;
    assert.equal(isNetworkDenylisted(beacon), true);
  });

  it("captures a real first-party API call with no GA4 tokens", () => {
    setWindowOrigin(HOST_ORIGIN);
    assert.equal(
      isNetworkDenylisted(`${HOST_ORIGIN}/api/orders?page=2`),
      false,
    );
  });

  it("captures a first-party API call with only v=2 (escape still wins)", () => {
    setWindowOrigin(HOST_ORIGIN);
    assert.equal(isNetworkDenylisted(`${HOST_ORIGIN}/api/orders?v=2`), false);
  });

  it("captures a first-party API call with only a G- tid (escape still wins)", () => {
    setWindowOrigin(HOST_ORIGIN);
    assert.equal(isNetworkDenylisted(`${HOST_ORIGIN}/track?tid=G-XYZ`), false);
  });
});

describe("isNetworkDenylisted() — extension-origin noise vs first-party capture", () => {
  it("denies a chrome-extension:// request (our widget's own traffic)", () => {
    setWindowOrigin(HOST_ORIGIN);
    assert.equal(
      isNetworkDenylisted("chrome-extension://abcdefghijklmnopabcdefghijklmnop/widget/widget.js"),
      true,
    );
  });

  it("denies a chrome-extension:// asset/chunk fetch even with no window context", () => {
    // No window → no same-origin escape; the scheme check alone must catch it.
    assert.equal(
      isNetworkDenylisted("chrome-extension://abcdefghijklmnopabcdefghijklmnop/assets/annote-logo-icon.svg"),
      true,
    );
  });

  it("denies a moz-extension:// request (Firefox widget origin)", () => {
    setWindowOrigin(HOST_ORIGIN);
    assert.equal(
      isNetworkDenylisted("moz-extension://11112222-3333-4444-5555-666677778888/widget/widget.js"),
      true,
    );
  });

  it("DOGFOODING: still captures same-origin page traffic on annote.ai", () => {
    // When a bug is filed ON annote.ai itself, the dashboard's own first-party
    // /api calls must STILL be captured — only the extension's chrome-extension://
    // noise is excluded. The scheme check targets the SCHEME, never the host.
    setWindowOrigin("https://annote.ai");
    assert.equal(isNetworkDenylisted("https://annote.ai/api/sessions"), false);
    assert.equal(isNetworkDenylisted("https://annote.ai/api/feedback/123/analyze"), false);
  });

  it("still captures a user's own first-party API calls on their site", () => {
    setWindowOrigin("https://customer-app.com");
    assert.equal(isNetworkDenylisted("https://customer-app.com/api/cart"), false);
  });
});

describe("isNetworkDenylisted() — classic third-party analytics", () => {
  it("still denies cross-origin google-analytics.com", () => {
    setWindowOrigin(HOST_ORIGIN);
    assert.equal(
      isNetworkDenylisted("https://www.google-analytics.com/g/collect?v=2&tid=G-ABC"),
      true,
    );
  });

  it("denies cross-origin GA even without any window context", () => {
    // No window → no same-origin escape; host patterns alone must catch it.
    assert.equal(
      isNetworkDenylisted("https://www.google-analytics.com/g/collect"),
      true,
    );
  });
});
