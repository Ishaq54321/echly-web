/**
 * Smart context filtering for the extraction model.
 * Prioritizes UI text relevant to the transcript; respects existing token budget.
 * Used only for extraction input. Copy-correction and entity resolution use full spatial context.
 */

import type { SpatialContext } from "@/lib/ai/spatial-context-builder";
import { truncateForTokenBudget } from "@/lib/ai/pipelineTokenBudget";

/** Per-field character limits (same as truncateSpatialContext). */
const FIELD_LIMITS: Record<keyof SpatialContext, number> = {
  domScopeText: 1200,
  nearbyScopeText: 800,
  viewportScopeText: 1200,
  screenshotOCRText: 800,
};

/** Tokens shorter than this are dropped when considering relevance. */
const MIN_TOKEN_LENGTH = 3;

/** Terms that suggest UI elements (headings, buttons, labels). Prefer lines containing these. */
const UI_TERMS =
  /\b(heading|headings|button|buttons|label|labels|h1|h2|h3|title|titles|section|hero|link|links|input|form)\b/i;

function extractKeywords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= MIN_TOKEN_LENGTH);
  return new Set(words);
}

function scoreLine(line: string, keywords: Set<string>): number {
  const normalized = line.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (normalized.includes(kw)) score += 2;
  }
  if (UI_TERMS.test(line)) score += 1;
  return score;
}

/**
 * Filter a scope string: prefer lines that share keywords with the transcript
 * and lines that look like headings/buttons/labels. Drop very short tokens.
 * Returns content up to maxChars, with most relevant lines first.
 */
function filterScopeText(scopeText: string, keywords: Set<string>, maxChars: number): string {
  if (!scopeText || scopeText.trim().length === 0) return "";
  const lines = scopeText.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return "";

  const scored = lines.map((line) => {
    const tokens = line.split(/\s+/).filter((t) => t.length >= MIN_TOKEN_LENGTH);
    const cleaned = tokens.join(" ");
    return { line, score: scoreLine(cleaned || line, keywords) };
  });

  scored.sort((a, b) => b.score - a.score);
  const result: string[] = [];
  let total = 0;
  for (const { line } of scored) {
    if (total + line.length + 1 > maxChars) break;
    result.push(line);
    total += line.length + 1;
  }
  return truncateForTokenBudget(result.join("\n"), maxChars);
}

/**
 * Filter spatial context for the extraction model: prioritize lines that share
 * keywords with the transcript and prefer headings, buttons, labels.
 * Respects existing token budget. Copy-correction and entity resolution
 * should continue using the full (unfiltered) spatial context.
 */
export function filterRelevantContext(
  transcript: string,
  spatialContext: SpatialContext
): SpatialContext {
  const keywords = extractKeywords(transcript || "");

  return {
    domScopeText: filterScopeText(
      spatialContext.domScopeText,
      keywords,
      FIELD_LIMITS.domScopeText
    ),
    nearbyScopeText: filterScopeText(
      spatialContext.nearbyScopeText,
      keywords,
      FIELD_LIMITS.nearbyScopeText
    ),
    viewportScopeText: filterScopeText(
      spatialContext.viewportScopeText,
      keywords,
      FIELD_LIMITS.viewportScopeText
    ),
    screenshotOCRText: filterScopeText(
      spatialContext.screenshotOCRText,
      keywords,
      FIELD_LIMITS.screenshotOCRText
    ),
  };
}
