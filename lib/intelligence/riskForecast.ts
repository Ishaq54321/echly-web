/**
 * Risk Forecast Engine.
 * Derived from: time open, owner load, dependency overlap, similar unresolved signals.
 * Backend can replace with full model.
 */

import type { RiskScoringInput } from "./types";

export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";

export function scoreRisk(input: RiskScoringInput): RiskLevel {
  let level: RiskLevel = "none";
  if (input.timeOpenHours != null && input.timeOpenHours > 168) level = "medium";
  if (input.timeOpenHours != null && input.timeOpenHours > 336) level = "high";
  if (input.ownerLoad != null && input.ownerLoad > 15) level = level === "high" ? "critical" : "high";
  if (input.similarUnresolvedCount != null && input.similarUnresolvedCount > 5) level = "high";
  if (input.dependencyOverlapCount != null && input.dependencyOverlapCount > 3) level = "critical";
  return level;
}
