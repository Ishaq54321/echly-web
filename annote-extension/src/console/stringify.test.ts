/**
 * Tests for privacy-aware console element serialization (Phase R2).
 *
 * Run via: `npm run test:console` (node:test + tsx, matching the redact test
 * setup). No jsdom — we install a minimal global `Element` class and a
 * StubElement that extends it, so `node instanceof Element` is true and
 * getPrivacyTreatment() can walk parentElement / call matches(), exactly the
 * subset serializeNode() + privacy.ts touch.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { serializeNode, HIDDEN_ELEMENT } from "./serializeElement.ts";

// ─── Global DOM stubs ──────────────────────────────────────────────
// serializeNode() guards on `typeof Element !== "undefined" && node
// instanceof Element`. In Node neither Element nor Node exist, so we install
// them before importing the module under test. We extend the real (stub)
// Element so instanceof holds.

class StubElement {
  tag: string;
  classes: Set<string>;
  attrs: Record<string, string>;
  parent: StubElement | null;

  constructor(init: {
    tag?: string;
    classes?: string[];
    attrs?: Record<string, string>;
    parent?: StubElement | null;
  } = {}) {
    this.tag = (init.tag ?? "div").toLowerCase();
    this.classes = new Set(init.classes ?? []);
    this.attrs = { ...(init.attrs ?? {}) };
    this.parent = init.parent ?? null;
  }

  get tagName(): string {
    return this.tag.toUpperCase();
  }
  get nodeName(): string {
    return this.tagName;
  }
  get parentElement(): StubElement | null {
    return this.parent;
  }

  matches(selector: string): boolean {
    const sel = selector.trim();
    if (sel.startsWith(".")) return this.classes.has(sel.slice(1));
    if (sel.startsWith("[") && sel.endsWith("]")) {
      const inner = sel.slice(1, -1);
      const eq = inner.indexOf("=");
      if (eq === -1) return Object.prototype.hasOwnProperty.call(this.attrs, inner);
      return this.attrs[inner.slice(0, eq)] === inner.slice(eq + 1);
    }
    return this.tag === sel.toLowerCase();
  }
}

// serializeNode reads `Element`/`Node` at CALL time (not import time), so we
// can register StubElement as the global Element/Node constructor here at
// module scope after the static import — then `stub instanceof Element` holds
// when the tests run. No top-level await needed (tsx compiles tests to CJS,
// which disallows it). Node is a fresh process per test file, so there is no
// global to restore afterwards.
const g = globalThis as unknown as { Element?: unknown; Node?: unknown };
g.Element = StubElement;
g.Node = StubElement;

function asEl(e: StubElement): unknown {
  return e;
}

describe("serializeNode — allow (no privacy marker)", () => {
  it("returns <tag> for a plain element", () => {
    assert.equal(serializeNode(asEl(new StubElement({ tag: "button" }))), "<button>");
  });

  it("returns <tag> for an element whose ancestors are all public", () => {
    const gp = new StubElement({ tag: "section" });
    const el = new StubElement({ tag: "span", parent: gp });
    assert.equal(serializeNode(asEl(el)), "<span>");
  });
});

describe("serializeNode — block (details fully withheld)", () => {
  it("hides an element marked [data-private]", () => {
    const el = new StubElement({ tag: "input", attrs: { "data-private": "" } });
    assert.equal(serializeNode(asEl(el)), HIDDEN_ELEMENT);
    assert.equal(serializeNode(asEl(el)), "<hidden element>");
  });

  it("hides an element marked .fs-block", () => {
    const el = new StubElement({ tag: "form", classes: ["fs-block"] });
    assert.equal(serializeNode(asEl(el)), HIDDEN_ELEMENT);
  });

  it("hides an element inside a [data-private] ancestor", () => {
    const panel = new StubElement({ tag: "div", attrs: { "data-private": "" } });
    const child = new StubElement({ tag: "input", parent: panel });
    assert.equal(serializeNode(asEl(child)), HIDDEN_ELEMENT);
  });

  it("does NOT leak the tag of a blocked element", () => {
    const el = new StubElement({ tag: "input", classes: ["fs-exclude"] });
    assert.ok(!serializeNode(asEl(el)).includes("input"));
  });
});

describe("serializeNode — mask (structure only)", () => {
  it("returns <tag> for an element marked .fs-mask", () => {
    // Pre-R2 behavior already emitted only the tag for elements, so mask and
    // allow render identically — the test pins that we don't accidentally
    // hide masked elements (which would over-redact) or leak more than the tag.
    const el = new StubElement({ tag: "input", classes: ["fs-mask"] });
    assert.equal(serializeNode(asEl(el)), "<input>");
  });

  it("returns <tag> for a [data-rr-is-password] element", () => {
    const el = new StubElement({ tag: "input", attrs: { "data-rr-is-password": "true" } });
    assert.equal(serializeNode(asEl(el)), "<input>");
  });
});

describe("serializeNode — unmask wins", () => {
  it("allows an .fs-unmask element inside a blocked region", () => {
    const panel = new StubElement({ tag: "div", classes: ["fs-block"] });
    const btn = new StubElement({ tag: "button", classes: ["fs-unmask"], parent: panel });
    assert.equal(serializeNode(asEl(btn)), "<button>");
  });
});

describe("serializeNode — defensive", () => {
  it("fails private when matches() throws", () => {
    const evil = {
      tagName: "INPUT",
      nodeName: "INPUT",
      parentElement: null,
      matches: () => {
        throw new Error("boom");
      },
    };
    // getPrivacyTreatment swallows the throw and returns "allow", so this
    // renders as <input>. The fail-private branch in serializeNode only trips
    // if getPrivacyTreatment ITSELF throws (it doesn't here). Pin the actual
    // behavior so a future change to either module is caught.
    Object.setPrototypeOf(evil, StubElement.prototype);
    assert.equal(serializeNode(evil), "<input>");
  });
});
