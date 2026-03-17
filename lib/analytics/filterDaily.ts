export type DailyInsights = Record<
  string,
  {
    feedback: number;
    comments: number;
    resolved: number;
  }
>;

/**
 * Filters a YYYY-MM-DD keyed daily map to the last `days` (UTC), inclusive of today.
 * Returns the same shape (Record keyed by YYYY-MM-DD).
 */
export function filterDaily(daily: DailyInsights, days: number): DailyInsights {
  if (!daily || typeof daily !== "object") return {};
  const n = Number.isFinite(days) ? Math.floor(days) : 0;
  if (n <= 0) return daily;

  const cutoffKey = new Date(Date.now() - (n - 1) * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const entries = Object.entries(daily).filter(([k]) => k >= cutoffKey);
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  return Object.fromEntries(entries);
}

