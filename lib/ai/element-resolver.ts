/**
 * Element Resolver — Resolves vague UI references to concrete text from spatial context.
 * Priority: domScopeText → nearbyScopeText → viewportScopeText → screenshotOCRText.
 * Uses keyword-in-DOM matching, heading priority (h1/h2/h3), and interactive element priority.
 */

import { echlyDebug } from "@/lib/utils/logger";
import type { SpatialContext } from "./spatial-context-builder";
import { getSpatialScopeLines } from "./spatial-context-builder";
import { fuzzySimilarity } from "./fuzzy-similarity";
import type { PipelineContext } from "@/lib/server/pipelineContext";

/** Entity types we resolve (e.g. "that button" → "Start Free Trial"). */
export const ENTITY_PHRASES = [
  "title",
  "button",
  "icon",
  "card",
  "section",
  "logo",
  "headline",
  "cta",
  "image",
  "form",
] as const;

/** Minimum character length for a candidate token (ignore micro-tokens). */
const MIN_CANDIDATE_LENGTH = 4;

/** Reject stopword and very short candidates. */
const STOPWORDS = new Set([
  "the",
  "and",
  "with",
  "from",
  "this",
  "that",
  "for",
  "you",
  "your",
  "our",
]);

/** Maximum phrase length in characters (safety guard). */
const MAX_PHRASE_CHARS = 40;
/** Maximum n-gram size in words. */
const MAX_NGRAM = 3;
/** UI overlay words to reject in phrase candidates. */
const UI_OVERLAY_WORDS = ["capture", "cancel", "retake"];

/** Minimum combined score to accept a resolution; below this return null. */
const MIN_RESOLUTION_SCORE = 0.65;

/** Extra score when entity refers to title/heading and candidate is from DOM scope (h1/h2/h3). */
const HEADING_BOOST = 0.2;
/** Phrases that get heading boost when candidate is from DOM. */
const HEADING_PHRASES = ["title", "heading", "section title"];

/** Boost when transcript/entity keywords appear in DOM candidate text. */
const KEYWORD_IN_DOM_BOOST = 0.15;
/** Boost when entity is button/link/field/input and candidate is in context buttons/interactive/formFields. */
const INTERACTIVE_BOOST = 0.2;

/** Weight for text similarity in scoring. */
const TEXT_WEIGHT = 0.6;
/** Weight for spatial proximity (source order: dom > nearby > viewport > ocr). */
const SPATIAL_WEIGHT = 0.3;
/** Weight for hierarchy (prefer more specific / longer matches). */
const HIERARCHY_WEIGHT = 0.1;

/** Confidence when entity was resolved from DOM or nearby. */
const CONFIDENCE_GROUNDED = 0.9;
/** Confidence when entity was resolved from viewport or OCR. */
const CONFIDENCE_VIEWPORT_OCR = 0.75;
/** Cap confidence when entity is vague and not resolved. */
const CONFIDENCE_VAGUE_CAP = 0.65;
/** Entity phrases considered vague (cap confidence when unresolved). */
const VAGUE_ENTITY_PATTERN = /^(that|this|the)\s+(button|thing|one|element|it)$|^unknown$/i;

/** Source index for spatial proximity (0 = best). */
const SOURCE_ORDER: Record<"dom" | "nearby" | "viewport" | "ocr", number> = {
  dom: 0,
  nearby: 1,
  viewport: 2,
  ocr: 3,
};

function spatialProximityScore(source: "dom" | "nearby" | "viewport" | "ocr"): number {
  const order = SOURCE_ORDER[source];
  return Math.max(0, 1 - order * 0.25);
}

function domHierarchyWeight(candidateText: string): number {
  const len = candidateText.trim().length;
  if (len <= 2) return 0.3;
  if (len <= 10) return 0.6;
  if (len <= 40) return 0.9;
  return 1;
}

function isRejectedCandidate(text: string): boolean {
  const t = text.trim().toLowerCase();
  return t.length < MIN_CANDIDATE_LENGTH || STOPWORDS.has(t);
}

