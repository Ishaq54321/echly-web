/**
 * Pure output-sanitization helpers for the AI Analysis route
 * (POST /api/feedback/[id]/analyze). Extracted from the route so the verdict and
 * field sanitization is unit-testable without pulling in next/firebase/openai.
 * No I/O, no environment reads — same input, same output.
 */

import type { Feedback } from "@/lib/domain/feedback";

export type SignalRelation = NonNullable<Feedback["aiSignalRelation"]>;

/** The relatedness verdicts the model may emit (must match the prompt + schema). */
export const SIGNAL_RELATIONS: readonly SignalRelation[] = [
  "related",
  "unrelated",
  "design_request",
  "no_signal",
] as const;

/** Trim + cap a model string field; non-strings become "". */
export function sanitizeOut(s: unknown, max: number): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

/**
 * Sanitize the model's fix-steps array: trim each item, drop empties, strip any
 * leading enumeration the model added despite instructions ("1.", "1)", "(1)",
 * "- ", "• "), cap item count and length. Returns [] if nothing usable.
 */
export function sanitizeSteps(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const cleaned = item
      .trim()
      .replace(/^(?:[-*•]\s+|\(?\d+[.)]\s+)/, "")
      .trim()
      .slice(0, maxLen);
    if (cleaned) out.push(cleaned);
    if (out.length >= maxItems) break;
  }
  return out;
}

/**
 * Build the legacy/compat run-on string from the structured fields. Kept in sync on
 * every successful write so old-shape readers (and any cached old-shape renderer)
 * still get a sensible single block. Steps are joined as a numbered sentence list.
 */
export function composeFixSuggestion(cause: string, steps: string[]): string {
  const stepText = steps.map((s, i) => `${i + 1}. ${s}`).join(" ");
  return stepText ? `${cause} Suggested fix: ${stepText}` : cause;
}

export function clampConfidence(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Math.max(0, Math.min(1, n));
}

/**
 * Coerce the model's relatedness verdict to one of the allowed values. The
 * fallback for a missing/unrecognized value depends on which path ran:
 *  - anchors existed (fault path) → "related": real fault signals were in view,
 *    so a malformed verdict falls back to diagnose-the-fault behaviour rather
 *    than silently suppressing a real cause;
 *  - no anchors (non-fault path) → "no_signal": there is nothing captured to
 *    relate to, so defaulting to "related" would fabricate a connection.
 */
export function sanitizeRelation(value: unknown, hasAnchors: boolean): SignalRelation {
  return SIGNAL_RELATIONS.includes(value as SignalRelation)
    ? (value as SignalRelation)
    : hasAnchors
      ? "related"
      : "no_signal";
}
