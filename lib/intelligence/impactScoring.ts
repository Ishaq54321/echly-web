/**
 * Impact Scoring Engine (0–100).
 * Factors: frequency, severity, sentiment weight, affected sessions, time decay, velocity stagnation.
 * Backend can replace with full model.
 */

import type { ImpactScoringInput } from "./types";

const DEFAULT_IMPACT = 50;

export function scoreImpact(input: ImpactScoringInput): number {
  let score = DEFAULT_IMPACT;
  if (input.frequencyInSessions != null && input.frequencyInSessions > 0) {
    score = Math.min(100, score + input.frequencyInSessions * 5);
  }
  if (input.severityWeight != null) {
    score = Math.min(100, score + input.severityWeight * 10);
  }
  if (input.sentimentWeight != null) {
    score = Math.min(100, score + input.sentimentWeight * 5);
  }
  if (input.affectedSessionIds && input.affectedSessionIds.length > 1) {
    score = Math.min(100, score + input.affectedSessionIds.length * 3);
  }
  if (input.timeDecayHours != null && input.timeDecayHours > 72) {
    score = Math.min(100, score + 10);
  }
  if (input.velocityStagnation) {
    score = Math.min(100, score + 8);
  }
  return Math.round(Math.max(0, Math.min(100, score)));
}
