import type { AccessContext } from "@/lib/access/resolveAccess";
import type { Session } from "@/lib/domain/session";
import { assert } from "@/lib/utils/assert";

function sessionTimestampToIso(value: Session["createdAt"]): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  const v = value as { toMillis?: () => number; toDate?: () => Date };
  if (typeof v.toMillis === "function") {
    return new Date(v.toMillis()).toISOString();
  }
  if (typeof v.toDate === "function") {
    return v.toDate().toISOString();
  }
  return null;
}

/**
 * Single session JSON contract for API responses. Same keys for every viewer; sensitive fields
 * are nulled when !access.capabilities.canResolve.
 */
export function serializeSession(session: Session, access: AccessContext): Record<string, unknown> {
  const can = access.capabilities.canResolve;
  assert(session.id, "serializeSession: missing id");
  assert(session.title, "serializeSession: missing title");
  assert(session.workspaceId, "serializeSession: missing workspaceId");
  assert(session.createdByUserId, "serializeSession: missing createdByUserId");
  assert(session.accessLevel, "serializeSession: missing accessLevel");
  assert(session.generalAccess, "serializeSession: missing generalAccess");

  const accessLevel = session.accessLevel;
  const archived = session.isArchived === true || session.archived === true;

  const totalCount =
    typeof session.totalCount === "number"
      ? session.totalCount
      : typeof session.feedbackCount === "number"
        ? session.feedbackCount
        : null;

  return {
    id: session.id,
    title: session.title,
    accessLevel,
    generalAccess: session.generalAccess,
    hasConfiguredShare: session.hasConfiguredShare === true,
    workspaceId: can ? session.workspaceId : null,
    createdByUserId: can ? session.createdByUserId : null,
    archived,
    isArchived: session.isArchived === true || session.archived === true,
    createdAt: sessionTimestampToIso(session.createdAt),
    updatedAt: sessionTimestampToIso(
      session.updatedAt === undefined ? null : session.updatedAt
    ),
    viewCount: typeof session.viewCount === "number" ? session.viewCount : null,
    commentCount: typeof session.commentCount === "number" ? session.commentCount : null,
    openCount: typeof session.openCount === "number" ? session.openCount : null,
    resolvedCount: typeof session.resolvedCount === "number" ? session.resolvedCount : null,
    totalCount,
    feedbackCount: typeof session.feedbackCount === "number" ? session.feedbackCount : null,
  };
}