/** Extract clean word tokens from DOM scope text (ignore punctuation, trim). */
function getCleanTokens(text: string): string[] {
  return text
    .split(/[\s·,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Generate phrase candidates as n-grams (n=1,2,3), deduplicated, order preserved. */
function getPhraseCandidates(tokens: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (let n = 1; n <= MAX_NGRAM && n <= tokens.length; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const phrase = tokens.slice(i, i + n).join(" ");
      if (!seen.has(phrase)) {
        seen.add(phrase);
        out.push(phrase);
      }
    }
  }
  return out;
}

/** Reject phrase candidates: only stopwords, too long, or UI overlay text. */
function isRejectedPhraseCandidate(phrase: string): boolean {
  const t = phrase.trim();
  if (t.length > MAX_PHRASE_CHARS) return true;
  const lower = t.toLowerCase();
  if (UI_OVERLAY_WORDS.some((w) => lower.includes(w))) return true;
  const words = lower.split(/[\s·,;]+/).filter(Boolean);
  if (words.length === 0) return true;
  if (words.every((w) => STOPWORDS.has(w))) return true;
  if (words.length === 1 && words[0].length < MIN_CANDIDATE_LENGTH) return true;
  return false;
}

/** Extract significant keywords (min length 3, not stopwords) for keyword-in-DOM matching. */
function extractKeywords(phrase: string, transcript?: string): Set<string> {
  const combined = [phrase, transcript ?? ""].join(" ").toLowerCase();
  const words = combined.split(/[\s·,;]+/).filter(Boolean);
  const out = new Set<string>();
  for (const w of words) {
    if (w.length >= 3 && !STOPWORDS.has(w)) out.add(w);
  }
  return out;
}

/** True if entity phrase refers to a heading/title (prefer DOM scope). */
function isHeadingPhrase(phrase: string): boolean {
  const p = phrase.trim().toLowerCase();
  return HEADING_PHRASES.some((h) => p.includes(h));
}

/** True if entity phrase refers to an interactive element (button, link, field, input). */
function isInteractivePhrase(phrase: string): boolean {
  const p = phrase.trim().toLowerCase();
  return /\b(button|link|field|input|cta)\b/.test(p);
}

/** Collect label/text from buttons, interactiveElements, formFields for interactive boost. */
function getInteractiveLabelsFromContext(context: PipelineContext | null | undefined): Set<string> {
  if (!context) return new Set();
  const labels = new Set<string>();
  const add = (arr: Array<{ label?: string | null; text?: string | null }> | undefined) => {
    if (!Array.isArray(arr)) return;
    for (const el of arr) {
      const t = el.label ?? el.text;
      if (t && typeof t === "string" && t.trim().length >= 2) labels.add(t.trim().toLowerCase());
    }
  };
  add(context.buttons);
  add(context.interactiveElements);
  add(context.formFields);
  add(context.elements);
  add(context.visibleElements);
  return labels;
}

export interface ResolvedElement {
  /** Resolved label/text for the element. */
  resolvedText: string;
  /** Source scope (dom, nearby, viewport, ocr). */
  source: "dom" | "nearby" | "viewport" | "ocr";
  /** Combined score 0–1. */
  score: number;
}

export interface ResolveElementOptions {
  /** Optional transcript; keywords from transcript + entity prefer DOM matches. */
  transcript?: string;
  /** Labels from context.buttons / interactiveElements / formFields; prefer when entity is button/link/field/input. */
  interactiveLabels?: Set<string>;
}

/**
 * Resolve a vague entity phrase (e.g. "that button", "this title") to the best
 * matching element text. Priority: DOM → nearby → viewport → OCR.
 * Applies keyword-in-DOM boost, heading priority (title/heading/section title → DOM),
 * and interactive priority (button/link/field/input → prefer context buttons/interactive/formFields).
 */
export function resolveElement(
  entityPhrase: string,
  spatialContext: SpatialContext,
  options?: ResolveElementOptions
): ResolvedElement | null {
  const phrase = entityPhrase.trim();
  if (!phrase) return null;

  const scopeLines = getSpatialScopeLines(spatialContext);
  if (scopeLines.length === 0) return null;

  const keywords = extractKeywords(phrase, options?.transcript);
  const interactiveLabels = options?.interactiveLabels ?? new Set<string>();
  const wantsHeading = isHeadingPhrase(phrase);
  const wantsInteractive = isInteractivePhrase(phrase);

  const candidates: { text: string; source: "dom" | "nearby" | "viewport" | "ocr"; score: number }[] = [];
  const debugPhraseCandidates: string[] = [];

  for (const { text, source } of scopeLines) {
    if (!text) continue;
    const textLower = text.toLowerCase();
    const tokens = getCleanTokens(text);
    const phraseCandidates = getPhraseCandidates(tokens);

    for (const candidatePhrase of phraseCandidates) {
      if (isRejectedPhraseCandidate(candidatePhrase)) continue;
      debugPhraseCandidates.push(candidatePhrase);
      const textSim = fuzzySimilarity(phrase, candidatePhrase);
      const spatialScore = spatialProximityScore(source);
      const hierarchyScore = domHierarchyWeight(candidatePhrase);
      let score =
        TEXT_WEIGHT * textSim + SPATIAL_WEIGHT * spatialScore + HIERARCHY_WEIGHT * hierarchyScore;
      if (wantsHeading && source === "dom") score += HEADING_BOOST;
      if (source === "dom" && keywords.size > 0) {
        const phraseLower = candidatePhrase.toLowerCase();
        if ([...keywords].some((k) => phraseLower.includes(k) || k.includes(phraseLower))) score += KEYWORD_IN_DOM_BOOST;
      }
      if (wantsInteractive && interactiveLabels.has(candidatePhrase.trim().toLowerCase())) score += INTERACTIVE_BOOST;
      candidates.push({ text: candidatePhrase, source, score });
    }

    const fullText = text.slice(0, 80).trim();
    if (fullText.length >= MIN_CANDIDATE_LENGTH && fullText.length <= MAX_PHRASE_CHARS && !isRejectedPhraseCandidate(fullText)) {
      const fullSim = fuzzySimilarity(phrase, text);
      if (fullSim >= 0.4) {
        const spatialScore = spatialProximityScore(source);
        const hierarchyScore = domHierarchyWeight(text);
        let score =
          TEXT_WEIGHT * fullSim + SPATIAL_WEIGHT * spatialScore + HIERARCHY_WEIGHT * hierarchyScore;
        if (wantsHeading && source === "dom") score += HEADING_BOOST;
        if (source === "dom" && keywords.size > 0) {
          if ([...keywords].some((k) => textLower.includes(k))) score += KEYWORD_IN_DOM_BOOST;
        }
        if (wantsInteractive && interactiveLabels.has(fullText.trim().toLowerCase())) score += INTERACTIVE_BOOST;
        candidates.push({ text: fullText, source, score });
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  const winner = candidates[0];

  if (process.env.NODE_ENV === "development") {
    echlyDebug("PHRASE CANDIDATES", [...new Set(debugPhraseCandidates)]);
    echlyDebug("FILTERED CANDIDATES", candidates.slice(0, 5).map((c) => ({ text: c.text, score: c.score })));
  }

  if (winner.score < MIN_RESOLUTION_SCORE) {
    if (process.env.NODE_ENV === "development") {
      echlyDebug("FINAL RESOLUTION SCORE", { entityPhrase, bestScore: winner.score, threshold: MIN_RESOLUTION_SCORE, resolved: null });
    }
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    echlyDebug("FINAL RESOLUTION SCORE", { entityPhrase, resolvedText: winner.text, source: winner.source, score: winner.score });
  }

  return {
    resolvedText: winner.text,
    source: winner.source,
    score: winner.score,
  };
}

export interface ResolveInstructionsEntitiesOptions {
  /** Pipeline context for interactive element priority (buttons, interactiveElements, formFields). */
  context?: PipelineContext | null;
  /** Transcript for keyword-in-DOM matching. */
  transcript?: string;
}

/**
 * Resolve entity fields in extracted instructions using spatial context.
 * Entity matching priority: domScopeText → nearbyScopeText → viewportScopeText → screenshotOCRText.
 * Updates confidence: 0.9+ when resolved from DOM/nearby, 0.75+ from viewport/OCR, cap at 0.65 when entity is vague and unresolved.
 */
export function resolveInstructionsEntities<T extends { entity: string; confidence?: number }>(
  instructions: T[],
  spatialContext: SpatialContext,
  options?: ResolveInstructionsEntitiesOptions
): T[] {
  if (!instructions.length) return instructions;

  const interactiveLabels = getInteractiveLabelsFromContext(options?.context);
  const transcript = options?.transcript ?? "";

  return instructions.map((inst) => {
    const resolved = resolveElement(inst.entity, spatialContext, {
      transcript,
      interactiveLabels,
    });
    const currentConf = typeof inst.confidence === "number" && !Number.isNaN(inst.confidence) ? inst.confidence : 0.5;

    if (resolved && resolved.score >= 0.5 && resolved.resolvedText) {
      const confidence =
        resolved.source === "dom" || resolved.source === "nearby"
          ? Math.max(currentConf, CONFIDENCE_GROUNDED)
          : Math.max(currentConf, CONFIDENCE_VIEWPORT_OCR);
      return { ...inst, entity: resolved.resolvedText, confidence };
    }

    if (VAGUE_ENTITY_PATTERN.test(inst.entity.trim())) {
      const confidence = Math.min(currentConf, CONFIDENCE_VAGUE_CAP);
      return { ...inst, confidence };
    }

    return inst;
  });
}
