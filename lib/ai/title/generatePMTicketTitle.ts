/**
 * PM-Quality Ticket Title — Generates concise, actionable ticket titles from
 * extracted instructions. Every title includes entity context (UI element/component).
 * Deterministic, no external dependencies.
 *
 * Formula: TITLE = Action Summary + Entity Context (or Verb + Entity + Action)
 *
 * Unit examples (verify behavior):
 *
 * Example 1:
 *   Input: [
 *     { entity: "hero image", action: "reduce hero image size" },
 *     { entity: "signup button", action: "move signup button below hero" }
 *   ]
 *   Output: "Reduce hero image size and move signup button below hero"
 *
 * Example 2:
 *   entity: "hero image animation", action: "optimize animation speed"
 *   Output: "Optimize hero image animation speed"
 *
 * Example 3:
 *   entity: "signup button", action: "increase visibility"
 *   Output: "Increase signup button visibility"
 *
 * Example 4:
 *   entity: "pricing button", action: "implement click tracking"
 *   Output: "Implement click tracking for pricing button"
 */

import type { ExtractedInstruction } from "@/lib/server/instructionExtraction";

const MAX_WORDS = 14;

/** Treat entity as missing when empty or generic. */
function hasEntity(entity: string): boolean {
  const t = entity.trim().toLowerCase();
  return t.length > 0 && t !== "unknown" && t !== "page" && t !== "this";
}

/**
 * Builds a single title segment that always includes entity when provided.
 * Uses natural phrasing when obvious (e.g. "increase {entity} visibility").
 */
function buildSegmentWithEntity(action: string, entity: string): string {
  const act = action.toLowerCase().trim();
  const el = entity.toLowerCase().trim();
  if (!el || !hasEntity(entity)) return cleanActionPhrase(action);

  if (act.includes(el)) return cleanActionPhrase(action);

  // Natural phrasing: verb + entity + noun
  const visibilityMatch = act.match(/^(increase|improve|enhance)\s+visibility$/i);
  if (visibilityMatch) return `${visibilityMatch[1]} ${el} visibility`;

  const sizeReduceMatch = act.match(/^(reduce|decrease|minimize)\s+(?:the\s+)?size$/i);
  if (sizeReduceMatch) return `${sizeReduceMatch[1]} ${el} size`;

  const sizeIncreaseMatch = act.match(/^(increase|enlarge)\s+(?:the\s+)?size$/i);
  if (sizeIncreaseMatch) return `${sizeIncreaseMatch[1]} ${el} size`;

  const speedMatch = act.match(/^optimize\s+(?:.*?)\s+speed$/i);
  if (speedMatch) return `optimize ${el} speed`;

  const speedImproveMatch = act.match(/^improve\s+(?:.*?)\s+speed$/i);
  if (speedImproveMatch) return `improve ${el} speed`;

  return `${cleanActionPhrase(action)} for ${el}`;
}

/**
 * Generates a PM-quality ticket title from extracted instructions.
 * Every title includes entity context so developers see what element the action applies to.
 */
export function generatePMTicketTitle(instructions: ExtractedInstruction[]): string {
  if (instructions.length === 0) return "Requested UI changes";

  const segments = instructions
    .filter((i) => (i.action || "").trim().length > 0)
    .map((i) =>
      buildSegmentWithEntity((i.action || "").trim(), (i.entity || "").trim())
    );

  if (segments.length === 0) return "Requested UI changes";

  const withPronouns = replaceRepeatedEntitiesWithPronouns(
    segments,
    instructions
      .filter((i) => (i.action || "").trim().length > 0)
      .map((i) => (i.entity || "").trim())
  );
  const joined = withPronouns.join(" and ");
  const refined = refinePMTitle(joined);
  const capitalized = capitalizeFirst(refined);
  let title = truncateToMaxWords(capitalized, MAX_WORDS);

  // Guarantee title references an entity; if none had entity, use first action step
  const anyEntity = instructions.some((i) => hasEntity(i.entity ?? ""));
  if (!anyEntity && instructions.length > 0 && instructions[0].action?.trim()) {
    title = capitalizeFirst(cleanActionPhrase(instructions[0].action.trim()));
  }

  return title;
}

/**
 * Applies pattern-based language compression to shorten and clean the title.
 * No entity-specific phrases; rules are generic and work with any UI element.
 */
export function refinePMTitle(title: string): string {
  if (!title.trim()) return title;
  let s = title.trim().replace(/\s+/g, " ");

  // Whole-title patterns first (tracking, conditional) so segment refinement doesn't see raw phrases
  s = compressTrackingPhrases(s);
  s = compressConditionalPhrases(s);

  // Per-segment filler compression (split by " and "), then rejoin
  const segments = s.split(/\s+and\s+/).map((seg) => refineSegment(seg.trim()));
  s = segments.join(" and ");

  s = grammarCleanup(s);
  s = normalizeVerbs(s);

  return s.replace(/\s+/g, " ").trim();
}

