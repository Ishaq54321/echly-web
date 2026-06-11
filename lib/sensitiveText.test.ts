/**
 * Tests for capture-text sensitive masking.
 * Run via: `npm run test:capture`.
 *
 * The load-bearing assertion set: a billing-card-like text gets masked,
 * a plain copy-edit text passes through UNTOUCHED (masking must never gut
 * copy-edit grounding).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { maskSensitiveText } from "./sensitiveText";

describe("maskSensitiveText", () => {
  it("masks a billing-card-like subtree text", () => {
    const billing =
      "Payment method Visa ending 4242 4242 4242 4242 Billing contact sarah@acme.com Update card";
    const masked = maskSensitiveText(billing);
    assert.ok(!masked.includes("4242 4242 4242 4242"));
    assert.ok(!masked.includes("sarah@acme.com"));
    assert.ok(masked.includes("<card>"));
    assert.ok(masked.includes("<email>"));
    // The surrounding UI copy survives so the element is still identifiable.
    assert.ok(masked.includes("Payment method"));
    assert.ok(masked.includes("Update card"));
  });

  it("masks tokens and keys", () => {
    assert.equal(
      maskSensitiveText("token eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig here"),
      "token <jwt> here"
    );
    assert.equal(
      maskSensitiveText("key sk_live_abc123DEF"),
      "key <key>"
    );
  });

  it("masks phone numbers", () => {
    assert.equal(maskSensitiveText("Call 555-123-4567 today"), "Call <phone> today");
    assert.equal(maskSensitiveText("Support: +14155551234"), "Support: <phone>");
  });

  it("leaves ordinary copy-edit text completely untouched", () => {
    const copies = [
      "Start a trial today",
      "Pricing that scales with you",
      "Save 20% with yearly billing — 14 day refund policy",
      "Order #1234 shipped in 2 days",
      "Increase font size from 14px to 18px",
    ];
    for (const copy of copies) {
      assert.equal(maskSensitiveText(copy), copy);
    }
  });

  it("is null-safe", () => {
    assert.equal(maskSensitiveText(null), null);
    assert.equal(maskSensitiveText(""), "");
  });
});
