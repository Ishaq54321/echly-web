"use client";

import React, { useEffect, useState } from "react";
import { Ticket, MessageCircle, Layers, CheckCircle, Sparkles } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import dynamic from "next/dynamic";

const ActivityTrendChart = dynamic(
  () => import("@/components/insights/ActivityTrendChart").then(m => m.ActivityTrendChart),
  { ssr: false }
);
const IssueTypeDonutChart = dynamic(
  () => import("@/components/insights/IssueTypeDonutChart").then(m => m.IssueTypeDonutChart),
  { ssr: false }
);
const MostActiveSessionsBarChart = dynamic(
  () => import("@/components/insights/MostActiveSessionsBarChart").then(m => m.MostActiveSessionsBarChart),
  { ssr: false }
);
const ResponseSpeedTrendChart = dynamic(
  () => import("@/components/insights/ResponseSpeedTrendChart").then(m => m.ResponseSpeedTrendChart),
  { ssr: false }
);
const FeedbackHeatmap = dynamic(
  () => import("@/components/insights/FeedbackHeatmap").then(m => m.FeedbackHeatmap),
  { ssr: false }
);

interface MostCommentedSession {
  sessionId: string;
  sessionName: string;
  commentCount: number;
}

interface MostReportedIssueType {
  type: string;
  count: number;
}

interface ResponseSpeed {
  averageFirstReply: string;
  averageResolutionTime: string;
}

interface MostActiveSession {
  sessionName: string;
  issues: number;
  replies: number;
  collaborators: number;
}

interface TimeSaved {
  minutes: number;
  formatted: string;
}

interface AnalyticsWindow {
  issuesCaptured: number;
  repliesMade: number;
  sessionsReviewed: number;
  timeSavedHours: number;
}

interface ActivityPoint {
  date: string;
  issues: number;
  replies: number;
}

interface IssueTypeSlice {
  type: string;
  count: number;
  percentage: number;
}

interface ActiveSessionPoint {
  sessionId: string;
  sessionName: string;
  issues: number;
}

interface ResponseSpeedPoint {
  week: string;
  averageFirstReplyMs: number;
}

interface FeedbackHeatmapBin {
  dayOfWeek: number;
  hourOfDay: number;
  count: number;
}

