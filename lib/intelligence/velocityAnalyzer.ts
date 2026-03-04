/**
 * Velocity Analyzer.
 * Marks resolution velocity: fast / normal / slow. Feeds momentum indicators.
 */

export type VelocityMark = "fast" | "normal" | "slow";

export function getResolutionVelocity(
  createdAtMs: number | null,
  resolvedAtMs?: number | null
): VelocityMark | null {
  if (createdAtMs == null || resolvedAtMs == null) return null;
  const hours = (resolvedAtMs - createdAtMs) / (1000 * 60 * 60);
  if (hours <= 4) return "fast";
  if (hours <= 48) return "normal";
  return "slow";
}
