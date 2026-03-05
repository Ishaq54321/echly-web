/**
 * Speech Normalization Layer — runs before AI extraction.
 * Fixes common speech-to-text errors (e.g. "below 8" → "below it") so that
 * the instruction extraction layer receives cleaner input.
 */

import { echlyDebug } from "@/lib/utils/logger";

/** Sequential replacements: speech mishearing → intended phrase. Apply in order. */
const SPEECH_REPLACEMENTS: ReadonlyArray<{ from: RegExp; to: string }> = [
  { from: /below\s+8\b/g, to: "below it" },
  { from: /sign\s+of\s+button/g, to: "signup button" },
  { from: /sign\s+of\s+form/g, to: "signup form" },
  { from: /lazy\s+l\b/g, to: "lazy load" },
  { from: /\btwo\s+heavy\b/g, to: "too heavy" },
  { from: /\bcurds\b/g, to: "cards" },
];

/**
 * Normalizes a raw transcript by fixing common speech-to-text errors,
 * replacing number misinterpretations, and cleaning duplicated spaces.
 * Runs before AI extraction. Deterministic; no AI.
 */
export function normalizeTranscript(transcript: string): string {
  if (!transcript || typeof transcript !== "string") return transcript;
  let out = transcript.trim();
  if (!out) return transcript;

  for (const { from, to } of SPEECH_REPLACEMENTS) {
    out = out.replace(from, to);
  }

  // Collapse duplicated spaces
  out = out.replace(/\s+/g, " ").trim();

  echlyDebug("NORMALIZED TRANSCRIPT", out);
  return out;
}