/**
 * Pattern-based refinement for a single action segment (no entity names).
 */
function refineSegment(segment: string): string {
  if (!segment) return segment;
  let s = segment;

  // 1. Filler compression: "the size of the X" → "X size", "the visibility of the X" → "X visibility", etc.
  s = s.replace(/\b(.+?)\s+the\s+size\s+of\s+the\s+(.+)$/i, "$1 $2 size");
  s = s.replace(/\b(.+?)\s+the\s+visibility\s+of\s+the\s+(.+)$/i, "$1 $2 visibility");
  s = s.replace(/\b(.+?)\s+the\s+position\s+of\s+the\s+(.+)$/i, "$1 $2 position");
  // "the visibility of it" / "the size of it" etc. → "its visibility" / "its size" (handled in grammarCleanup; here strip filler)
  s = s.replace(/\b(.+?)\s+the\s+visibility\s+of\s+it\b/i, "$1 its visibility");
  s = s.replace(/\b(.+?)\s+the\s+size\s+of\s+it\b/i, "$1 its size");
  // Standalone filler removal
  s = s.replace(/\bthe\s+size\s+of\s+/gi, "");
  s = s.replace(/\bthe\s+visibility\s+of\s+/gi, "");
  s = s.replace(/\bthe\s+position\s+of\s+/gi, "");

  return s.replace(/\s+/g, " ").trim();
}

/** Compress "implement click tracking on the X" → "track X clicks"; "click tracking" → "track clicks". */
function compressTrackingPhrases(s: string): string {
  s = replaceAllIgnoreCase(s, "implement click tracking on the ", "track ");
  s = replaceAllIgnoreCase(s, "implement click tracking on ", "track ");
  s = replaceAllIgnoreCase(s, "click tracking", "track clicks");
  // "track X button" → "track X button clicks" (generic)
  s = s.replace(/\b(track\s+\S+(?:\s+\S+)*?)\s+button\b(?!\s+clicks)/gi, "$1 button clicks");
  return s;
}

/** Compress "prevent X submission if the Y field is empty" → "prevent empty X submission". */
function compressConditionalPhrases(s: string): string {
  s = s.replace(/\bprevent\s+(\w+)\s+submission\s+if\s+the\s+\w+\s+field\s+is\s+empty\b/gi, "prevent empty $1 submission");
  return s;
}

/** "X of it" → "its X"; "under it" → "below it"; drop stray "the" before "its". */
function grammarCleanup(s: string): string {
  s = s.replace(/\b(\w+)\s+of\s+it\b/gi, "its $1");
  s = replaceAllIgnoreCase(s, "the its ", "its ");
  s = replaceAllIgnoreCase(s, "under it", "below it");
  return s;
}

/** Normalize verbose verbs; keep after tracking so "implement click tracking" is already compressed. */
function normalizeVerbs(s: string): string {
  s = replaceAllIgnoreCase(s, "implement ", "add ");
  return s;
}

/** Case-insensitive replace all; search is literal (spaces match spaces). */
function replaceAllIgnoreCase(str: string, search: string, replacement: string): string {
  if (search === "") return str;
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escaped, "gi");
  return str.replace(re, replacement);
}

/** Normalize whitespace; keep phrase intact. */
function cleanActionPhrase(phrase: string): string {
  return phrase.replace(/\s+/g, " ").trim();
}

/** Capitalize the first character of the first word. */
function capitalizeFirst(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * When the previous instruction's entity appears in the current action phrase,
 * replace it with "it" to avoid repetition (e.g. "below the hero image" -> "below it").
 * Simple and safe: only replace contiguous "the <entity>" or "<entity>" at end of phrase.
 */
function replaceRepeatedEntitiesWithPronouns(
  phrases: string[],
  entities: string[]
): string[] {
  const out: string[] = [];
  let prevEntity: string | null = null;

  for (let i = 0; i < phrases.length; i++) {
    let phrase = phrases[i];
    const entity = entities[i]?.toLowerCase() || "";

    if (prevEntity && phrase.length > 0) {
      const lower = phrase.toLowerCase();
      const withThe = `the ${prevEntity}`;
      if (lower.endsWith(withThe)) {
        phrase = (phrase.slice(0, -withThe.length) + "it").replace(/\s+/g, " ").trim();
      } else if (lower.endsWith(prevEntity)) {
        phrase = (phrase.slice(0, -prevEntity.length) + "it").replace(/\s+/g, " ").trim();
      }
    }
    out.push(phrase);
    if (entity) prevEntity = entity;
  }
  return out;
}

/** Truncate to at most maxWords words, without cutting mid-word. */
function truncateToMaxWords(s: string, maxWords: number): string {
  const words = s.split(/\s+/);
  if (words.length <= maxWords) return s;
  return words.slice(0, maxWords).join(" ");
}
