"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getSessionRecentComments } from "@/lib/comments";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";
import {
  getFeedbackByIds,
  getSessionFeedbackByResolved,
} from "@/lib/feedback";
import {
  getCounts,
  setCounts as setStoreCounts,
} from "@/lib/state/sessionCountsStore";
import { fetchCounts } from "@/lib/state/fetchCountsDedup";
import type { Feedback } from "@/lib/domain/feedback";
import { getSessionById } from "@/lib/sessions";
import type { Session } from "@/lib/domain/session";
import { useWorkspace } from "@/lib/client/workspaceContext";

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

/** Placeholder before `load()` completes; never used as a substitute for fetched counts. */
const initialCountsPlaceholder: SessionFeedbackCounts = {
  total: 0,
  open: 0,
  resolved: 0,
};

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

function timestampToDate(
  ts: { toDate?: () => Date; seconds?: number } | null | undefined
): Date | null {
  if (!ts) return null;
  try {
    if (typeof (ts as { toDate?: () => Date }).toDate === "function") {
      return (ts as { toDate: () => Date }).toDate();
    }
    if (typeof (ts as { seconds?: number }).seconds === "number") {
      return new Date((ts as { seconds: number }).seconds * 1000);
    }
    return null;
  } catch {
    return null;
  }
}

export function useSessionOverview(sessionId: string | undefined) {
  const { workspaceId, claimsReady } = useWorkspace();
  const [data, setData] = useState<SessionOverviewData>({
    session: null,
    countsByStatus: initialCountsPlaceholder,
    totalCount: 0,
    recentFeedback: [],
    statusPreview: { open: [], resolved: [] },
    recentActivity: [],
    tagCounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId || !workspaceId) {
      setLoading(false);
      return;
    }
    if (!claimsReady) return;
    const sid: string = sessionId;

    let cancelled = false;

    async function load() {
      const wid = workspaceId;
      if (!wid) return;
      setLoading(true);
      setError(null);
      try {
        if (!auth.currentUser?.uid) {
          throw new Error("Not authenticated");
        }
        const countsPromise = (async (): Promise<SessionFeedbackCounts> => {
          const cached = getCounts(sid);
          if (cached) return cached;
          const next = await fetchCounts(sid);
          setStoreCounts(sid, next);
          return next;
        })();

        const [session, countsByStatus, openPreview, resolvedPreview, recentComments] =
          await Promise.all([
            getSessionById(sid),
            countsPromise,
            getSessionFeedbackByResolved(wid, sid, false, 3),
            getSessionFeedbackByResolved(wid, sid, true, 3),
            getSessionRecentComments(wid, sid, RECENT_ACTIVITY_LIMIT),
          ]);

        if (cancelled) return;

        const feedbackIds = [...new Set(recentComments.map((c) => c.feedbackId))];
        const feedbackList = await getFeedbackByIds(feedbackIds.slice(0, 10), 10);
        const titleByFeedbackId = new Map(
          feedbackList.map((f) => [f.id, f.title])
        );

        const recentActivity: OverviewActivityItem[] = recentComments.map(
          (c) => ({
            actorName: c.userName ?? "Someone",
            action: "Commented",
            targetTitle: titleByFeedbackId.get(c.feedbackId) ?? "—",
            timestamp: timestampToDate(c.createdAt),
          })
        );

        const byId = new Map<string, Feedback>();
        for (const f of [...openPreview, ...resolvedPreview]) {
          byId.set(f.id, f);
        }
        const recentFeedback = [...byId.values()];
        const tagCounts = extractTagCounts(recentFeedback);

        setData({
          session: session ?? null,
          countsByStatus,
          totalCount: countsByStatus.total,
          recentFeedback,
          statusPreview: {
            open: openPreview,
            resolved: resolvedPreview,
          },
          recentActivity,
          tagCounts,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [claimsReady, workspaceId, sessionId]);

  return { data, loading, error };
}
