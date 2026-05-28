/**
 * Tests for network-surface redaction.
 *
 * Run via: `npm run test:network` (uses node:test + tsx — same runner as
 * console redact tests, to keep the extension-side test stack uniform).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { redactBody, redactHeaders, redactUrl } from "./redactNetwork.ts";

describe("redactUrl()", () => {
  it("masks ?token= values", () => {
    assert.equal(
      redactUrl("https://api.example.com/x?token=ABCDEFG"),
      "https://api.example.com/x?token=<redacted>",
    );
  });

  it("masks ?api_key= values", () => {
    assert.match(redactUrl("https://x.io/cb?api_key=zzz123"), /api_key=<redacted>/);
  });

  it("preserves non-sensitive query params verbatim", () => {
    const url = "https://x.io/items?page=2&size=20&safe=value";
    assert.equal(redactUrl(url), url);
  });

  it("returns empty string unchanged", () => {
    assert.equal(redactUrl(""), "");
  });
});

describe("redactHeaders()", () => {
  it("strips Authorization value", () => {
    const out = redactHeaders({ Authorization: "Bearer eyJabc.def.ghi" });
    assert.equal(out.Authorization, "<redacted>");
  });

  it("strips Cookie and Set-Cookie", () => {
    const out = redactHeaders({ Cookie: "sid=abc", "Set-Cookie": "sid=def; HttpOnly" });
    assert.equal(out.Cookie, "<redacted>");
    assert.equal(out["Set-Cookie"], "<redacted>");
  });

  it("strips x-api-key, x-auth-token, x-access-token", () => {
    const out = redactHeaders({
      "x-api-key": "abc123",
      "x-auth-token": "tok",
      "x-access-token": "tok2",
    });
    assert.equal(out["x-api-key"], "<redacted>");
    assert.equal(out["x-auth-token"], "<redacted>");
    assert.equal(out["x-access-token"], "<redacted>");
  });

  it("strips custom x-*-token / x-*-secret / x-*-key / x-*-auth headers", () => {
    const out = redactHeaders({
      "X-Stripe-Token": "tok_abc",
      "x-myapp-secret": "s",
      "X-Custom-Api-Key": "k",
      "x-feature-auth": "a",
    });
    assert.equal(out["X-Stripe-Token"], "<redacted>");
    assert.equal(out["x-myapp-secret"], "<redacted>");
    assert.equal(out["X-Custom-Api-Key"], "<redacted>");
    assert.equal(out["x-feature-auth"], "<redacted>");
  });

  it("preserves Content-Type verbatim", () => {
    const out = redactHeaders({ "Content-Type": "application/json; charset=utf-8" });
    assert.equal(out["Content-Type"], "application/json; charset=utf-8");
  });

  it("preserves arbitrary X-Custom-* headers verbatim", () => {
    const out = redactHeaders({ "X-Custom-Foo": "bar-baz" });
    assert.equal(out["X-Custom-Foo"], "bar-baz");
  });

  it("redacts inline JWT inside an otherwise-passthrough custom header", () => {
    const out = redactHeaders({
      "X-Trace-Id": "context eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.signaturePart",
    });
    assert.match(out["X-Trace-Id"], /<jwt>/);
  });

  it("preserves header names exactly as supplied", () => {
    const out = redactHeaders({ Authorization: "x", "Content-Type": "y" });
    assert.deepEqual(Object.keys(out).sort(), ["Authorization", "Content-Type"]);
  });

  it("matches sensitive names case-insensitively", () => {
    const out = redactHeaders({ AUTHORIZATION: "Bearer x", cookie: "sid=1" });
    assert.equal(out.AUTHORIZATION, "<redacted>");
    assert.equal(out.cookie, "<redacted>");
  });
});

describe("redactBody()", () => {
  it("returns null for null input", () => {
    assert.equal(redactBody(null, "application/json"), null);
  });

  it("returns empty string for empty input", () => {
    assert.equal(redactBody("", "application/json"), "");
  });

  it("redacts an embedded email in a JSON body", () => {
    const body = '{"user":"alice@example.com","id":42}';
    const out = redactBody(body, "application/json");
    assert.ok(out);
    assert.match(out!, /<email>/);
    assert.ok(!out!.includes("alice@example.com"));
  });

  it("redacts an embedded JWT in a JSON body", () => {
    const body = '{"token":"eyJabc.eyJdef.signaturePart"}';
    const out = redactBody(body, "application/json");
    assert.ok(out);
    assert.match(out!, /<jwt>/);
  });

  it("leaves safe content unchanged", () => {
    const body = '{"page":2,"size":20,"sort":"asc"}';
    assert.equal(redactBody(body, "application/json"), body);
  });

  it("scans a 50KB safe body under 50ms", () => {
    // Production guard inside console redact() is 5ms; the test runner allows
    // a generous margin for cold-start jitter on slower CI hosts.
    const chunk = '{"page":2,"size":20,"sort":"ascending","filter":"none"} ';
    const body = chunk.repeat(Math.ceil(50_000 / chunk.length)).slice(0, 50_000);
    const start = performance.now();
    const out = redactBody(body, "application/json");
    const elapsed = performance.now() - start;
    assert.ok(elapsed < 50, `expected <50ms, got ${elapsed.toFixed(2)}ms`);
    assert.ok(out);
  });
});
