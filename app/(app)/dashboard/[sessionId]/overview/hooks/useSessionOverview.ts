"use client";

import { useEffect, useState } from "react";
import { useAsyncGeneration } from "@/lib/hooks/useSafeAsync";
import { authFetch } from "@/lib/authFetch";
import type { SessionFeedbackCounts } from "@/lib/domain/session";
import type { Feedback } from "@/lib/domain/feedback";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";
import { requireAccessLevel } from "@/lib/domain/accessLevel";
import type { Session } from "@/lib/domain/session";
import { requireGeneralAccess } from "@/lib/domain/session";
import { Timestamp } from "firebase/firestore";

const RECENT_ACTIVITY_LIMIT = 10;

export interface OverviewActivityItem {
  actorName: string;
  action: string;
  targetTitle: string;
  timestamp: Date | null;
}

export interface StatusPreview {
  open: Feedback[];
  resolved: Feedback[];
}

export interface SessionOverviewData {
  session: Session | null;
  countsByStatus: SessionFeedbackCounts;
  totalCount: number;
  recentFeedback: Feedback[];
  statusPreview: StatusPreview;
  recentActivity: OverviewActivityItem[];
  tagCounts: { tag: string; count: number }[];
}

const initialCountsPlaceholder: SessionFeedbackCounts = {
  total: 0,
  open: 0,
  resolved: 0,
};

const EMPTY_SESSION_OVERVIEW: SessionOverviewData = {
  session: null,
  countsByStatus: initialCountsPlaceholder,
  totalCount: 0,
  recentFeedback: [],
  statusPreview: { open: [], resolved: [] },
  recentActivity: [],
  tagCounts: [],
};

function countsFromSession(session: Session | null): SessionFeedbackCounts {
  if (!session) return { total: 0, open: 0, resolved: 0 };
  const open = session.openCount ?? 0;
  const resolved = session.resolvedCount ?? 0;
  const total =
    typeof session.totalCount === "number"
      ? session.totalCount
      : typeof session.feedbackCount === "number"
        ? session.feedbackCount
        : 0;
  return { total, open, resolved };
}

