/**
 * Tests for the console-capture denylist module.
 *
 * Two surfaces:
 *  - isDenylisted(message): matches an entry's MESSAGE text (third-party SDK
 *    chatter + our own widget log prefixes).
 *  - isExtensionOrigin(text): matches an entry's SOURCE/STACK (a
 *    chrome-extension:// script URL) — the reliable signal for an extension-
 *    thrown error whose message ("Failed to fetch") carries no marker.
 *
 * Regression focus: the prior `/^\[ECHLY\]/` anchor missed the widget's real
 * prefixes ("[ECHLY PERF]", "[Echly]", …), and the exception path inspected
 * neither source nor stack — so a chrome-extension:// "Failed to fetch" reached
 * the buffer and misled the AI. Both gaps are covered below.
 *
 * Run via: `npm run test:console`.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isDenylisted, isExtensionOrigin } from "./denylist.ts";

describe("isDenylisted() — our own widget log prefixes", () => {
  it("matches the bare [ECHLY] prefix", () => {
    assert.equal(isDenylisted("[ECHLY] rehydrateSession failed"), true);
  });

  it("matches tagged prefixes with a space before the bracket", () => {
    // These all evaded the old literal /^\[ECHLY\]/ anchor.
    assert.equal(isDenylisted("[ECHLY PERF] widget: first paint @120ms"), true);
    assert.equal(isDenylisted("[ECHLY MESSAGE] delivery failed"), true);
    assert.equal(isDenylisted("[ECHLY BG] No active tab"), true);
    assert.equal(isDenylisted("[ECHLY AUTH] Failed to get extension token"), true);
    assert.equal(isDenylisted("[ECHLY ERROR] background create failed"), true);
  });

  it("matches the mixed-case [Echly] prefix (case-insensitive)", () => {
    assert.equal(isDenylisted("[Echly] Failed to load widget:"), true);
    assert.equal(isDenylisted("[Echly] widget module load failed:"), true);
  });

  it("matches the [Annote] prefix", () => {
    assert.equal(isDenylisted("[Annote] Console capture resumed."), true);
  });

  it("does NOT match a page log that merely mentions echly mid-line", () => {
    // Anchored to start — a page's own log that happens to contain the word
    // must still be captured (no false positive on first-party content).
    assert.equal(isDenylisted("user clicked the echly button"), false);
    assert.equal(isDenylisted("loaded annote integration ok"), false);
  });
});

describe("isDenylisted() — chrome-extension:// in message text (scoping fix)", () => {
  // SCOPING FIX: a chrome-extension:// scheme appearing in the MESSAGE text must
  // NOT cause the entry to be dropped — that silently lost legitimate page logs/
  // errors that merely mention an extension URL (e.g. a browser CSP violation
  // report, or a page that logs about talking to an extension). The honest
  // extension signal is the SOURCE/STACK origin (isExtensionOrigin), not the
  // message text. So these are now NOT denylisted by message.
  it("does NOT drop a page log that mentions a chrome-extension:// URL", () => {
    assert.equal(
      isDenylisted("Failed to load chrome-extension://abc/widget.js"),
      false,
    );
  });

  it("does NOT drop a CSP violation report naming a chrome-extension:// resource", () => {
    assert.equal(
      isDenylisted(
        "Refused to load the script 'chrome-extension://abc/inject.js' because it violates the Content Security Policy directive",
      ),
      false,
    );
  });

  it("still drops our own [Annote]-prefixed lines regardless of an extension URL in them", () => {
    // The first-party prefix anchor is the mechanism that filters OUR logs, and it
    // still applies even when the line also contains a chrome-extension:// URL.
    assert.equal(
      isDenylisted("[Annote] something about chrome-extension://abc/x.js"),
      true,
    );
  });
});

describe("isExtensionOrigin() — source/stack signal", () => {
  it("is true for a chrome-extension:// script source URL", () => {
    assert.equal(
      isExtensionOrigin("chrome-extension://abcdefghijklmnop/widget/widget.js"),
      true,
    );
  });

  it("is true for a stack whose frames are chrome-extension://", () => {
    const stack =
      "TypeError: Failed to fetch\n" +
      "    at fetchChunk (chrome-extension://abcdefghijklmnop/widget/chunk-XYZ.js:1:842)\n" +
      "    at async load (chrome-extension://abcdefghijklmnop/widget/widget.js:2:99)";
    assert.equal(isExtensionOrigin(stack), true);
  });

  it("is false for a null/empty source or stack", () => {
    assert.equal(isExtensionOrigin(null), false);
    assert.equal(isExtensionOrigin(undefined), false);
    assert.equal(isExtensionOrigin(""), false);
  });

  it("DOGFOODING: is false for a same-origin annote.ai page stack", () => {
    // A real bug captured ON annote.ai: the page's own error stack points at
    // https://annote.ai/... — it must NOT be treated as extension noise. We
    // filter the chrome-extension:// SCHEME, never the annote.ai host.
    const pageStack =
      "TypeError: Cannot read properties of undefined\n" +
      "    at CartView (https://annote.ai/_next/static/chunks/cart.js:5:120)";
    assert.equal(isExtensionOrigin(pageStack), false);
  });

  it("is false for a first-party customer-site stack", () => {
    const pageStack =
      "Error: boom\n    at https://customer-app.com/static/app.js:10:5";
    assert.equal(isExtensionOrigin(pageStack), false);
  });
});
