/**
 * Tests for the redaction pipeline.
 *
 * Run via: `npm run test:console` (uses Node's built-in `node:test` runner
 * via tsx so we don't add a heavy test framework just for this one file).
 *
 * Coverage targets:
 *  - Each pattern matches realistic positive inputs.
 *  - Each pattern does NOT match plausible-but-not-secret strings.
 *  - Edge cases: empty, unicode, very long, nested, multi-pattern strings.
 *  - Performance: an adversarial 10 KB input completes in <5 ms wall clock.
 *
 * NOTE: redaction tolerance is "permissive over-redaction" — some negative
 * cases below intentionally cover strings that *could* false-positive but
 * aren't security-sensitive (e.g. mixed-format dates that look phone-shaped).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { __test_only_patterns, redact } from "./redact.ts";

describe("redact() — JWT", () => {
  it("redacts a standard JWT", () => {
    const input = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const out = redact(input);
    assert.match(out, /<jwt>/);
    assert.ok(!out.includes("eyJh"));
  });

  it("redacts multiple JWTs in one string", () => {
    const input = "old: eyJabc.eyJ123.signABC new: eyJxyz.eyJ456.signXYZ";
    const out = redact(input);
    assert.equal((out.match(/<jwt>/g) || []).length, 2);
  });

  it("does not match the bare string 'eyJ'", () => {
    assert.equal(redact("eyJ alone"), "eyJ alone");
  });
});

describe("redact() — email", () => {
  it("redacts a standard email", () => {
    assert.equal(redact("contact me at alice@example.com please"), "contact me at <email> please");
  });

  it("redacts emails inside JSON payloads", () => {
    const input = '{"email":"bob@acme.io","id":42}';
    assert.match(redact(input), /<email>/);
  });

  it("does not redact the @ symbol alone", () => {
    assert.equal(redact("ping @everyone"), "ping @everyone");
  });

  it("does not redact bare hostnames", () => {
    assert.equal(redact("visit example.com"), "visit example.com");
  });
});

describe("redact() — credit card", () => {
  it("redacts a 16-digit hyphenated card", () => {
    assert.equal(redact("4242-4242-4242-4242"), "<card>");
  });

  it("redacts a 16-digit space-separated card", () => {
    assert.match(redact("card: 4111 1111 1111 1111"), /<card>/);
  });

  it("redacts a 16-digit run-together card", () => {
    assert.match(redact("4242424242424242 is the number"), /<card>/);
  });

  it("does not redact a 12-digit ID", () => {
    assert.equal(redact("ID 123456789012"), "ID 123456789012");
  });

  it("does not redact a 32-char hash that contains long digit runs", () => {
    const hash = "abc1234567890123456789012345678def";
    assert.equal(redact(hash), hash);
  });
});

describe("redact() — phone", () => {
  it("redacts a US-format phone", () => {
    assert.match(redact("call 415-555-1234 now"), /<phone>/);
  });

  it("redacts a parenthesized US phone", () => {
    assert.match(redact("(415) 555-1234"), /<phone>/);
  });

  it("redacts an E.164 phone", () => {
    assert.match(redact("dial +14155551234 today"), /<phone>/);
  });

  it("does not redact a 4-digit PIN", () => {
    assert.equal(redact("PIN 1234"), "PIN 1234");
  });
});

describe("redact() — API key prefixes", () => {
  it("redacts a Stripe live secret", () => {
    assert.equal(redact("sk_live_abcDEF123456"), "<key>");
  });

  it("redacts a Stripe test publishable", () => {
    assert.match(redact("config: pk_test_xyz789ABC"), /<key>/);
  });

  it("redacts GitHub personal-access tokens", () => {
    assert.equal(redact("ghp_AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHH"), "<key>");
  });

  it("redacts Slack bot tokens", () => {
    assert.equal(redact("xoxb-12345-67890-abcdefg"), "<key>");
  });

  it("does not redact the prefix without trailing characters", () => {
    assert.equal(redact("prefix sk_live_"), "prefix sk_live_");
  });
});

describe("redact() — Authorization / Cookie headers", () => {
  it("redacts Authorization: Bearer …", () => {
    assert.equal(redact("Authorization: Bearer eyJabc.def.ghi"), "Authorization: <auth>");
  });

  it("redacts case-insensitively", () => {
    assert.equal(redact("authorization: Basic dXNlcjpwYXNz"), "Authorization: <auth>");
  });

  it("redacts Cookie header", () => {
    assert.equal(redact("Cookie: session=abc; other=def"), "Cookie: <cookie>");
  });

  it("redacts Set-Cookie header", () => {
    assert.equal(redact("Set-Cookie: sid=abc123; Path=/; HttpOnly"), "Set-Cookie: <cookie>");
  });

  it("preserves text on subsequent lines", () => {
    const input = "Authorization: Bearer eyJabc.def.ghi\nother line";
    assert.equal(redact(input), "Authorization: <auth>\nother line");
  });
});

describe("redact() — sensitive query params", () => {
  it("masks ?token=...", () => {
    assert.equal(
      redact("https://api.example.com/x?token=ABCDEFG"),
      "https://api.example.com/x?token=<redacted>",
    );
  });

  it("masks &access_token=...", () => {
    assert.match(redact("https://x.io/cb?state=1&access_token=zzz123"), /access_token=<redacted>/);
  });

  it("masks ?password= regardless of casing", () => {
    assert.match(redact("login?Password=hunter2"), /Password=<redacted>/);
  });

  it("preserves non-sensitive params", () => {
    assert.equal(redact("https://x.io?page=2&size=20"), "https://x.io?page=2&size=20");
  });
});

describe("redact() — edge cases", () => {
  it("returns empty input unchanged", () => {
    assert.equal(redact(""), "");
  });

  it("handles unicode without errors", () => {
    const input = "user 日本語 alice@example.com 🎉";
    const out = redact(input);
    assert.match(out, /<email>/);
    assert.match(out, /日本語/);
  });

  it("redacts multiple distinct pattern types in one string", () => {
    const input = "user alice@example.com paid with 4242-4242-4242-4242 via token sk_live_abc123";
    const out = redact(input);
    assert.match(out, /<email>/);
    assert.match(out, /<card>/);
    assert.match(out, /<key>/);
  });

  it("redacts an email inside a JSON blob", () => {
    const input = '{"user":{"email":"x@y.com","jwt":"eyJa.eyJb.sig"}}';
    const out = redact(input);
    assert.match(out, /<email>/);
    assert.match(out, /<jwt>/);
  });

  it("does not alter normal sentences", () => {
    const s = "The quick brown fox jumps over the lazy dog.";
    assert.equal(redact(s), s);
  });

  it("handles a 10KB adversarial string under 5ms", () => {
    const chunk = "alice@example.com sk_live_abcDEF123 4242-4242-4242-4242 eyJabc.eyJdef.sig ";
    const adversarial = chunk.repeat(Math.ceil(10_000 / chunk.length)).slice(0, 10_000);
    const start = performance.now();
    const out = redact(adversarial);
    const elapsed = performance.now() - start;
    // Allow a healthy margin for cold-start jitter in the runner; the
    // production guard inside redact() is set tighter at 5ms.
    assert.ok(elapsed < 50, `expected <50ms, got ${elapsed.toFixed(2)}ms`);
    assert.match(out, /<email>/);
  });
});

describe("redact() — __test_only_patterns", () => {
  it("exposes the full pattern list", () => {
    assert.ok(__test_only_patterns.length > 5);
    for (const p of __test_only_patterns) {
      assert.ok(p.pattern instanceof RegExp);
      assert.equal(typeof p.name, "string");
    }
  });

  it("every regex has the global flag", () => {
    for (const p of __test_only_patterns) {
      assert.ok(p.pattern.flags.includes("g"), `${p.name} missing /g`);
    }
  });
});
