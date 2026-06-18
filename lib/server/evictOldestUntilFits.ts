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

/**
 * Severity-tiered byte-cap eviction (fault invariant). Same byte cap as
 * evictOldestUntilFits, but evicts the oldest NOISE entry first and only falls
 * back to evicting a fault once no noise remains. Guarantees a confirmed fault
 * is never dropped to make room for a non-fault; fault-vs-fault eviction (when
 * the stream is all faults and still over cap) is permitted. Input is
 * time-ascending; output preserves order. The total stays bounded by the same
 * cap — faults are preferentially RETAINED, the payload is not grown.
 */
export function evictNoiseFirstUntilFits<T>(
  entries: T[],
  maxBytes: number,
  isFault: (entry: T) => boolean,
  sizeOf: (entry: T) => number = (entry) => JSON.stringify(entry).length
): { kept: T[]; evicted: number } {
  const kept = entries.slice();
  const sizeFor = new Map<T, number>();
  for (const e of kept) sizeFor.set(e, sizeOf(e));
  // "[" + entries joined by "," + "]" — mirrors evictOldestUntilFits accounting.
  let total = 2 + kept.reduce((a, e) => a + sizeFor.get(e)! + 1, 0);
  let evicted = 0;
  const fits = () => total <= maxBytes;
  // Pass 1 drops oldest noise (isFault === false); pass 2 drops oldest fault.
  for (const dropFaults of [false, true]) {
    let i = 0;
    while (!fits() && i < kept.length) {
      if (isFault(kept[i]) === dropFaults) {
        total -= sizeFor.get(kept[i])! + 1;
        kept.splice(i, 1); // next entry shifts into i — don't advance
        evicted += 1;
      } else {
        i += 1;
      }
    }
    if (fits()) break;
  }
  return { kept, evicted };
}

/**
 * Severity-tiered count cap (fault invariant). Trims a time-ascending list to
 * at most `maxEntries`, dropping the oldest NOISE entries first and only
 * dropping faults if faults alone exceed the cap. Total stays bounded by
 * `maxEntries` (no payload growth); faults are preferentially retained. Output
 * preserves order.
 */
export function capPreferringFaults<T>(
  entries: T[],
  maxEntries: number,
  isFault: (entry: T) => boolean
): T[] {
  if (entries.length <= maxEntries) return entries;
  let toDrop = entries.length - maxEntries;
  const drop = new Set<number>();
  // Oldest-noise-first, then oldest-fault. Indices ascend = oldest first.
  for (const dropFaults of [false, true]) {
    for (let i = 0; i < entries.length && toDrop > 0; i++) {
      if (drop.has(i)) continue;
      if (isFault(entries[i]) === dropFaults) {
        drop.add(i);
        toDrop -= 1;
      }
    }
    if (toDrop === 0) break;
  }
  return entries.filter((_, i) => !drop.has(i));
}