interface InsightsApiResponse {
  lifetime: AnalyticsWindow;
  last30Days: AnalyticsWindow;
  resolvedDiscussions: number;
  mostCommentedSessions: MostCommentedSession[];
  mostReportedIssueTypes: MostReportedIssueType[];
  responseSpeed: ResponseSpeed;
  mostActiveSession: MostActiveSession | null;
  timeSaved: TimeSaved;
  issuesPerDay: ActivityPoint[];
  repliesPerDay: ActivityPoint[];
  issueTypeDistribution: IssueTypeSlice[];
  mostActiveSessions: ActiveSessionPoint[];
  responseSpeedTrend: ResponseSpeedPoint[];
  feedbackHeatmap: FeedbackHeatmapBin[];
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-neutral-100 ${className ?? ""}`} style={{ minHeight: 100 }} />
  );
}

function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 flex items-center gap-3">
      <div className="w-11 h-11 rounded-lg bg-neutral-200 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="h-9 w-16 bg-neutral-200 rounded" />
        <div className="h-3 w-24 bg-neutral-100 rounded mt-2" />
      </div>
    </div>
  );
}

/**
 * Insights — product value and activity from real Firestore analytics.
 */
export default function InsightsPage() {
  const { user: authUser, loading: authLoading } = useAuthGuard();
  const [data, setData] = useState<InsightsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) {
      if (!authLoading) setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    authFetch("/api/insights")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load insights");
        return res.json();
      })
      .then((json: InsightsApiResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load insights");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authUser, authLoading]);

  if (authLoading || (!authUser && !error)) {
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full bg-[var(--canvas-base)] overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
          <header>
            <div className="h-7 w-32 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-neutral-100 rounded mt-2 animate-pulse" />
          </header>
          <SkeletonCard className="min-h-[110px]" />
          <section className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full bg-[var(--canvas-base)] overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full bg-[var(--canvas-base)] overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
          <header>
            <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-neutral-900">
              Insights
            </h1>
            <p className="mt-1 text-[13px] text-secondary">
              Product value and activity across your feedback.
            </p>
          </header>
          <SkeletonCard className="min-h-[110px]" />
          <section className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </section>
          <section className="grid grid-cols-2 gap-6">
            <SkeletonCard className="p-6 h-48" />
            <SkeletonCard className="p-6 h-48" />
            <SkeletonCard className="p-6 h-24 col-span-2" />
            <SkeletonCard className="p-6 h-24 col-span-2" />
          </section>
        </div>
      </div>
    );
  }

  const {
    lifetime,
    resolvedDiscussions: resolvedCount,
    mostCommentedSessions,
    mostReportedIssueTypes,
    responseSpeed,
    mostActiveSession,
    timeSaved,
    issuesPerDay,
    issueTypeDistribution,
    mostActiveSessions,
    responseSpeedTrend,
    feedbackHeatmap,
  } = data;

  const ticketCount = lifetime?.issuesCaptured ?? 0;
  const replyCount = lifetime?.repliesMade ?? 0;
  const sessionCount = lifetime?.sessionsReviewed ?? 0;

  return (
    <div className="flex flex-1 min-h-0 flex-col w-full bg-[var(--canvas-base)] overflow-auto">
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        <header>
          <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-neutral-900">
            Insights
          </h1>
          <p className="mt-1 text-[13px] text-secondary">
            Product value and activity across your feedback.
          </p>
        </header>

        {/* Hero insight panel — time saved from lifetime tickets */}
        <div className="bg-white border border-neutral-200 rounded-xl px-10 py-7 shadow-sm flex items-center gap-5 min-h-[110px] hover:shadow-md transition-shadow duration-200">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Sparkles className="text-blue-600 w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs uppercase tracking-wide text-secondary">
              Time saved reviewing feedback
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
              {timeSaved.formatted} saved
            </h2>
            <div className="flex gap-5 mt-2 text-sm text-secondary">
              <span>{ticketCount} issues captured</span>
              <span>•</span>
              <span>{replyCount} replies</span>
              <span>•</span>
              <span>{resolvedCount} discussions resolved</span>
            </div>
          </div>
        </div>

        {/* Hero metrics row */}
        <section className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 bg-blue-50 hover:shadow-lg transition flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Ticket className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-4xl font-semibold text-neutral-900">{ticketCount}</p>
              <p className="text-xs uppercase tracking-wide font-medium text-secondary mt-1">Visual feedback captured</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200 bg-purple-50 hover:shadow-lg transition flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-4xl font-semibold text-neutral-900">{replyCount}</p>
              <p className="text-xs uppercase tracking-wide font-medium text-secondary mt-1">Replies made</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-200 bg-indigo-50 hover:shadow-lg transition flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Layers className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-4xl font-semibold text-neutral-900">{sessionCount}</p>
              <p className="text-xs uppercase tracking-wide font-medium text-secondary mt-1">Sessions reviewed</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 bg-green-50 hover:shadow-lg transition flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-4xl font-semibold text-neutral-900">{resolvedCount}</p>
              <p className="text-xs uppercase tracking-wide font-medium text-secondary mt-1">Discussions resolved</p>
            </div>
          </div>
        </section>

        {/* Activity trend */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">Activity trend</h3>
            <p className="text-xs text-secondary">Issues captured and replies made over time</p>
          </div>
          {!loading && data && <ActivityTrendChart data={issuesPerDay} />}
        </section>

        {/* Distribution + sessions grid */}
        <section className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900">Feedback type distribution</h3>
            <p className="text-xs text-secondary mb-1">
              How feedback is distributed across issue types
            </p>
            {!loading && data && (
              <IssueTypeDonutChart data={issueTypeDistribution} />
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">Most active sessions</h3>
              <p className="text-xs text-secondary">
                Top sessions by number of issues
              </p>
            </div>
            {!loading && data && (
              <MostActiveSessionsBarChart data={mostActiveSessions} />
            )}
          </div>
        </section>

        {/* Response speed + most active session summary */}
        <section className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Team response speed</h3>
                <p className="text-xs text-secondary">Average first reply over time</p>
              </div>
              <div className="flex gap-6 text-xs text-secondary">
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    {responseSpeed.averageFirstReply}
                  </p>
                  <p>Current average first reply</p>
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    {responseSpeed.averageResolutionTime}
                  </p>
                  <p>Average resolution time</p>
                </div>
              </div>
            </div>
            {!loading && data && (
              <ResponseSpeedTrendChart data={responseSpeedTrend} />
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-3 col-span-2">
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">
              Most active session (summary)
            </h3>
            {mostActiveSession ? (
              <>
                <p className="text-lg font-semibold text-neutral-900">{mostActiveSession.sessionName}</p>
                <div className="border-t border-neutral-200 mt-3 pt-3" aria-hidden />
                <div className="flex gap-6 mt-1 text-sm text-secondary">
                  <span>{mostActiveSession.issues} issues</span>
                  <span>{mostActiveSession.replies} replies</span>
                  <span>{mostActiveSession.collaborators} collaborators</span>
                </div>
              </>
            ) : (
              <p className="text-secondary">No session data yet.</p>
            )}
          </div>
        </section>

        {/* Optional: Feedback time heatmap */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Feedback activity heatmap</h3>
              <p className="text-xs text-secondary">
                When feedback tends to be captured across the week
              </p>
            </div>
          </div>
          {!loading && data && <FeedbackHeatmap data={feedbackHeatmap} />}
        </section>
      </div>
    </div>
  );
}
