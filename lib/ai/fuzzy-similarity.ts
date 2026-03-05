/**
 * Local fuzzy text similarity (no external deps).
 * Used for element resolution and copy correction.
 */

/**
 * Levenshtein distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const row0 = new Array<number>(bn + 1);
  const row1 = new Array<number>(bn + 1);
  for (let j = 0; j <= bn; j++) row0[j] = j;

  for (let i = 1; i <= an; i++) {
    row1[0] = i;
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row1[j] = Math.min(
        row1[j - 1] + 1,
        row0[j] + 1,
        row0[j - 1] + cost
      );
    }
    for (let j = 0; j <= bn; j++) row0[j] = row1[j];
  }
  return row0[bn];
}

/**
 * Normalized similarity 0–1 (1 = identical).
 * Uses 1 - (distance / maxLen) so that longer matches aren't over-penalized.
 */
export function fuzzySimilarity(a: string, b: string): number {
  const sa = a.trim();
  const sb = b.trim();
  if (sa === sb) return 1;
  if (!sa || !sb) return 0;
  const maxLen = Math.max(sa.length, sb.length);
  const dist = levenshtein(sa, sb);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Best similarity between a phrase and any substring of a corpus (by word chunks).
 * Returns { similarity, matchedText }.
 */
export function bestMatchInCorpus(
  phrase: string,
  corpus: string,
  options?: { minChunkLength?: number; maxChunkLength?: number }
): { similarity: number; matchedText: string } {
  const p = phrase.trim().toLowerCase();
  if (!p) return { similarity: 0, matchedText: "" };
  const minChunk = options?.minChunkLength ?? 3;
  const maxChunk = options?.maxChunkLength ?? 120;

  const words = corpus.split(/\s+/).filter(Boolean);
  let bestSim = 0;
  let bestText = "";

  for (let i = 0; i < words.length; i++) {
    let chunk = "";
    for (let j = i; j < Math.min(i + 12, words.length); j++) {
      chunk = chunk ? chunk + " " + words[j] : words[j];
      if (chunk.length > maxChunk) break;
      if (chunk.length < minChunk) continue;
      const sim = fuzzySimilarity(p, chunk);
      if (sim > bestSim) {
        bestSim = sim;
        bestText = chunk;
      }
    }
  }

  for (const w of words) {
    if (w.length < minChunk || w.length > maxChunk) continue;
    const sim = fuzzySimilarity(p, w);
    if (sim > bestSim) {
      bestSim = sim;
      bestText = w;
    }
  }

  return { similarity: bestSim, matchedText: bestText };
}
