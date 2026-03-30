import type { AccessContext } from "@/lib/access/resolveAccess";
import type { Session } from "@/lib/domain/session";
import { normalizeGeneralAccess } from "@/lib/domain/session";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";

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
  const accessLevel = normalizeAccessLevel(session.accessLevel ?? "view");
  const archived = session.archived ?? session.isArchived ?? false;

  const totalCount =
    typeof session.totalCount === "number"
      ? session.totalCount
      : typeof session.feedbackCount === "number"
        ? session.feedbackCount
        : null;

  return {
    id: session.id,
    title: typeof session.title === "string" ? session.title : "Untitled Session",
    accessLevel,
    generalAccess: normalizeGeneralAccess(session.generalAccess),
    hasConfiguredShare: session.hasConfiguredShare === true,
    workspaceId: can ? (session.workspaceId ?? null) : null,
    userId: can ? (session.userId ?? null) : null,
    createdBy: can ? (session.createdBy ?? null) : null,
    archived,
    isArchived: session.isArchived ?? session.archived ?? false,
    createdAt: sessionTimestampToIso(session.createdAt),
    updatedAt: sessionTimestampToIso(session.updatedAt ?? null),
    viewCount: typeof session.viewCount === "number" ? session.viewCount : null,
    commentCount: typeof session.commentCount === "number" ? session.commentCount : null,
    openCount: typeof session.openCount === "number" ? session.openCount : null,
    resolvedCount: typeof session.resolvedCount === "number" ? session.resolvedCount : null,
    totalCount,
    feedbackCount: typeof session.feedbackCount === "number" ? session.feedbackCount : null,
  };
}
