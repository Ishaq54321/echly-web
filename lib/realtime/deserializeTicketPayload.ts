import type { Feedback } from "@/lib/domain/feedback";
import { asTimestamp } from "@/lib/utils/asTimestamp";

/**
 * Inverse of {@link import("@/lib/server/serializeFeedback").serializeTicket}
 * for the timestamp fields, applied to a REST/PATCH ticket payload before it is
 * merged into the in-memory {@link Feedback} model.
 *
 * The serializer turns Firestore Timestamps into method-less plain values:
 *   - `createdAt`      → ISO string        (serializeFeedback.ts: timestampToIso)
 *   - `lastCommentAt`  → { seconds }       (serializeFeedback.ts: lastCommentAtToApiShape)
 *   - `aiGeneratedAt`  → { seconds }       (serializeFeedback.ts: timestampToApiShape)
 * No other timestamp fields are emitted (updatedAt / resolvedAt are NOT in the
 * serializer output — the historical `{ createdAt, updatedAt, ...rest }` strip at
 * the merge sites only ever dropped createdAt).
 *
 * Spreading those serialized shapes straight onto a Feedback item replaces real
 * Timestamps with `{ seconds }` objects, so any later `.toMillis()` read throws
 * (the aiGeneratedAt crash). This re-hydrates every such field back to a real
 * client Timestamp; non-timestamp fields pass through untouched.
 *
 * Returns a Partial<Feedback> safe to merge: `{ ...item, ...deserialized }`.
 */
export function deserializeTicketPayload(
  payload: Record<string, unknown>
): Partial<Feedback> {
  const next: Record<string, unknown> = { ...payload };

  // Re-hydrate each timestamp field the serializer produces. asTimestamp is a
  // no-op pass-through for values that are already real Timestamps (listener
  // mode), so this is safe regardless of which path produced the payload.
  if ("createdAt" in next) next.createdAt = asTimestamp(next.createdAt);
  if ("lastCommentAt" in next) next.lastCommentAt = asTimestamp(next.lastCommentAt);
  if ("aiGeneratedAt" in next) next.aiGeneratedAt = asTimestamp(next.aiGeneratedAt);

  return next as Partial<Feedback>;
}
