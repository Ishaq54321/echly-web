import type { Session } from "@/lib/domain/session";

/**
 * Serializes a session for API responses: converts Firestore Timestamp fields (createdAt, updatedAt) to ISO strings.
 * Counter snapshots (open/resolved/total/feedback) are omitted so clients use `/api/feedback/counts` only.
 */
export function serializeSession(session: Session): Record<string, unknown> {
  const {
    totalCount: _totalCount,
    openCount: _openCount,
    resolvedCount: _resolvedCount,
    feedbackCount: _feedbackCount,
    ...safeSession
  } = session;

  const out = { ...safeSession } as Record<string, unknown>;
  const createdAt = session.createdAt as { toDate?: () => Date } | null | undefined;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = createdAt.toDate().toISOString();
  }
  const updatedAt = session.updatedAt as { toDate?: () => Date } | null | undefined;
  if (updatedAt != null && typeof updatedAt.toDate === "function") {
    out.updatedAt = updatedAt.toDate().toISOString();
  }
  return out;
}
