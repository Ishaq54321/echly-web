/**
 * Phrase-level and token-level proper-noun anchoring using OCR visible text as authority.
 * - Only replace when similarity >= 0.85. Between 0.5 and 0.85 we log potential matches but keep the transcript.
 * - Phrase-level runs first (multi-word matches preferred); single-word token-level as fallback.
 * - Common UI words (submit, button, email, phone, name, form, field) are protected and never replaced.
 * - Anchoring corrects obvious OCR mismatches only; it does not guess replacements that could change meaning.
 */

import { echlyDebug } from "@/lib/utils/logger";

const MIN_VISIBLE_TOKEN_LEN = 4;
const MIN_WORD_LEN = 3;
/** Minimum similarity to perform any replacement. Below this we do not auto-replace. */
const SIMILARITY_THRESHOLD_REPLACE = 0.85;
/** Below this similarity, do not even log as potential. Between this and REPLACE threshold: log only, no replace. */
const SIMILARITY_POTENTIAL_MIN = 0.5;
const MIN_VISIBLE_TEXT_LEN = 10;
const MAX_PHRASE_WORDS = 6;

/** Common UI words that must never be replaced by OCR matches (e.g. "submit" must not become "Summit"). */
const PROTECTED_UI_WORDS = new Set(
  ["submit", "button", "email", "phone", "name", "form", "field"].map((s) => s.toLowerCase())
);

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
  return token.replace(/[^A-Za-z0-9'-]+/g, "");
}

/** Normalize punctuation for comparison: ignore periods and commas (token-level). */
function normalizePunctuation(s: string): string {
  return s.replace(/[.,]/g, "").trim();
}

/**
 * Normalize for similarity comparison only: lowercase, remove punctuation, collapse spaces, trim.
 */
export function normalizeForCompare(str: string): string {
  return (str ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Token is capitalized if first char A–Z or has uppercase followed by lowercase. */
function isCapitalizedToken(token: string): boolean {
  return /^[A-Z]/.test(token) || /[A-Z][a-z]/.test(token);
}

/** Token is connector punctuation allowed inside phrase (., &, -). */
function isConnectorToken(token: string): boolean {
  return /^[.,&\-]+$/.test(token);
}

/** Digits-only check for safety: do not anchor if OCR phrase is digits only. */
function isDigitsOnly(str: string): boolean {
  return /^\d+$/.test(normalizeForCompare(str).replace(/\s/g, ""));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Returns true if any token in the phrase (space-separated) is a protected UI word. */
function containsProtectedWord(phrase: string): boolean {
  const tokens = normalizeForCompare(phrase).split(/\s+/).filter(Boolean);
  return tokens.some((t) => PROTECTED_UI_WORDS.has(t));
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

/**
 * Extract proper noun phrases from visibleText: 2–4 consecutive capitalized words.
 * Preserves exact punctuation and capitalization. Used for phrase-level authority.
 */
export function extractProperNounPhrasesFromVisible(visibleText: string): string[] {
  const trimmed = (visibleText ?? "").trim();
  if (trimmed.length < MIN_VISIBLE_TEXT_LEN) return [];
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const phrases: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (!isCapitalizedToken(tokens[i])) {
      i++;
      continue;
    }
    const run: string[] = [tokens[i]];
    let capCount = 1;
    let j = i + 1;
    while (j < tokens.length && capCount <= 4) {
      if (isCapitalizedToken(tokens[j])) {
        run.push(tokens[j]);
        capCount++;
        j++;
      } else if (isConnectorToken(tokens[j]) && capCount < 4) {
        run.push(tokens[j]);
        j++;
      } else break;
    }
    if (capCount >= 2 && capCount <= MAX_PHRASE_WORDS) {
      const exactPhrase = run.join(" ");
      if (!isDigitsOnly(exactPhrase)) phrases.push(exactPhrase);
    }
    i = j > i ? j : i + 1;
  }
  return Array.from(new Set(phrases)).sort((a, b) => b.length - a.length);
}

/** Normalized Levenshtein similarity: 1 - distance / maxLength. */
function normalizedSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  const maxLen = Math.max(a.length, b.length, 1);
  const d = computeLevenshteinDistance(a, b);
  return 1 - d / maxLen;
}

/** Word positions in transcript for exact replacement (preserve spacing). */
function getWordPositions(transcript: string): { word: string; start: number; end: number }[] {
  const out: { word: string; start: number; end: number }[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(transcript)) !== null) {
    out.push({ word: m[0], start: m.index, end: m.index + m[0].length });
  }
  return out;
}

/** Extract multi-word phrases from visible text (tokenized) for token-level fallback. */
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
  if (!vt || vt.length < MIN_VISIBLE_TEXT_LEN) return transcript;

  const originalTranscript = transcript;
  let corrected = originalTranscript;

  // --- Phrase-level anchoring: OCR phrase → transcript windows (word-count mismatch allowed, similarity >= 0.78) ---
  const ocrPhrases = extractProperNounPhrasesFromVisible(vt);
  const wordPositions = getWordPositions(corrected);
  const replacements: { start: number; end: number; ocrPhrase: string }[] = [];
  const usedStarts = new Set<number>();

  for (const ocrPhrase of ocrPhrases) {
    const ocrNorm = normalizeForCompare(ocrPhrase);
    const phraseWordCount = ocrNorm.split(/\s+/).filter(Boolean).length;
    if (phraseWordCount > MAX_PHRASE_WORDS) continue;

    const windowSizes: number[] = [];
    if (phraseWordCount - 1 >= 2 && phraseWordCount - 1 <= MAX_PHRASE_WORDS) windowSizes.push(phraseWordCount - 1);
    if (phraseWordCount >= 2 && phraseWordCount <= MAX_PHRASE_WORDS) windowSizes.push(phraseWordCount);
    if (phraseWordCount + 1 >= 2 && phraseWordCount + 1 <= MAX_PHRASE_WORDS) windowSizes.push(phraseWordCount + 1);

    let bestMatch: {
      similarity: number;
      start: number;
      end: number;
      ocrPhrase: string;
      transcriptWindow: string;
      wordStart: number;
      windowSize: number;
    } | null = null;

    for (const windowSize of windowSizes) {
      if (windowSize > wordPositions.length) continue;
      for (let i = 0; i <= wordPositions.length - windowSize; i++) {
        const overlaps = Array.from({ length: windowSize }, (_, k) => k + i).some((k) => usedStarts.has(k));
        if (overlaps) continue;
        const window = wordPositions.slice(i, i + windowSize);
        const transcriptWindow = window.map((w) => w.word).join(" ");
        const transcriptNorm = normalizeForCompare(transcriptWindow);
        const collapsedWindow = transcriptNorm.replace(/\s+/g, "");
        const collapsedOCR = ocrNorm.replace(/\s+/g, "");
        const similarity = normalizedSimilarity(collapsedOCR, collapsedWindow);
        if (
          similarity >= SIMILARITY_THRESHOLD_REPLACE &&
          !containsProtectedWord(transcriptWindow) &&
          (!bestMatch || similarity > bestMatch.similarity)
        ) {
          bestMatch = {
            similarity,
            start: window[0].start,
            end: window[window.length - 1].end,
            ocrPhrase,
            transcriptWindow,
            wordStart: i,
            windowSize,
          };
        }
      }
    }

    if (bestMatch) {
      replacements.push({
        start: bestMatch.start,
        end: bestMatch.end,
        ocrPhrase: bestMatch.ocrPhrase,
      });
      for (let k = bestMatch.wordStart; k < bestMatch.wordStart + bestMatch.windowSize; k++) {
        usedStarts.add(k);
      }
    }
  }

  if (replacements.length > 0) {
    echlyDebug("OCR ANCHOR MATCH FOUND", replacements.length);
  } else if (ocrPhrases.length > 0) {
    echlyDebug("OCR ANCHOR NOT FOUND", null);
  }

  replacements.sort((a, b) => b.start - a.start);
  for (const { start, end, ocrPhrase } of replacements) {
    corrected = corrected.substring(0, start) + ocrPhrase + corrected.substring(end);
  }

  // --- STEP 4: Token-level anchoring (fallback) ---
  const visibleTokens = tokenizeVisibleText(vt);
  if (visibleTokens.length === 0) {
    return corrected;
  }

  const visiblePhrases = extractVisiblePhrases(visibleTokens);
  const candidatePhrases = extractCandidatePhrases(corrected);
  const candidates = extractCandidateProperNouns(corrected);

  for (const candidatePhrase of candidatePhrases) {
    const candidateNorm = normalizePunctuation(candidatePhrase);
    const candidateLower = candidateNorm.toLowerCase();
    if (containsProtectedWord(candidatePhrase)) continue;
    let bestCasing: string | null = null;
    let bestSimilarity = 0;
    for (const { phrase: visibleNorm, casing } of visiblePhrases) {
      const visibleLower = visibleNorm.toLowerCase();
      const sim = normalizedSimilarity(candidateLower, visibleLower);
      if (sim >= SIMILARITY_THRESHOLD_REPLACE && sim > bestSimilarity) {
        bestSimilarity = sim;
        bestCasing = casing;
      }
    }
    if (!bestCasing) continue;
    const res = replaceWholeToken(corrected, candidatePhrase, bestCasing);
    if (res.replaced) corrected = res.text;
  }

  for (const candidate of candidates) {
    const candidateNorm = normalizePunctuation(candidate);
    const candidateLower = candidateNorm.toLowerCase();
    if (PROTECTED_UI_WORDS.has(candidateLower)) continue;
    let bestToken: string | null = null;
    let bestSimilarity = 0;
    for (const token of visibleTokens) {
      if (token.length < MIN_VISIBLE_TOKEN_LEN) continue;
      const visibleNorm = normalizePunctuation(token);
      const visibleLower = visibleNorm.toLowerCase();
      const sim = normalizedSimilarity(candidateLower, visibleLower);
      if (sim >= SIMILARITY_THRESHOLD_REPLACE && sim > bestSimilarity) {
        bestSimilarity = sim;
        bestToken = token;
      }
    }
    if (!bestToken) continue;
    const res = replaceWholeToken(corrected, candidate, bestToken);
    corrected = res.text;
  }

  return corrected;
}

