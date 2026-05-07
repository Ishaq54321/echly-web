import type { Session, SharedSessionMembership } from "@/lib/domain/session";
import type { SessionWithCounts } from "@/lib/client/workspaceStore";

export function sharedToSessionWithCounts(
  m: SharedSessionMembership
): SessionWithCounts {
  const session: Session = {
    id: m.sessionId,
    title: m.sessionName,
    workspaceId: m.workspaceId,
    createdByUserId: m.addedBy ?? "",
    accessLevel: m.access === "resolve" ? "resolve" : "view",
    generalAccess: m.generalAccess === "link_view" ? "link_view" : "restricted",
    creatorName: m.addedByName ?? undefined,
    createdAt: m.addedAt
      ? new Date(m.addedAt.seconds * 1000)
      : null,
    openCount: m.openCount,
    resolvedCount: m.resolvedCount,
    feedbackCount: m.feedbackCount,
    viewCount: 0,
    recentViewers: [],
  };

  return {
    session,
    counts: {
      total: m.feedbackCount ?? 0,
      open: m.openCount ?? 0,
      resolved: m.resolvedCount ?? 0,
    },
  };
}
