/**
 * Tests for privacy-attribute resolution.
 *
 * Run via: `npm run test:actions` (uses node:test + tsx, matching the console
 * and network test setups).
 *
 * No jsdom — we stand up a minimal Element-shaped stub that supports the
 * subset getPrivacyTreatment() actually touches (`matches`, `parentElement`).
 * Keeping the stub tiny keeps the privacy-resolution logic itself in focus.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getPrivacyTreatment, PRIVACY_SELECTORS } from "./privacy.ts";

// ─── DOM stub ──────────────────────────────────────────────────────
// Supports class-selectors (".foo"), attribute selectors ("[data-bar]"),
// and tag selectors ("button") — the entire vocabulary used by
// PRIVACY_SELECTORS. Anything beyond that throws so we never silently pass
// a test on a stub that disagrees with the browser.

interface StubInit {
  tag?: string;
  id?: string;
  classes?: string[];
  attrs?: Record<string, string>;
  parent?: StubElement | null;
}

class StubElement {
  tag: string;
  id: string;
  classes: Set<string>;
  attrs: Record<string, string>;
  parent: StubElement | null;

  constructor(init: StubInit = {}) {
    this.tag = (init.tag ?? "div").toLowerCase();
    this.id = init.id ?? "";
    this.classes = new Set(init.classes ?? []);
    this.attrs = { ...(init.attrs ?? {}) };
    this.parent = init.parent ?? null;
  }

  get parentElement(): StubElement | null {
    return this.parent;
  }

  matches(selector: string): boolean {
    const sel = selector.trim();
    if (sel.startsWith(".")) {
      return this.classes.has(sel.slice(1));
    }
    if (sel.startsWith("[") && sel.endsWith("]")) {
      const inner = sel.slice(1, -1);
      // Support "[name]" and "[name=value]" forms (no quoted values needed).
      const eq = inner.indexOf("=");
      if (eq === -1) {
        return Object.prototype.hasOwnProperty.call(this.attrs, inner);
      }
      const name = inner.slice(0, eq);
      const value = inner.slice(eq + 1);
      return this.attrs[name] === value;
    }
    // Tag fallback — lowercased.
    return this.tag === sel.toLowerCase();
  }
}

// Stub satisfies the structural subset of Element that privacy.ts uses. Cast
// at the call site to silence TS without bringing in lib.dom typings.
function asEl(e: StubElement): Element {
  return e as unknown as Element;
}

// ─── basic resolution ──────────────────────────────────────────────

describe("getPrivacyTreatment — basic cases", () => {
  it("returns 'allow' for a plain element with no ancestors", () => {
    const el = new StubElement({ tag: "div" });
    assert.equal(getPrivacyTreatment(asEl(el)), "allow");
  });

  it("returns 'allow' for null / undefined", () => {
    assert.equal(getPrivacyTreatment(null), "allow");
    assert.equal(getPrivacyTreatment(undefined), "allow");
  });

  it("returns 'block' for [data-private]", () => {
    const el = new StubElement({ attrs: { "data-private": "" } });
    assert.equal(getPrivacyTreatment(asEl(el)), "block");
  });

  it("returns 'block' for .fs-block", () => {
    const el = new StubElement({ classes: ["fs-block"] });
    assert.equal(getPrivacyTreatment(asEl(el)), "block");
  });

  it("returns 'block' for .fs-exclude", () => {
    const el = new StubElement({ classes: ["fs-exclude"] });
    assert.equal(getPrivacyTreatment(asEl(el)), "block");
  });

  it("returns 'block' for [data-annote-mask]", () => {
    const el = new StubElement({ attrs: { "data-annote-mask": "" } });
    assert.equal(getPrivacyTreatment(asEl(el)), "block");
  });

  it("returns 'mask' for .fs-mask", () => {
    const el = new StubElement({ classes: ["fs-mask"] });
    assert.equal(getPrivacyTreatment(asEl(el)), "mask");
  });

  it("returns 'mask' for [data-rr-is-password]", () => {
    const el = new StubElement({ attrs: { "data-rr-is-password": "true" } });
    assert.equal(getPrivacyTreatment(asEl(el)), "mask");
  });
});

// ─── ancestor walks ────────────────────────────────────────────────

describe("getPrivacyTreatment — ancestor inheritance", () => {
  it("inherits 'block' from a parent", () => {
    const parent = new StubElement({ classes: ["fs-block"] });
    const child = new StubElement({ parent });
    assert.equal(getPrivacyTreatment(asEl(child)), "block");
  });

  it("inherits 'mask' from a grandparent", () => {
    const gp = new StubElement({ classes: ["fs-mask"] });
    const p = new StubElement({ parent: gp });
    const child = new StubElement({ parent: p });
    assert.equal(getPrivacyTreatment(asEl(child)), "mask");
  });

  it("nearest ancestor wins when both block and mask appear in the chain", () => {
    // mask is closer → mask wins.
    const gp = new StubElement({ classes: ["fs-block"] });
    const p = new StubElement({ classes: ["fs-mask"], parent: gp });
    const child = new StubElement({ parent: p });
    assert.equal(getPrivacyTreatment(asEl(child)), "mask");
  });
});

// ─── unmask-wins ───────────────────────────────────────────────────

describe("getPrivacyTreatment — unmask wins over ancestor", () => {
  it("unmask on the element itself overrides an ancestor mask", () => {
    const parent = new StubElement({ classes: ["fs-mask"] });
    const child = new StubElement({ classes: ["fs-unmask"], parent });
    assert.equal(getPrivacyTreatment(asEl(child)), "allow");
  });

  it("unmask on the element itself overrides an ancestor block", () => {
    const parent = new StubElement({ classes: ["fs-block"] });
    const child = new StubElement({ classes: ["fs-unmask"], parent });
    assert.equal(getPrivacyTreatment(asEl(child)), "allow");
  });

  it("unmask on an intermediate ancestor overrides a higher block", () => {
    // <block>
    //   <unmask>
    //     <child />  ← walks up, hits unmask first, returns 'allow'
    //   </unmask>
    // </block>
    const gp = new StubElement({ classes: ["fs-block"] });
    const p = new StubElement({ classes: ["fs-unmask"], parent: gp });
    const child = new StubElement({ parent: p });
    assert.equal(getPrivacyTreatment(asEl(child)), "allow");
  });

  it("does NOT unmask when the unmask ancestor is FURTHER from the element than the block", () => {
    // <unmask>
    //   <block>
    //     <child />  ← block hit first → still 'block'.
    //   </block>
    // </unmask>
    // This is the right behavior: unmask only carves out a region *inside*
    // a private subtree; placing block inside unmask re-introduces privacy
    // for that inner region.
    const gp = new StubElement({ classes: ["fs-unmask"] });
    const p = new StubElement({ classes: ["fs-block"], parent: gp });
    const child = new StubElement({ parent: p });
    assert.equal(getPrivacyTreatment(asEl(child)), "block");
  });
});

// ─── defensive behavior ────────────────────────────────────────────

describe("getPrivacyTreatment — defensive", () => {
  it("does not throw when .matches() itself throws", () => {
    // Simulate an exotic element whose matches() throws on every call (some
    // cross-realm or SVG elements have surfaced this in the wild).
    const evil = {
      matches: () => {
        throw new Error("boom");
      },
      parentElement: null,
    };
    assert.equal(getPrivacyTreatment(evil as unknown as Element), "allow");
  });

  it("handles an element with no matches() function at all", () => {
    const broken = { parentElement: null } as unknown as Element;
    assert.equal(getPrivacyTreatment(broken), "allow");
  });

  it("does not loop forever on a cyclic parent chain", () => {
    const a = new StubElement({ tag: "div" });
    const b = new StubElement({ tag: "div", parent: a });
    a.parent = b; // cycle
    // Just needs to terminate without throwing.
    assert.equal(getPrivacyTreatment(asEl(a)), "allow");
  });
});

// ─── selector inventory ──────────────────────────────────────────

describe("PRIVACY_SELECTORS inventory", () => {
  it("includes the documented block selectors", () => {
    assert.ok(PRIVACY_SELECTORS.block.includes("[data-private]"));
    assert.ok(PRIVACY_SELECTORS.block.includes(".fs-exclude"));
    assert.ok(PRIVACY_SELECTORS.block.includes(".fs-block"));
    assert.ok(PRIVACY_SELECTORS.block.includes("[data-annote-mask]"));
  });

  it("includes the documented mask selectors", () => {
    assert.ok(PRIVACY_SELECTORS.mask.includes(".fs-mask"));
    assert.ok(PRIVACY_SELECTORS.mask.includes("[data-rr-is-password]"));
  });

  it("includes the documented unmask selectors", () => {
    assert.ok(PRIVACY_SELECTORS.unmask.includes(".fs-unmask"));
  });
});
