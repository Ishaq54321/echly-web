/**
 * DO NOT USE — bypasses event system guarantees (per-ticket resolve, actor, insights, noop rules).
 * Previously performed batched Firestore updates on feedback + session counters without
 * {@link updateFeedbackResolveAndSessionCountersRepo}.
 */
export async function resolveAllOpenFeedbackInSession(
  _sessionId: string,
  _userId: string
): Promise<{ resolved: number }> {
  throw new Error("Bulk resolve is not supported in current architecture");
}
