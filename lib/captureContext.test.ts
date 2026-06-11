/**
 * Tests for the neighborhood-capture helpers (ancestor breadcrumb, named
 * siblings, page title/h1).
 *
 * Run via: `npm run test:capture` (node:test + tsx, matching the extension
 * test setups).
 *
 * No jsdom — minimal Element-shaped stubs covering exactly the surface the
 * helpers touch. DOM globals the module references (Node, Element,
 * HTMLElement, ShadowRoot) are stubbed before import so instanceof checks
 * behave.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
// The module references DOM globals only inside functions (call time), never
// at load time, so a static import is safe as long as the globals below are
// installed before any test executes.
import {
  buildAncestorTrail,
  extractNamedSiblings,
  extractPageTitle,
  extractPageH1,
  getSemanticIdentifier,
} from "./captureContext";

/* ─── DOM globals the module under test references ─── */

class StubNodeBase {}
(globalThis as Record<string, unknown>).Node = { TEXT_NODE: 3 };
(globalThis as Record<string, unknown>).Element = StubNodeBase;
(globalThis as Record<string, unknown>).HTMLElement = StubNodeBase;
(globalThis as Record<string, unknown>).ShadowRoot = class ShadowRootStub {};

/* eslint-disable @typescript-eslint/no-explicit-any */

interface StubInit {
  tag?: string;
  id?: string;
  className?: string;
  attrs?: Record<string, string>;
  text?: string;
  children?: StubElement[];
}

class StubElement extends StubNodeBase {
  tagName: string;
  id: string;
  className: string;
  attrs: Record<string, string>;
  innerText: string;
  children: StubElement[];
  parentElement: StubElement | null = null;
  childNodes: Array<{ nodeType: number; textContent: string }>;

  constructor(init: StubInit = {}) {
    super();
    this.tagName = (init.tag ?? "div").toUpperCase();
    this.id = init.id ?? "";
    this.className = init.className ?? "";
    this.attrs = { ...(init.attrs ?? {}) };
    this.innerText = init.text ?? "";
    this.childNodes = init.text
      ? [{ nodeType: 3, textContent: init.text }]
      : [];
    this.children = init.children ?? [];
    for (const child of this.children) child.parentElement = this;
  }

  getAttribute(name: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.attrs, name)
      ? this.attrs[name]
      : null;
  }
  closest(): null {
    return null;
  }
  getRootNode(): undefined {
    return undefined;
  }
  // ownerDocument deliberately undefined: isMeaningfulChild's style check and
  // getComputedStyle-dependent paths are skipped, which is the point — these
  // tests target structure logic, not style logic.
  get ownerDocument(): undefined {
    return undefined;
  }
}

const el = (init: StubInit = {}) => new StubElement(init);

/** Chain ancestors: chain(leaf, parent, grandparent, ...) wires parentElement upward. */
function chain(...elements: StubElement[]): StubElement {
  for (let i = 0; i < elements.length - 1; i++) {
    elements[i].parentElement = elements[i + 1];
  }
  return elements[0];
}

/* ─── buildAncestorTrail ─── */

