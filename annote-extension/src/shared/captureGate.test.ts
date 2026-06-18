/**
 * Tests for the MAIN-world capture-enabled gate.
 *
 * Run via: `npm run test:shared` (node:test + tsx, matching privacy.test.ts).
 *
 * The gate is a per-realm singleton (module-level closure) and, under the
 * tsx + node:test loader, a `?cacheBust` query does NOT produce a fresh module
 * instance (verified) — so we treat the gate as the single instance it is:
 * stand up ONE persistent window stub, install ONCE, and reset the gate's state
 * between tests by delivering an `enabled:false` control message (and clearing
 * the recorded postMessage log). This mirrors how the gate actually lives in a
 * page realm: installed once, toggled many times.
 */

import { describe, it, before, beforeEach } from "node:test";
import assert from "node:assert/strict";

// ─── window stub (single persistent instance) ──────────────────────
type MessageHandler = (event: { source: unknown; origin: string; data: unknown }) => void;

class WindowStub {
  origin = "https://example.com";
  posted: unknown[] = [];
  handlers: MessageHandler[] = [];

  addEventListener(type: string, handler: MessageHandler): void {
    if (type === "message") this.handlers.push(handler);
  }

  postMessage(data: unknown): void {
    this.posted.push(data);
  }

  /** Deliver a synthetic message event (defaults to same-window, same-origin). */
  deliver(data: unknown, opts?: { source?: unknown; origin?: string }): void {
    const event = {
      source: opts && "source" in opts ? opts.source : this,
      origin: opts?.origin ?? this.origin,
      data,
    };
    for (const h of this.handlers) h(event);
  }
}

const win = new WindowStub();
(globalThis as unknown as { window: WindowStub }).window = win;

let gate: typeof import("./captureGate.ts");
/** Snapshot of the STATE_REQUEST posted at install time, before beforeEach clears it. */
let installPostedStateRequests = 0;

before(async () => {
  gate = await import("./captureGate.ts");
  gate.installCaptureGate();
  installPostedStateRequests = win.posted.filter(
    (m) =>
      m &&
      typeof m === "object" &&
      (m as { type?: unknown }).type === gate.CAPTURE_GATE_STATE_REQUEST &&
      (m as { source?: unknown }).source === gate.CAPTURE_GATE_SOURCE_MAIN,
  ).length;
});

/** Reset to the fail-safe OFF baseline and clear the postMessage log. */
beforeEach(() => {
  win.deliver({ source: gate.CAPTURE_GATE_SOURCE_ISOLATED, type: gate.CAPTURE_GATE_SET, enabled: false });
  win.posted.length = 0;
});

/** Convenience: deliver a well-formed SET from the isolated relay. */
function set(enabled: unknown, opts?: { source?: unknown; origin?: string }): void {
  win.deliver(
    { source: gate.CAPTURE_GATE_SOURCE_ISOLATED, type: gate.CAPTURE_GATE_SET, enabled },
    opts,
  );
}

describe("captureGate fail-safe defaults", () => {
  it("is OFF at the baseline (no enable delivered)", () => {
    assert.equal(gate.isCaptureEnabled(), false);
  });

  it("turns ON only for an explicit enabled:true from the isolated source", () => {
    set(true);
    assert.equal(gate.isCaptureEnabled(), true);
  });

  it("turns back OFF on enabled:false", () => {
    set(true);
    assert.equal(gate.isCaptureEnabled(), true);
    set(false);
    assert.equal(gate.isCaptureEnabled(), false);
  });
});

describe("captureGate strict-boolean coercion (a garbage payload can never enable)", () => {
  for (const bad of ["true", 1, {}, [], "yes", "1"] as unknown[]) {
    it(`stays OFF for enabled=${JSON.stringify(bad)}`, () => {
      set(bad);
      assert.equal(gate.isCaptureEnabled(), false);
    });
  }

  it("missing enabled field stays OFF", () => {
    win.deliver({ source: gate.CAPTURE_GATE_SOURCE_ISOLATED, type: gate.CAPTURE_GATE_SET });
    assert.equal(gate.isCaptureEnabled(), false);
  });

  it("a true followed by a garbage value does not silently keep it ON", () => {
    set(true);
    assert.equal(gate.isCaptureEnabled(), true);
    set("true"); // garbage — must coerce to false
    assert.equal(gate.isCaptureEnabled(), false);
  });
});

