/**
 * Tests for STT vocabulary seeding.
 * Run via: `npm run test:capture`.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildSttVocabularyPrompt } from "./sttVocabulary";

describe("buildSttVocabularyPrompt", () => {
  it("returns the base UI vocabulary with no context", () => {
    const prompt = buildSttVocabularyPrompt(null);
    assert.ok(prompt.includes("padding"));
    assert.ok(prompt.includes("hex color"));
    assert.ok(prompt.includes("CTA"));
    assert.ok(!prompt.includes("On-page names"));
  });

  it("seeds the clicked element's name and neighborhood names", () => {
    const prompt = buildSttVocabularyPrompt({
      semanticIdentifier: "Get Started",
      childrenList:
        '(2 meaningful descendants)\n1. button: "Sign up free" (color: #FFFFFF)\n2. p: "No credit card required"',
      siblingsList: 'h3 "Pro", button "Choose Pro"',
      pageH1: "Pricing that scales with you",
    });
    assert.ok(prompt.includes('"Get Started"'));
    assert.ok(prompt.includes('"Sign up free"'));
    assert.ok(prompt.includes('"Choose Pro"'));
    assert.ok(prompt.includes('"Pricing that scales with you"'));
  });

  it("excludes '(no label)' placeholders and dedupes", () => {
    const prompt = buildSttVocabularyPrompt({
      semanticIdentifier: "Choose Pro",
      childrenList: '1. div: "(no label)" (bg: #FFF)\n2. button: "Choose Pro"',
    });
    assert.ok(!prompt.includes("(no label)"));
    assert.equal(prompt.match(/"Choose Pro"/g)?.length, 1);
  });

  it("stays within the prompt cap", () => {
    const prompt = buildSttVocabularyPrompt({
      semanticIdentifier: "X".repeat(200),
      childrenList: Array.from({ length: 30 }, (_, i) => `${i}. p: "Item number ${i} with a fairly long label"`).join("\n"),
    });
    assert.ok(prompt.length <= 600);
  });
});