describe("buildAncestorTrail", () => {
  it("collects named + landmark ancestors, outermost first", () => {
    const leaf = chain(
      el({ tag: "button", text: "Choose Pro" }),
      el({ tag: "div" }), // anonymous wrapper — skipped
      el({ tag: "section", attrs: { "aria-label": "Pricing plans" } }),
      el({ tag: "main" }),
      el({ tag: "body" })
    );
    assert.equal(
      buildAncestorTrail(leaf as unknown as Element),
      'main > section "Pricing plans"'
    );
  });

  it("skips anonymous wrapper divs entirely", () => {
    const leaf = chain(
      el({ tag: "span" }),
      el({ tag: "div" }),
      el({ tag: "div" }),
      el({ tag: "body" })
    );
    assert.equal(buildAncestorTrail(leaf as unknown as Element), "");
  });

  it("includes a named div via aria-label", () => {
    const leaf = chain(
      el({ tag: "span" }),
      el({ tag: "div", attrs: { "aria-label": "Billing card" } }),
      el({ tag: "body" })
    );
    assert.equal(
      buildAncestorTrail(leaf as unknown as Element),
      'div "Billing card"'
    );
  });

  it("stops at body and caps at 3 entries", () => {
    const leaf = chain(
      el({ tag: "a", text: "Docs" }),
      el({ tag: "ul" }),
      el({ tag: "nav", attrs: { "aria-label": "Main" } }),
      el({ tag: "header" }),
      el({ tag: "section", attrs: { "aria-label": "Should not appear" } }),
      el({ tag: "body" })
    );
    assert.equal(
      buildAncestorTrail(leaf as unknown as Element),
      'header > nav "Main" > ul'
    );
  });

  it("truncates long ancestor names to 30 chars", () => {
    const longName = "A very long accessible label that goes on and on";
    const leaf = chain(
      el({ tag: "span" }),
      el({ tag: "section", attrs: { "aria-label": longName } }),
      el({ tag: "body" })
    );
    assert.equal(
      buildAncestorTrail(leaf as unknown as Element),
      `section "${longName.slice(0, 30)}"`
    );
  });

  it("does not use ancestor innerText as a name (it's the leaf's own text bubbling up)", () => {
    const wrapper = el({ tag: "div", text: "Choose Pro" });
    const leaf = chain(el({ tag: "span" }), wrapper, el({ tag: "body" }));
    assert.equal(buildAncestorTrail(leaf as unknown as Element), "");
  });

  it("returns empty for null", () => {
    assert.equal(buildAncestorTrail(null), "");
  });
});

/* ─── extractNamedSiblings ─── */

describe("extractNamedSiblings", () => {
  it("lists up to 2 named siblings with tags", () => {
    const target = el({ tag: "div" });
    el({
      tag: "div",
      children: [
        el({ tag: "h3", text: "Pro" }),
        target,
        el({ tag: "button", text: "Choose Pro" }),
        el({ tag: "p", text: "For growing teams" }),
      ],
    });
    assert.equal(
      extractNamedSiblings(target as unknown as Element),
      'h3 "Pro", button "Choose Pro"'
    );
  });

  it("skips unnamed siblings", () => {
    const target = el({ tag: "span", text: "x" });
    el({
      tag: "div",
      children: [el({ tag: "div" }), target, el({ tag: "img", attrs: { alt: "Logo" } })],
    });
    assert.equal(
      extractNamedSiblings(target as unknown as Element),
      'img "Logo"'
    );
  });

  it("returns empty with no parent or no named siblings", () => {
    assert.equal(extractNamedSiblings(null), "");
    const lonely = el({ tag: "div" });
    assert.equal(extractNamedSiblings(lonely as unknown as Element), "");
  });
});

/* ─── page title / h1 ─── */

function stubWin(doc: Record<string, unknown>): Window {
  return { document: doc } as unknown as Window;
}

describe("extractPageTitle / extractPageH1", () => {
  it("captures and caps document.title", () => {
    assert.equal(
      extractPageTitle(stubWin({ title: "  Acme — Pricing  " })),
      "Acme — Pricing"
    );
    const long = "T".repeat(120);
    assert.equal(extractPageTitle(stubWin({ title: long })).length, 80);
  });

  it("returns empty when title is missing", () => {
    assert.equal(extractPageTitle(stubWin({})), "");
  });

  it("captures the first visible h1", () => {
    const hidden = el({ tag: "h1", text: "Hidden", attrs: { "aria-hidden": "true" } });
    const visible = el({ tag: "h1", text: "Pricing that scales with you" });
    const win = stubWin({
      querySelectorAll: () => [hidden, visible],
    });
    assert.equal(extractPageH1(win), "Pricing that scales with you");
  });

  it("returns empty when no h1", () => {
    assert.equal(extractPageH1(stubWin({ querySelectorAll: () => [] })), "");
  });
});

/* ─── getSemanticIdentifier (sibling naming depends on it) ─── */

describe("getSemanticIdentifier", () => {
  it("prefers aria-label over text", () => {
    const e = el({ tag: "button", text: "X", attrs: { "aria-label": "Close dialog" } });
    assert.equal(getSemanticIdentifier(e as unknown as Element), "Close dialog");
  });

  it("returns empty for non-interactive containers with 2+ children", () => {
    const e = el({
      tag: "div",
      text: "",
      children: [el({ tag: "p", text: "a" }), el({ tag: "p", text: "b" })],
    });
    (e as unknown as { innerText: string }).innerText = "a b";
    assert.equal(getSemanticIdentifier(e as unknown as Element), "");
  });
});
