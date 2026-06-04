/**
 * Tests for the user-actions denylist module.
 *
 * Covers:
 *  - CAPTURED_ATTRIBUTES allowlist contents.
 *  - isAnnoteElement detects the echly-shadow-host (on the element itself,
 *    on a direct parent, on a deep ancestor) and is defensive against null
 *    inputs and cyclic chains.
 *  - isNoisyTag flags html/body and nothing else.
 *
 * Run via: `npm run test:actions`.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ANNOTE_SHADOW_HOST_ID,
  CAPTURED_ATTRIBUTES,
  isAnnoteElement,
  isNoisyTag,
} from "./denylist.ts";

// Same minimal DOM stub shape used in privacy.test.ts — kept inline here so
// the test file is self-contained and runnable independently.
class StubEl {
  id = "";
  parent: StubEl | null = null;
  get parentElement(): StubEl | null {
    return this.parent;
  }
}

function asEl(e: StubEl): Element {
  return e as unknown as Element;
}

describe("CAPTURED_ATTRIBUTES", () => {
  it("contains exactly the documented allowlist", () => {
    // Snapshot-style assertion: locking the set down so adding a new
    // attribute is a deliberate, reviewed change (privacy impact + bundle
    // size — every new attribute means more redaction surface).
    const expected = [
      "role",
      "aria-label",
      "type",
      "href",
      "name",
      "title",
      "alt",
      "placeholder",
    ];
    assert.deepEqual([...CAPTURED_ATTRIBUTES].sort(), expected.sort());
  });

  it("is frozen so accidental mutation throws in strict mode", () => {
    assert.ok(Object.isFrozen(CAPTURED_ATTRIBUTES));
  });
});

describe("isNoisyTag()", () => {
  it("flags html", () => assert.equal(isNoisyTag("html"), true));
  it("flags body", () => assert.equal(isNoisyTag("body"), true));
  it("flags HTML / BODY case-insensitively", () => {
    assert.equal(isNoisyTag("HTML"), true);
    assert.equal(isNoisyTag("Body"), true);
  });
  it("does not flag button / a / input / div", () => {
    assert.equal(isNoisyTag("button"), false);
    assert.equal(isNoisyTag("a"), false);
    assert.equal(isNoisyTag("input"), false);
    assert.equal(isNoisyTag("div"), false);
  });
  it("returns false for empty / null / undefined", () => {
    assert.equal(isNoisyTag(""), false);
    assert.equal(isNoisyTag(null), false);
    assert.equal(isNoisyTag(undefined), false);
  });
});

describe("isAnnoteElement()", () => {
  it("returns false for null / undefined", () => {
    assert.equal(isAnnoteElement(null), false);
    assert.equal(isAnnoteElement(undefined), false);
  });

  it("detects the host element itself", () => {
    const host = new StubEl();
    host.id = ANNOTE_SHADOW_HOST_ID;
    assert.equal(isAnnoteElement(asEl(host)), true);
  });

  it("detects a direct child of the host", () => {
    const host = new StubEl();
    host.id = ANNOTE_SHADOW_HOST_ID;
    const child = new StubEl();
    child.parent = host;
    assert.equal(isAnnoteElement(asEl(child)), true);
  });

  it("detects a deeply nested descendant", () => {
    const host = new StubEl();
    host.id = ANNOTE_SHADOW_HOST_ID;
    let cursor: StubEl = host;
    for (let i = 0; i < 10; i++) {
      const next = new StubEl();
      next.parent = cursor;
      cursor = next;
    }
    assert.equal(isAnnoteElement(asEl(cursor)), true);
  });

  it("returns false for an element with no Annote ancestor", () => {
    const root = new StubEl();
    root.id = "some-other-thing";
    const mid = new StubEl();
    mid.parent = root;
    const leaf = new StubEl();
    leaf.parent = mid;
    assert.equal(isAnnoteElement(asEl(leaf)), false);
  });

  it("does not loop forever on a cyclic chain", () => {
    const a = new StubEl();
    const b = new StubEl();
    a.parent = b;
    b.parent = a;
    // Must terminate, must report false (no host id present).
    assert.equal(isAnnoteElement(asEl(a)), false);
  });
});

describe("ANNOTE_SHADOW_HOST_ID", () => {
  it("matches the id used by bootstrap.ts", () => {
    // Locked: the bootstrap module defines SHADOW_HOST_ID = "echly-shadow-host";
    // a mismatch here would silently break the denylist check at runtime.
    assert.equal(ANNOTE_SHADOW_HOST_ID, "echly-shadow-host");
  });
});
