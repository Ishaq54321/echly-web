/**
 * Time Decay Model.
 * Computes hours since creation/update for prioritization and urgency marker.
 */

export function computeTimeDecayHours(createdAtMs: number | null, updatedAtMs?: number | null): number | null {
  if (createdAtMs == null) return null;
  const ref = updatedAtMs ?? createdAtMs;
  return (Date.now() - ref) / (1000 * 60 * 60);
}
