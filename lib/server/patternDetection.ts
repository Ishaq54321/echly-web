/**
 * Lightweight, high-confidence regex pattern detection for structural commands.
 * Deterministic only. No fuzzy NLP. No guessing.
 */

function trim(s: string): string {
  return s.trim();
}

/** Matches "change X to Y" (case insensitive). Does not match "change color from X to Y". */
export function detectChangePattern(
  transcript: string
): { type: "change"; from: string; to: string } | null {
  const t = transcript.trim();
  if (!t) return null;
  const m = t.match(/^\s*change\s+(?!color\s+from)(.+?)\s+to\s+(.+)\s*$/is);
  if (!m) return null;
  const from = trim(m[1]);
  const to = trim(m[2]);
  if (!from || !to) return null;
  return { type: "change", from, to };
}

/** Matches "replace X with Y" (case insensitive). */
export function detectReplacePattern(
  transcript: string
): { type: "replace"; from: string; to: string } | null {
  const t = transcript.trim();
  if (!t) return null;
  const m = t.match(/^\s*replace\s+(.+?)\s+with\s+(.+)\s*$/is);
  if (!m) return null;
  const from = trim(m[1]);
  const to = trim(m[2]);
  if (!from || !to) return null;
  return { type: "replace", from, to };
}

/** Matches "remove X" (case insensitive). */
export function detectRemovePattern(
  transcript: string
): { type: "remove"; target: string } | null {
  const t = transcript.trim();
  if (!t) return null;
  const m = t.match(/^\s*remove\s+(.+)\s*$/i);
  if (!m) return null;
  const target = trim(m[1]);
  if (!target) return null;
  return { type: "remove", target };
}

/** Matches "change color from X to Y" (case insensitive). */
export function detectColorChangePattern(
  transcript: string
): { type: "colorChange"; from: string; to: string } | null {
  const t = transcript.trim();
  if (!t) return null;
  const m = t.match(/^\s*change\s+color\s+from\s+(.+?)\s+to\s+(.+)\s*$/is);
  if (!m) return null;
  const from = trim(m[1]);
  const to = trim(m[2]);
  if (!from || !to) return null;
  return { type: "colorChange", from, to };
}

export type DetectedPattern =
  | { type: "change"; from: string; to: string }
  | { type: "replace"; from: string; to: string }
  | { type: "remove"; target: string }
  | { type: "colorChange"; from: string; to: string };

export function detectHighConfidencePatterns(transcript: string): {
  detectedPatterns: DetectedPattern[];
} {
  const detectedPatterns: DetectedPattern[] = [];
  const change = detectChangePattern(transcript);
  if (change) detectedPatterns.push(change);
  const replace = detectReplacePattern(transcript);
  if (replace) detectedPatterns.push(replace);
  const remove = detectRemovePattern(transcript);
  if (remove) detectedPatterns.push(remove);
  const colorChange = detectColorChangePattern(transcript);
  if (colorChange) detectedPatterns.push(colorChange);
  return { detectedPatterns };
}
