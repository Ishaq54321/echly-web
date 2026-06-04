/**
 * Tests for action-surface redaction.
 *
 * Run via: `npm run test:actions`. Most of the heavy lifting is delegated to
 * the shared `redact()` pipeline (already exhaustively tested in
 * console/redact.test.ts) — these tests focus on the action-specific
 * surfaces: text truncation, the attribute allowlist split, and URL routing.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ELEMENT_TEXT_MAX_CHARS,
  redactAttributes,
  redactElementText,
  redactUrl,
} from "./redactAction.ts";

describe("redactElementText()", () => {
  it("redacts an embedded email", () => {
    const out = redactElementText("Contact alice@example.com today");
    assert.match(out, /<email>/);
    assert.ok(!out.includes("alice@example.com"));
  });

  it("redacts an embedded JWT", () => {
    const out = redactElementText("token: eyJabc.eyJdef.signaturePart");
    assert.match(out, /<jwt>/);
  });

  it("redacts an embedded credit card", () => {
    const out = redactElementText("paid 4242-4242-4242-4242");
    assert.match(out, /<card>/);
  });

  it("collapses internal whitespace", () => {
    assert.equal(redactElementText("  hello   \n  world  "), "hello world");
  });

  it("truncates long strings to ELEMENT_TEXT_MAX_CHARS", () => {
    const long = "x".repeat(200);
    const out = redactElementText(long);
    assert.equal(out.length, ELEMENT_TEXT_MAX_CHARS);
    assert.ok(out.endsWith("…"));
  });

  it("does not truncate strings under the cap", () => {
    const s = "Save changes";
    assert.equal(redactElementText(s), s);
  });

  it("returns empty for null / undefined / empty / whitespace-only", () => {
    assert.equal(redactElementText(null), "");
    assert.equal(redactElementText(undefined), "");
    assert.equal(redactElementText(""), "");
    assert.equal(redactElementText("   \n\t  "), "");
  });
});

describe("redactAttributes() — free-text attributes", () => {
  it("redacts placeholder values", () => {
    const out = redactAttributes({ placeholder: "Enter alice@example.com" });
    assert.match(out.placeholder, /<email>/);
  });

  it("redacts title values", () => {
    const out = redactAttributes({ title: "Card 4242-4242-4242-4242 saved" });
    assert.match(out.title, /<card>/);
  });

  it("redacts alt values", () => {
    const out = redactAttributes({ alt: "user alice@example.com avatar" });
    assert.match(out.alt, /<email>/);
  });

  it("redacts aria-label values", () => {
    const out = redactAttributes({ "aria-label": "Logout alice@example.com" });
    assert.match(out["aria-label"], /<email>/);
  });

  it("redacts href query params via the URL pipeline", () => {
    const out = redactAttributes({ href: "https://x.io/cb?token=ABCDEF&page=1" });
    assert.match(out.href, /token=<redacted>/);
    assert.match(out.href, /page=1/);
  });
});

describe("redactAttributes() — structural attributes pass through", () => {
  it("preserves role verbatim", () => {
    const out = redactAttributes({ role: "button" });
    assert.equal(out.role, "button");
  });

  it("preserves type verbatim", () => {
    const out = redactAttributes({ type: "submit" });
    assert.equal(out.type, "submit");
  });

  it("preserves name verbatim", () => {
    const out = redactAttributes({ name: "email_field" });
    assert.equal(out.name, "email_field");
  });

  it("preserves names exactly as supplied (case kept)", () => {
    const out = redactAttributes({ "ARIA-LABEL": "x", Role: "y" });
    assert.deepEqual(Object.keys(out).sort(), ["ARIA-LABEL", "Role"]);
  });
});

describe("redactAttributes() — edge cases", () => {
  it("returns {} for null / undefined input", () => {
    assert.deepEqual(redactAttributes(null), {});
    assert.deepEqual(redactAttributes(undefined), {});
  });

  it("skips non-string values defensively", () => {
    const out = redactAttributes({
      role: "button",
      // @ts-expect-error testing coercion defensively
      "data-bogus": 42,
    });
    assert.equal(out.role, "button");
    assert.equal(out["data-bogus"], undefined);
  });
});

describe("redactUrl()", () => {
  it("masks ?token= values", () => {
    assert.match(redactUrl("https://x.io/cb?token=ABCDEF"), /token=<redacted>/);
  });

  it("preserves safe params", () => {
    const u = "https://x.io/items?page=2";
    assert.equal(redactUrl(u), u);
  });

  it("returns empty for null / undefined / empty", () => {
    assert.equal(redactUrl(null), "");
    assert.equal(redactUrl(undefined), "");
    assert.equal(redactUrl(""), "");
  });
});
