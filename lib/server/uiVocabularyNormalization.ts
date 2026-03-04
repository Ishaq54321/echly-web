/**
 * UI Vocabulary Normalization — Rule 5.
 * Corrects speech-to-text mishearings that map to common UI terminology.
 * Deterministic; no AI. Prefer known UI terms when transcript word is phonetically similar.
 */

/** Known UI terms used for normalization (lowercase). */
export const UI_VOCABULARY = new Set([
  "button",
  "modal",
  "preview",
  "form",
  "field",
  "navigation",
  "header",
  "footer",
  "card",
  "section",
  "image",
  "headline",
  "cta",
  "link",
  "links",
  "input",
  "label",
  "submit",
  "menu",
  "banner",
  "title",
  "subtitle",
  "text",
  "paragraph",
  "logo",
]);

/**
 * Common STT mishearings → canonical UI term.
 * Only map when the transcript word is a known mishearing of the UI term.
 */
const STT_TO_UI: Record<string, string> = {
  summit: "submit",
  sumbit: "submit",
  submite: "submit",
  figure: "bigger",
  model: "modal",
  modle: "modal",
  feild: "field",
  fileds: "fields",
  lable: "label",
  lables: "labels",
  navagation: "navigation",
  navigaton: "navigation",
  hedline: "headline",
  headling: "headline",
  headlne: "headline",
  healine: "headline",
  imige: "image",
  immage: "image",
  immages: "images",
  secton: "section",
  sectons: "sections",
  fotter: "footer",
  hedder: "header",
  heder: "header",
  navigtion: "navigation",
  navigaion: "navigation",
  prevue: "preview",
  prevew: "preview",
  previev: "preview",
  formm: "form",
  fourm: "form",
  buttom: "button",
  buton: "button",
  buttton: "button",
  calltoaction: "cta",
};

/** Minimum Levenshtein similarity (1 - distance/maxLen) to normalize a word to a UI term. */
const PHONETIC_SIMILARITY_THRESHOLD = 0.8;

function normalizeTokenForLookup(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Levenshtein distance. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const alen = a.length;
  const blen = b.length;
  const prev = new Array<number>(blen + 1);
  const curr = new Array<number>(blen + 1);
  for (let j = 0; j <= blen; j++) prev[j] = j;
  for (let i = 1; i <= alen; i++) {
    curr[0] = i;
    const ac = a.charCodeAt(i - 1);
    for (let j = 1; j <= blen; j++) {
      const cost = ac === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= blen; j++) prev[j] = curr[j];
  }
  return prev[blen];
}

/** Similarity 0–1: 1 - distance/maxLen. */
function similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  const maxLen = Math.max(a.length, b.length, 1);
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Normalize a single word: exact STT map first, then phonetic match to UI vocabulary.
 * Returns the replacement word (with original casing pattern preserved) or null if no change.
 */
function normalizeWord(word: string): string | null {
  if (!word || word.length < 2) return null;
  const lower = word.toLowerCase();
  const exact = STT_TO_UI[lower];
  if (exact) return exact;

  const normalized = normalizeTokenForLookup(word);
  if (UI_VOCABULARY.has(normalized)) return null; // already correct

  let best: { term: string; sim: number } | null = null;
  for (const term of UI_VOCABULARY) {
    const sim = similarity(normalized, term);
    if (sim >= PHONETIC_SIMILARITY_THRESHOLD && (!best || sim > best.sim)) {
      best = { term, sim };
    }
  }
  if (!best) return null;
  return best.term;
}

/**
 * Applies UI vocabulary normalization to transcript text.
 * Replaces words that are known STT mishearings or phonetically similar to UI terms.
 * Preserves surrounding punctuation and spacing.
 */
export function normalizeUiVocabulary(transcript: string): string {
  if (!transcript || typeof transcript !== "string") return transcript;
  const trimmed = transcript.trim();
  if (!trimmed) return transcript;

  const wordBoundary = /\b([A-Za-z][A-Za-z0-9'-]*)\b/g;
  return trimmed.replace(wordBoundary, (match) => {
    const replacement = normalizeWord(match);
    if (!replacement) return match;
    // Preserve initial capital if original was capitalized
    if (match[0] === match[0].toUpperCase() && match.length > 1) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  });
}