describe("captureGate message hardening", () => {
  it("ignores a cross-origin message even with the right shape", () => {
    set(true, { origin: "https://evil.example" });
    assert.equal(gate.isCaptureEnabled(), false);
  });

  it("ignores a message from a foreign frame (event.source !== window)", () => {
    set(true, { source: { not: "window" } });
    assert.equal(gate.isCaptureEnabled(), false);
  });

  it("allows the transitional empty-origin case", () => {
    set(true, { origin: "" });
    assert.equal(gate.isCaptureEnabled(), true);
  });

  it("ignores a SET message whose source is not the isolated relay", () => {
    win.deliver({ source: gate.CAPTURE_GATE_SOURCE_MAIN, type: gate.CAPTURE_GATE_SET, enabled: true });
    assert.equal(gate.isCaptureEnabled(), false);
  });

  it("ignores an unrelated message type", () => {
    win.deliver({ source: gate.CAPTURE_GATE_SOURCE_ISOLATED, type: "ECHLY_SOMETHING_ELSE", enabled: true });
    assert.equal(gate.isCaptureEnabled(), false);
  });
});

describe("captureGate onCaptureEnabledOnce (Layer 2/3 recovery trigger)", () => {
  // The one-shot is a per-realm singleton that, by design, fires AT MOST ONCE for
  // the realm's lifetime and never resets (the pre-engagement drain/replay is a
  // one-time recovery). Earlier describe blocks here already drove the gate ON, so
  // in this shared-singleton test file the first OFF→ON has already happened. We
  // therefore assert the two invariants that hold regardless of prior firing.

  it("runs a subscriber IMMEDIATELY when capture is already ON (late subscriber)", () => {
    set(true);
    assert.equal(gate.isCaptureEnabled(), true);
    let ran = 0;
    gate.onCaptureEnabledOnce(() => {
      ran += 1;
    });
    assert.equal(ran, 1, "a subscriber registered while already-ON must run synchronously");
  });

  it("does NOT re-run a subscriber on a later pause→resume (OFF→ON→OFF→ON)", () => {
    set(true); // ensure ON + one-shot already fired for the realm
    let ran = 0;
    gate.onCaptureEnabledOnce(() => {
      ran += 1;
    });
    assert.equal(ran, 1); // fired immediately (already ON)
    set(false);
    set(true); // resume — must NOT fire the one-shot again
    assert.equal(ran, 1, "a resume must not re-fire the one-shot recovery");
  });

  it("swallows a throwing subscriber without breaking the gate", () => {
    set(true);
    assert.doesNotThrow(() => {
      gate.onCaptureEnabledOnce(() => {
        throw new Error("subscriber boom");
      });
    });
    // Gate still toggles normally afterward.
    set(false);
    assert.equal(gate.isCaptureEnabled(), false);
    set(true);
    assert.equal(gate.isCaptureEnabled(), true);
  });
});

describe("captureGate late-injection pull", () => {
  it("posted exactly one STATE_REQUEST at install so a late gate can learn the value", () => {
    // Snapshotted in the `before` hook before beforeEach clears the post log.
    assert.equal(installPostedStateRequests, 1);
  });

  it("installCaptureGate is idempotent — a repeat call posts no new STATE_REQUEST", () => {
    win.posted.length = 0;
    gate.installCaptureGate(); // already installed in `before`
    const reqs = win.posted.filter(
      (m) => m && typeof m === "object" && (m as { type?: unknown }).type === gate.CAPTURE_GATE_STATE_REQUEST,
    );
    assert.equal(reqs.length, 0);
  });
});
