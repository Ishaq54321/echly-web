/**
 * Copy Correction — Fixes speech transcription errors for COPY_CHANGE instructions.
 * Replaces STT errors (e.g. "but tribes us") with matched DOM text (e.g. "What Drives Us").
 * Anchors to DOM scope first (headings), then nearby, viewport, OCR.
 */

import type { SpatialContext } from "./spatial-context-builder";
import { getSpatialScopeLines } from "./spatial-context-builder";
import { bestMatchInCorpus, fuzzySimilarity } from "./fuzzy-similarity";

/** Minimum similarity to accept a copy correction (speech → DOM). */
const COPY_CORRECTION_THRESHOLD = 0.75;

/** Ignore phrase chunks shorter than this for matching. */
const MIN_PHRASE_LENGTH = 4;

export interface InstructionWithIntent {
  intent: string;
  entity: string;
  action: string;
  confidence: number;
}

/**
 * Find best match for a spoken phrase across spatial scopes in priority order (dom → nearby → viewport → ocr).
 * Returns first match with similarity >= threshold so DOM headings are preferred.
 */
function bestMatchInSpatialScopes(
  phrase: string,
  scopeLines: { text: string; source: "dom" | "nearby" | "viewport" | "ocr" }[],
  threshold: number
): { similarity: number; matchedText: string; source: "dom" | "nearby" | "viewport" | "ocr" } | null {
  let best: { similarity: number; matchedText: string; source: "dom" | "nearby" | "viewport" | "ocr" } | null = null;
  for (const { text, source } of scopeLines) {
    if (!text.trim()) continue;
    const { similarity, matchedText } = bestMatchInCorpus(phrase, text, {
      minChunkLength: MIN_PHRASE_LENGTH,
      maxChunkLength: 100,
    });
    if (similarity >= threshold && matchedText && (!best || similarity > best.similarity)) {
      best = { similarity, matchedText, source };
    }
  }
  return best;
}

/**
 * Correct COPY_CHANGE instructions by replacing speech-error phrases with
 * best fuzzy match from spatial context. Only runs when intent === COPY_CHANGE.
 * Compares against domScopeText, nearbyScopeText, viewportScopeText, OCR in order (Levenshtein).
 */
export function correctCopyInInstructions<T extends InstructionWithIntent>(
  instructions: T[],
  spatialContext: SpatialContext
): T[] {
  const scopeLines = getSpatialScopeLines(spatialContext);
  const hasAnyScope = scopeLines.some((s) => s.text.trim().length > 0);
  if (!hasAnyScope) return instructions;

  return instructions.map((inst) => {
    if (inst.intent !== "COPY_CHANGE") return inst;

    const phrasesToCheck: string[] = [];
    if (inst.entity && inst.entity.trim().length >= MIN_PHRASE_LENGTH) {
      phrasesToCheck.push(inst.entity.trim());
    }
    const actionWords = inst.action.split(/\s+/).filter(Boolean);
    if (actionWords.length >= 2 && actionWords.length <= 8) {
      const actionPhrase = actionWords.join(" ");
      if (actionPhrase.length >= MIN_PHRASE_LENGTH) phrasesToCheck.push(actionPhrase);
    }
    for (const w of actionWords) {
      if (w.length >= MIN_PHRASE_LENGTH) phrasesToCheck.push(w);
    }

    let correctedEntity = inst.entity;
    let correctedAction = inst.action;

    for (const phrase of phrasesToCheck) {
      const match = bestMatchInSpatialScopes(phrase, scopeLines, COPY_CORRECTION_THRESHOLD);
      if (!match || !match.matchedText) continue;
      const { matchedText } = match;
      if (inst.entity.includes(phrase) || fuzzySimilarity(inst.entity, phrase) > 0.6) {
        correctedEntity = inst.entity.replace(phrase, matchedText).trim() || matchedText;
      }
      if (inst.action.includes(phrase) || fuzzySimilarity(inst.action, phrase) > 0.6) {
        correctedAction = correctedAction.replace(phrase, matchedText).trim() || correctedAction;
      }
    }

    if (correctedEntity !== inst.entity || correctedAction !== inst.action) {
      return { ...inst, entity: correctedEntity, action: correctedAction };
    }
    return inst;
  });
}
