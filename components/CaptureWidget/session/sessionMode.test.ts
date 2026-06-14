/**
 * Tests for session capture target rules — the F5 form-field behavior.
 * Run via: `npm run test:capture`.
 *
 * Minimal stubs only (no jsdom), matching the other capture tests. The
 * `document` global is stubbed with just body/documentElement/getElementById.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

class StubNodeBase {}
(globalThis as Record<string, unknown>).Element = StubNodeBase;
(globalThis as Record<string, unknown>).ShadowRoot = class ShadowRootStub {};

class StubElement extends StubNodeBase {
  tagName: string;
  id = "";
  className = "";
  attrs: Record<string, string>;
  isContentEditable: boolean;

  constructor(tag: string, attrs: Record<string, string> = {}, isContentEditable = false) {
    super();
    this.tagName = tag.toUpperCase();
    this.attrs = attrs;
    this.isContentEditable = isContentEditable;
  }
  getAttribute(name: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null;
  }
  closest(): null {
    return null;
  }
  getRootNode(): undefined {
    return undefined;
  }
  get parentElement(): null {
    return null;
  }
}

const body = new StubElement("body");
const html = new StubElement("html");
(globalThis as Record<string, unknown>).document = {
  body,
  documentElement: html,
  getElementById: () => null,
};

import { isEventFromAnnoteUi, isFormFieldElement, isSessionCaptureTarget } from "./sessionMode";

describe("isFormFieldElement", () => {
  it("recognizes input/textarea/select", () => {
    for (const tag of ["input", "textarea", "select"]) {
      assert.equal(isFormFieldElement(new StubElement(tag) as unknown as Element), true, tag);
    }
  });

  it("recognizes contenteditable (attribute and inherited)", () => {
    assert.equal(
      isFormFieldElement(new StubElement("div", { contenteditable: "true" }) as unknown as Element),
      true
    );
    assert.equal(
      isFormFieldElement(new StubElement("div", { contenteditable: "" }) as unknown as Element),
      true
    );
    // Nested node inside a rich-text editor: no attribute, but isContentEditable.
    assert.equal(
      isFormFieldElement(new StubElement("p", {}, true) as unknown as Element),
      true
    );
  });

  it("rejects ordinary elements", () => {
    assert.equal(isFormFieldElement(new StubElement("button") as unknown as Element), false);
    assert.equal(isFormFieldElement(null), false);
  });
});

describe("isSessionCaptureTarget", () => {
  it("accepts form fields as capture targets (F5)", () => {
    assert.equal(isSessionCaptureTarget(new StubElement("input") as unknown as Element), true);
    assert.equal(isSessionCaptureTarget(new StubElement("textarea") as unknown as Element), true);
    assert.equal(
      isSessionCaptureTarget(new StubElement("div", { contenteditable: "true" }) as unknown as Element),
      true
    );
  });

  it("accepts ordinary page elements", () => {
    assert.equal(isSessionCaptureTarget(new StubElement("button") as unknown as Element), true);
  });

  it("rejects body, html, and null", () => {
    assert.equal(isSessionCaptureTarget(body as unknown as Element), false);
    assert.equal(isSessionCaptureTarget(html as unknown as Element), false);
    assert.equal(isSessionCaptureTarget(null), false);
  });

  it("rejects Echly UI elements", () => {
    const annote = new StubElement("div", { "data-annote-ui": "true" });
    assert.equal(isSessionCaptureTarget(annote as unknown as Element), false);
  });
});

describe("isEventFromAnnoteUi", () => {
  const eventFor = (target: unknown) => ({ target }) as unknown as Event;

  it("detects the shadow host (retargeted widget clicks)", () => {
    const host = new StubElement("div");
    host.id = "echly-shadow-host";
    assert.equal(isEventFromAnnoteUi(eventFor(host)), true);
  });

  it("detects data-annote-ui elements", () => {
    const annote = new StubElement("div", { "data-annote-ui": "true" });
    assert.equal(isEventFromAnnoteUi(eventFor(annote)), true);
  });

  it("passes through ordinary page elements and non-elements", () => {
    assert.equal(isEventFromAnnoteUi(eventFor(new StubElement("button"))), false);
    assert.equal(isEventFromAnnoteUi(eventFor(null)), false);
  });
});
