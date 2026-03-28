import type { Feedback } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";

export type SanitizedPublicSession = {
  id: string;
  title: string;
  createdAt?: string;
  /** Denormalized from `sessions/{id}` (non-secret). */
  openCount?: number;
  resolvedCount?: number;
  totalCount?: number;
};

export type SanitizedPublicFeedback = {
  id: string;
  title: string;
  description: string;
  status: "open" | "resolved";
  createdAt: string | null;
  /** Public-safe attachments (screenshot + future files). */
  attachments: SanitizedPublicAttachment[];
  /** Public-safe structuring fields used by dashboard UI. */
  actionSteps: string[] | null;
  tags: string[] | null;
  /** Kept for dashboard component parity (FeedbackContent currently reads screenshotUrl). */
  screenshotUrl: string | null;
};

export type SanitizedPublicAttachment =
  | { kind: "screenshot"; url: string }
  | { kind: "file"; url: string; name?: string; size?: number };

function sessionCreatedAtToIso(value: Session["createdAt"]): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  const maybeTs = value as { toMillis?: () => number };
  if (typeof maybeTs.toMillis === "function") {
    return new Date(maybeTs.toMillis()).toISOString();
  }
  const withToDate = value as { toDate?: () => Date };
  if (typeof withToDate.toDate === "function") {
    return withToDate.toDate().toISOString();
  }
  return undefined;
}

function feedbackBodyText(f: Feedback): string {
  const d = f.description?.trim();
  if (d) return d;
  const i = f.instruction?.trim();
  if (i) return i;
  return "";
}

function feedbackCreatedAtToIso(f: Feedback): string | null {
  const t = f.createdAt;
  if (!t) return null;
  const maybeTs = t as { toMillis?: () => number };
  if (typeof maybeTs.toMillis === "function") {
    return new Date(maybeTs.toMillis()).toISOString();
  }
  if (typeof (t as { toDate?: () => Date }).toDate === "function") {
    return (t as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

/**
 * Public share API: id, title, optional createdAt, optional ticket counters.
 */
export function sanitizePublicSession(session: Session): SanitizedPublicSession {
  const out: SanitizedPublicSession = {
    id: session.id,
    title: typeof session.title === "string" ? session.title : "Untitled Session",
  };
  const createdAt = sessionCreatedAtToIso(session.createdAt);
  if (createdAt !== undefined) out.createdAt = createdAt;
  if (typeof session.openCount === "number") out.openCount = session.openCount;
  if (typeof session.resolvedCount === "number") out.resolvedCount = session.resolvedCount;
  if (typeof session.totalCount === "number") out.totalCount = session.totalCount;
  else if (typeof session.feedbackCount === "number") out.totalCount = session.feedbackCount;
  return out;
}

/**
 * Public share API: id, title, description, normalized status, createdAt only.
 * Omits userId, workspaceId, screenshots, metadata, counters, comments.
 */
export function sanitizePublicFeedback(items: Feedback[]): SanitizedPublicFeedback[] {
  const out: SanitizedPublicFeedback[] = [];
  for (const f of items) {
    const status = f.status === "resolved" ? "resolved" : "open";
    out.push({
      id: f.id,
      title: typeof f.title === "string" ? f.title : "",
      description: feedbackBodyText(f),
      status,
      createdAt: feedbackCreatedAtToIso(f),
      screenshotUrl: typeof f.screenshotUrl === "string" ? f.screenshotUrl : null,
      attachments:
        typeof f.screenshotUrl === "string" && f.screenshotUrl.trim() !== ""
          ? [{ kind: "screenshot", url: f.screenshotUrl }]
          : [],
      actionSteps: Array.isArray(f.actionSteps)
        ? f.actionSteps.filter((s): s is string => typeof s === "string" && s.trim() !== "")
        : null,
      tags: Array.isArray(f.suggestedTags)
        ? f.suggestedTags.filter((s): s is string => typeof s === "string" && s.trim() !== "")
        : null,
    });
  }
  return out;
}
