import type { Session } from "@/lib/domain/session";

/**
 * Serializes a session for API responses: converts Firestore Timestamp fields (createdAt, updatedAt) to ISO strings.
 * Includes denormalized feedback counters (`openCount`, `resolvedCount`, `totalCount`, `feedbackCount`).
 */
export function serializeSession(session: Session): Record<string, unknown> {
  const out = { ...session } as Record<string, unknown>;
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
