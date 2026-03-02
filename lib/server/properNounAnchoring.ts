/**
 * Deterministic proper-noun anchoring using OCR visible text as spelling authority.
 * No fuzzy NLP. No guessing. Only small Levenshtein distance matches.
 */

const MIN_VISIBLE_TOKEN_LEN = 4;
const MIN_WORD_LEN = 3;
const MAX_DISTANCE_SINGLE = 2;
/** For phrases longer than 2 words, allow slightly more STT noise. */
const MAX_DISTANCE_PHRASE = 3;

const EXCLUDED_CANDIDATES = new Set(
  [
    "can",
    "please",
    "change",
    "the",
    "from",
    "to",
    "of",
    "all",
    "instances",
    "title",
  ].map((s) => s.toLowerCase())
);

function normalizeTokenKeepCase(token: string): string {
  // Remove punctuation except hyphen and apostrophe.
  return token.replace(/[^A-Za-z0-9'-]+/g, "");
}

/** Normalize punctuation for comparison: ignore periods and commas. */
function normalizePunctuation(s: string): string {
  return s.replace(/[.,]/g, "").trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceWholeToken(
  text: string,
  needle: string,
  replacement: string
): { text: string; replaced: boolean } {
  // Match as a "token" bounded by anything not in [A-Za-z0-9'-]
  // Avoid lookbehind for maximum compatibility.
  const escaped = escapeRegExp(needle);
  const re = new RegExp(`(^|[^A-Za-z0-9'-])(${escaped})(?=$|[^A-Za-z0-9'-])`, "g");
  let didReplace = false;
  const next = text.replace(re, (_m, p1: string) => {
    didReplace = true;
    return `${p1}${replacement}`;
  });
  return { text: next, replaced: didReplace };
}

export function tokenizeVisibleText(visibleText: string): string[] {
  const cleaned = visibleText
    .replace(/[^A-Za-z0-9'\-]+/g, " ")
    .split(/\s+/)
    .map((t) => normalizeTokenKeepCase(t))
    .filter(Boolean);

  return cleaned.filter((w) => w.length >= MIN_WORD_LEN);
}

export function extractCandidateProperNouns(transcript: string): string[] {
  // Capitalized words only (high confidence). Keep original casing.
  const matches = transcript.match(/\b[A-Z][A-Za-z0-9'-]{2,}\b/g) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];

  for (const m of matches) {
    if (m.length < MIN_WORD_LEN) continue;
    if (EXCLUDED_CANDIDATES.has(m.toLowerCase())) continue;
    if (seen.has(m)) continue;
    seen.add(m);
    out.push(m);
  }
  return out;
}

/** Extract multi-word phrases (consecutive capitalized words) from transcript. Longest first. */
export function extractCandidatePhrases(transcript: string): string[] {
  const tokens = transcript.split(/\s+/);
  const phrases: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = normalizePunctuation(tokens[i]);
    if (!/^[A-Z][a-z0-9'-]*$/i.test(t) && !/^[A-Z]$/.test(t)) continue;
    const phraseTokens: string[] = [tokens[i]];
    let j = i + 1;
    while (j < tokens.length) {
      const u = normalizePunctuation(tokens[j]);
      if (/^[A-Z][a-z0-9'-]*$/i.test(u) || /^[A-Z]$/.test(u)) {
        phraseTokens.push(tokens[j]);
        j++;
      } else break;
    }
    if (phraseTokens.length >= 1) {
      const phrase = phraseTokens.join(" ");
      if (phraseTokens.length > 1 || (phraseTokens[0].length >= MIN_WORD_LEN && !EXCLUDED_CANDIDATES.has(phraseTokens[0].toLowerCase())))
        phrases.push(phrase);
    }
  }
  // Dedupe and sort by length descending so we match longest first.
  return Array.from(new Set(phrases)).sort((a, b) => b.length - a.length);
}

/** Extract multi-word phrases from visible text (consecutive tokens that look like proper nouns). */
function extractVisiblePhrases(visibleTokens: string[]): { phrase: string; casing: string }[] {
  const out: { phrase: string; casing: string }[] = [];
  for (let i = 0; i < visibleTokens.length; i++) {
    const t = visibleTokens[i];
    if (t.length < 2 && t !== t.toUpperCase()) continue;
    const phraseTokens: string[] = [t];
    let j = i + 1;
    while (j < visibleTokens.length) {
      const u = visibleTokens[j];
      if (u.length >= 2 || u === u.toUpperCase()) {
        phraseTokens.push(u);
        j++;
      } else break;
    }
    const casing = phraseTokens.join(" ");
    const phrase = normalizePunctuation(casing);
    if (phrase.length >= MIN_WORD_LEN) out.push({ phrase: phrase, casing });
  }
  return out.sort((a, b) => b.phrase.length - a.phrase.length);
}

export function computeLevenshteinDistance(a: string, b: string): number {
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
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost // substitution
      );
    }
    for (let j = 0; j <= blen; j++) prev[j] = curr[j];
  }

  return prev[blen];
}

export function anchorProperNouns(
  transcript: string,
  visibleText: string | null
): string {
  const vt = visibleText?.trim() ?? "";
  if (!vt) return transcript;

  const visibleTokens = tokenizeVisibleText(vt);
  if (visibleTokens.length === 0) return transcript;

  const visiblePhrases = extractVisiblePhrases(visibleTokens);
  const candidatePhrases = extractCandidatePhrases(transcript);
  const candidates = extractCandidateProperNouns(transcript);
  if (candidates.length === 0 && candidatePhrases.length === 0) return transcript;

  let corrected = transcript;

  // 1. Multi-token phrase matching (longest first). Distance <= 3 for phrases longer than 2 words.
  for (const candidatePhrase of candidatePhrases) {
    const candidateNorm = normalizePunctuation(candidatePhrase);
    const candidateLower = candidateNorm.toLowerCase();
    const wordCount = candidateNorm.split(/\s+/).length;
    const maxDist = wordCount > 2 ? MAX_DISTANCE_PHRASE : MAX_DISTANCE_SINGLE;

    let bestCasing: string | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (const { phrase: visibleNorm, casing } of visiblePhrases) {
      const visibleLower = visibleNorm.toLowerCase();
      if (candidateLower === visibleLower) {
        bestCasing = casing;
        bestDist = 0;
        break;
      }
      const d = computeLevenshteinDistance(candidateLower, visibleLower);
      if (d <= maxDist && d < bestDist) {
        bestDist = d;
        bestCasing = casing; // preserve exact OCR casing when match confidence is high
      }
    }

    if (!bestCasing) continue;
    const res = replaceWholeToken(corrected, candidatePhrase, bestCasing);
    if (res.replaced) corrected = res.text;
  }

  // 2. Single-token matching with punctuation normalization.
  for (const candidate of candidates) {
    const candidateNorm = normalizePunctuation(candidate);
    const candidateLower = candidateNorm.toLowerCase();
    let bestToken: string | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (const token of visibleTokens) {
      if (token.length < MIN_VISIBLE_TOKEN_LEN) continue;
      const visibleNorm = normalizePunctuation(token);
      const visibleLower = visibleNorm.toLowerCase();
      if (candidateLower === visibleLower) {
        bestToken = token;
        bestDist = 0;
        break;
      }
      const d = computeLevenshteinDistance(candidateLower, visibleLower);
      if (d <= MAX_DISTANCE_SINGLE && d < bestDist) {
        bestDist = d;
        bestToken = token; // preserve exact OCR casing when match confidence is high
        if (d === 1) break;
      }
    }

    if (!bestToken) continue;
    const res = replaceWholeToken(corrected, candidate, bestToken);
    corrected = res.text;
  }

  return corrected;
}

