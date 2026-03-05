/**
 * Clause Splitter — Perception layer.
 * Splits compound speech instructions deterministically before AI extraction.
 * No AI; preserves original wording.
 */

/**
 * Splits a transcript into clauses on conjunctions and comma pauses.
 * Used to separate compound instructions (e.g. "X and Y" → ["X", "Y"]).
 *
 * Delimiters: "and", "then", "also", "after that", comma.
 * Preserves wording, trims whitespace, drops empty clauses.
 */
export function splitTranscriptIntoClauses(transcript: string): string[] {
  if (!transcript || typeof transcript !== "string") return [];
  const trimmed = transcript.trim();
  if (!trimmed) return [];

  // Split on: " and ", " then ", " also ", " after that ", comma (with optional spaces)
  // Word boundaries avoid splitting "brand", "another", "sometime", etc.
  const clauseSeparators = /\s+(?:and|then|also)\s+|\s+after\s+that\s+|\s*,\s*/gi;
  const raw = trimmed.split(clauseSeparators);

  const clauses = raw
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return clauses;
}