function extractTagCounts(feedback: Feedback[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const f of feedback) {
    const tags = f.suggestedTags ?? [];
    for (const t of tags) {
      if (typeof t === "string" && t.trim()) {
        map.set(t, (map.get(t) ?? 0) + 1);
      }
    }
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

function parseOverviewFeedback(row: Record<string, unknown>, sid: string): Feedback | null {
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;
  const title = typeof row.title === "string" ? row.title : "";
  const rawStatus =
    typeof row.status === "string" ? row.status : row.isResolved === true ? "resolved" : "open";
  const normalizedStatus = normalizeTicketStatus(rawStatus);
  const createdAtRaw = row.createdAt;
  let createdAt: Feedback["createdAt"] = null;
  if (typeof createdAtRaw === "string") {
    const d = new Date(createdAtRaw);
    if (!Number.isNaN(d.getTime())) {
      createdAt = Timestamp.fromDate(d);
    }
  }
  return {
    id,
    sessionId: typeof row.sessionId === "string" ? row.sessionId : sid,
    userId: typeof row.userId === "string" ? row.userId : "",
    title,
    instruction:
      typeof row.instruction === "string"
        ? row.instruction
        : typeof row.description === "string"
          ? row.description
          : undefined,
    description: typeof row.description === "string" ? row.description : undefined,
    suggestion: typeof row.suggestion === "string" ? row.suggestion : "",
    type: typeof row.type === "string" ? row.type : "Feedback",
    isResolved: normalizedStatus === "resolved",
    createdAt,
    suggestedTags: Array.isArray(row.suggestedTags)
      ? (row.suggestedTags as string[])
      : null,
    screenshotUrl: typeof row.screenshotUrl === "string" ? row.screenshotUrl : null,
    commentCount: typeof row.commentCount === "number" ? row.commentCount : 0,
    status: normalizedStatus,
    isDeleted: false,
  };
}

function sessionFromOverviewApi(raw: Record<string, unknown> | null): Session | null {
  if (!raw || typeof raw.id !== "string") return null;
  if (typeof raw.workspaceId !== "string" || raw.workspaceId.trim() === "") return null;
  if (typeof raw.createdByUserId !== "string" || raw.createdByUserId.trim() === "") return null;
  if (typeof raw.title !== "string" || raw.title.trim() === "") return null;
  const session: Session = {
    id: raw.id,
    title: raw.title.trim(),
    workspaceId: raw.workspaceId.trim(),
    createdByUserId: raw.createdByUserId.trim(),
    accessLevel: requireAccessLevel(raw.accessLevel),
    generalAccess: requireGeneralAccess(raw.generalAccess),
  };
  const archived = raw.archived === true || raw.isArchived === true;
  if (archived) {
    session.archived = true;
    session.isArchived = true;
  }
  if (typeof raw.createdAt === "string") session.createdAt = raw.createdAt;
  if (typeof raw.updatedAt === "string") session.updatedAt = raw.updatedAt;
  if (typeof raw.openCount === "number") session.openCount = raw.openCount;
  if (typeof raw.resolvedCount === "number") session.resolvedCount = raw.resolvedCount;
  if (typeof raw.totalCount === "number") session.totalCount = raw.totalCount;
  if (typeof raw.feedbackCount === "number") session.feedbackCount = raw.feedbackCount;
  return session;
}

export function useSessionOverview(sessionId: string | undefined) {
  const { nextToken, isCurrent } = useAsyncGeneration();
  const [data, setData] = useState<SessionOverviewData>({
    session: null,
    countsByStatus: initialCountsPlaceholder,
    totalCount: 0,
    recentFeedback: [],
    statusPreview: { open: [], resolved: [] },
    recentActivity: [],
    tagCounts: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      nextToken();
      setData(EMPTY_SESSION_OVERVIEW);
      setLoading(false);
      setError(null);
      return;
    }
    const sid = sessionId;
    const token = nextToken();

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/overview`, {
          cache: "no-store",
        });
        if (!res?.ok) {
          throw new Error(`Overview failed: ${res?.status ?? "?"}`);
        }
        const payload = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          data?: {
            session?: Record<string, unknown>;
            statusPreview?: { open?: unknown[]; resolved?: unknown[] };
            recentActivity?: Array<{
              actorName?: string;
              action?: string;
              targetTitle?: string;
              timestamp?: string | null;
            }>;
          };
          session?: Record<string, unknown>;
          statusPreview?: { open?: unknown[]; resolved?: unknown[] };
          recentActivity?: Array<{
            actorName?: string;
            action?: string;
            targetTitle?: string;
            timestamp?: string | null;
          }>;
        };

        const inner = payload.data;
        const sessionRaw = inner?.session ?? payload.session;
        const statusPreviewRaw = inner?.statusPreview ?? payload.statusPreview;
        const recentActivityRawTop = inner?.recentActivity ?? payload.recentActivity;

        if (cancelled || !isCurrent(token)) return;
        if (!payload.success || !sessionRaw) {
          setData(EMPTY_SESSION_OVERVIEW);
          return;
        }

        const session = sessionFromOverviewApi(sessionRaw);
        const openRaw = Array.isArray(statusPreviewRaw?.open) ? statusPreviewRaw.open! : [];
        const resolvedRaw = Array.isArray(statusPreviewRaw?.resolved)
          ? statusPreviewRaw.resolved!
          : [];

        const openPreview = openRaw
          .map((r) => parseOverviewFeedback(r as Record<string, unknown>, sid))
          .filter((f): f is Feedback => f !== null);
        const resolvedPreview = resolvedRaw
          .map((r) => parseOverviewFeedback(r as Record<string, unknown>, sid))
          .filter((f): f is Feedback => f !== null);

        const countsByStatus = countsFromSession(session);
        const recentActivityRaw = Array.isArray(recentActivityRawTop) ? recentActivityRawTop : [];
        const recentActivity: OverviewActivityItem[] = recentActivityRaw.slice(0, RECENT_ACTIVITY_LIMIT).map(
          (c) => ({
            actorName: typeof c.actorName === "string" ? c.actorName : "Someone",
            action: typeof c.action === "string" ? c.action : "Commented",
            targetTitle: typeof c.targetTitle === "string" ? c.targetTitle : "",
            timestamp:
              typeof c.timestamp === "string" && c.timestamp ? new Date(c.timestamp) : null,
          })
        );

        const byId = new Map<string, Feedback>();
        for (const f of [...openPreview, ...resolvedPreview]) {
          byId.set(f.id, f);
        }
        const recentFeedback = [...byId.values()];
        const tagCounts = extractTagCounts(recentFeedback);

        if (cancelled || !isCurrent(token)) return;

        setData({
          session,
          countsByStatus,
          totalCount: countsByStatus.total,
          recentFeedback,
          statusPreview: { open: openPreview, resolved: resolvedPreview },
          recentActivity,
          tagCounts,
        });
      } catch (e) {
        if (!cancelled && isCurrent(token)) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (!cancelled && isCurrent(token)) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, nextToken, isCurrent]);

  return { data, loading, error };
}
