/**
 * Unit tests for the AI-analysis output sanitization helpers.
 * Run with: node --import tsx --test lib/ai/analysisSanitize.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SIGNAL_RELATIONS,
  clampConfidence,
  composeFixSuggestion,
  sanitizeOut,
  sanitizeRelation,
  sanitizeSteps,
} from "./analysisSanitize";

test("sanitizeOut trims, caps, and rejects non-strings", () => {
  assert.equal(sanitizeOut("  hello  ", 10), "hello");
  assert.equal(sanitizeOut("abcdef", 3), "abc");
  assert.equal(sanitizeOut(42, 10), "");
  assert.equal(sanitizeOut(null, 10), "");
  assert.equal(sanitizeOut(undefined, 10), "");
});

test("sanitizeSteps strips model-added enumeration and bullets", () => {
  assert.deepEqual(
    sanitizeSteps(["1. Check the logs", "(2) Retry the request", "- Verify input", "• Ship it"], 5, 100),
    ["Check the logs", "Retry the request", "Verify input", "Ship it"]
  );
});

test("sanitizeSteps drops empties/non-strings and caps count + length", () => {
  assert.deepEqual(sanitizeSteps(["", "  ", 7, null, "ok"], 5, 100), ["ok"]);
  assert.deepEqual(sanitizeSteps(["a", "b", "c"], 2, 100), ["a", "b"]);
  assert.deepEqual(sanitizeSteps(["abcdef"], 5, 3), ["abc"]);
  assert.deepEqual(sanitizeSteps("not an array", 5, 100), []);
});

test("composeFixSuggestion joins cause + numbered steps; cause-only when no steps", () => {
  assert.equal(
    composeFixSuggestion("Root cause.", ["Do A", "Do B"]),
    "Root cause. Suggested fix: 1. Do A 2. Do B"
  );
  assert.equal(composeFixSuggestion("Root cause.", []), "Root cause.");
});

test("clampConfidence clamps to [0,1] and rejects non-finite", () => {
  assert.equal(clampConfidence(0.5), 0.5);
  assert.equal(clampConfidence(-1), 0);
  assert.equal(clampConfidence(2), 1);
  assert.equal(clampConfidence(NaN), null);
  assert.equal(clampConfidence("0.5"), null);
  assert.equal(clampConfidence(undefined), null);
});

test("sanitizeRelation passes every allowed verdict through unchanged", () => {
  for (const v of SIGNAL_RELATIONS) {
    assert.equal(sanitizeRelation(v, true), v);
    assert.equal(sanitizeRelation(v, false), v);
  }
});

test("sanitizeRelation fallback depends on the path: anchors → related, none → no_signal", () => {
  // Fault path: malformed verdict must not suppress a real cause.
  assert.equal(sanitizeRelation("banana", true), "related");
  assert.equal(sanitizeRelation(undefined, true), "related");
  // No-anchor path: nothing captured to relate to — defaulting to "related"
  // would fabricate a connection.
  assert.equal(sanitizeRelation("banana", false), "no_signal");
  assert.equal(sanitizeRelation(undefined, false), "no_signal");
});
