/**
 * Byte-cap eviction for capture streams (POST /api/feedback validation).
 *
 * Trim a time-ascending list so its serialized size fits the byte cap by
 * evicting from the FRONT (oldest first). Replaces the old all-or-nothing
 * drop: a body-heavy capture from a perfectly correct client (the
 * watermark/engagement merge made >cap payloads legitimate) now degrades to
 * "the most recent evidence" instead of the entire stream vanishing from the
 * ticket, the DevTools tabs, and the AI analysis at once. The console.warn at
 * each call site is the production signal for how often the cap fires.
 *
 * Pure — no I/O; same input, same output.
 */
export function evictOldestUntilFits<T>(
  entries: T[],
  maxBytes: number,
  sizeOf: (entry: T) => number = (entry) => JSON.stringify(entry).length
): { kept: T[]; evicted: number } {
  const sizes = entries.map(sizeOf);
  // "[" + entries joined by "," + "]" — close enough for a cap check.
  let total = 2 + sizes.reduce((a, b) => a + b + 1, 0);
  let start = 0;
  while (start < entries.length && total > maxBytes) {
    total -= sizes[start] + 1;
    start += 1;
  }
  return { kept: entries.slice(start), evicted: start };
}
