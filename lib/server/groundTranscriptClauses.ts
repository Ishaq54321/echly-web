/**
 * Grounding — Lightweight step between Perception and Understanding.
 * Pre-detects entities, actions, and UI properties from transcript clauses
 * using fuzzy matching against DOM phrases. No AI; deterministic; <2ms.
 */

export interface GroundingInput {
  clauses: string[];
  domPhrases: string[];
}

export interface GroundedClause {
  clause: string;
  entityCandidates: string[];
  action: string | null;
  property: string | null;
  confidence: number;
}

// Action verbs (detected as whole-word matches, case-insensitive)
const ACTION_VERBS = [
  "increase",
  "decrease",
  "change",
  "update",
  "remove",
  "add",
  "align",
  "move",
  "resize",
] as const;

const ACTION_REGEX = new RegExp(
  "\\b(" + ACTION_VERBS.join("|") + ")\\b",
  "gi"
);

// UI properties (whole-word, case-insensitive)
const UI_PROPERTIES = [
  "size",
  "color",
  "text",
  "position",
  "padding",
  "margin",
  "font",
  "alignment",
] as const;

const PROPERTY_REGEX = new RegExp(
  "\\b(" + UI_PROPERTIES.join("|") + ")\\b",
  "gi"
);

const DEBUG = typeof process !== "undefined" && process.env?.DEBUG_GROUNDING === "true";

function log(msg: string): void {
  if (DEBUG) console.log(`[GROUNDING] ${msg}`);
}

/**
 * Finds entity candidates by matching clause text against domPhrases.
 * Uses substring containment (clause contains phrase or phrase in clause); prefers longer matches.
 */
function matchEntities(clause: string, domPhrases: string[]): string[] {
  const lower = clause.toLowerCase().trim();
  const candidates: { phrase: string; len: number }[] = [];

  for (const phrase of domPhrases) {
    const p = (phrase ?? "").trim();
    if (!p) continue;
    const pl = p.toLowerCase();
    if (!pl) continue;
    // Clause contains phrase (e.g. "increase logo size" contains "logo")
    if (lower.includes(pl)) {
      candidates.push({ phrase: p, len: pl.length });
      log(`detected entity: "${p}"`);
    }
  }

  // Prefer longer matches first, then by original order; dedupe by phrase
  candidates.sort((a, b) => b.len - a.len);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const { phrase } of candidates) {
    const key = phrase.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(phrase);
  }
  return out;
}

/**
 * Detects first action verb in clause.
 */
function matchAction(clause: string): string | null {
  const m = clause.match(ACTION_REGEX);
  if (m && m[0]) {
    const action = m[0].toLowerCase();
    log(`detected action: "${action}"`);
    return action;
  }
  return null;
}

/**
 * Detects first UI property in clause.
 */
function matchProperty(clause: string): string | null {
  const m = clause.match(PROPERTY_REGEX);
  if (m && m[0]) {
    const prop = m[0].toLowerCase();
    log(`detected property: "${prop}"`);
    return prop;
  }
  return null;
}

/**
 * Computes confidence 0–1 from presence of entity, action, property.
 */
function confidence(
  entityCount: number,
  hasAction: boolean,
  hasProperty: boolean
): number {
  let c = 0.3; // base
  if (entityCount > 0) c += 0.35;
  if (hasAction) c += 0.2;
  if (hasProperty) c += 0.15;
  return Math.min(1, Math.round(c * 100) / 100);
}

/**
 * Grounds each clause: entity candidates (from domPhrases), action verb, UI property.
 * No AI; deterministic; intended to run in <2ms.
 */
export function groundTranscriptClauses(input: GroundingInput): GroundedClause[] {
  const { clauses, domPhrases } = input;
  if (!Array.isArray(clauses) || clauses.length === 0) return [];

  const phrases = Array.isArray(domPhrases)
    ? domPhrases.filter((p): p is string => typeof p === "string")
    : [];

  const result: GroundedClause[] = [];

  for (const clause of clauses) {
    const c = typeof clause === "string" ? clause.trim() : "";
    if (!c) continue;

    const entityCandidates = matchEntities(c, phrases);
    const action = matchAction(c);
    const property = matchProperty(c);

    result.push({
      clause: c,
      entityCandidates,
      action,
      property,
      confidence: confidence(entityCandidates.length, !!action, !!property),
    });
  }

  return result;
}
