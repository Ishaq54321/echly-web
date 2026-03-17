"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { ActivityTrendChart, type ActivityTrendPoint } from "@/components/insights/ActivityTrendChart";
import { IssueTypeDonutChart, type IssueSlice } from "@/components/insights/IssueTypeDonutChart";
import { MostActiveSessionsBarChart, type ActiveSessionBar } from "@/components/insights/MostActiveSessionsBarChart";
import { filterDaily, type DailyInsights } from "@/lib/analytics/filterDaily";
import { collection, onSnapshot, query, where, documentId, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  emptyWorkspaceInsightsDoc,
  workspaceInsightsRef,
  type WorkspaceInsightsDoc,
} from "@/lib/repositories/insightsRepository";

interface InsightsApiResponse {
  lifetime: {
    totalFeedback: number;
    totalComments: number;
    totalResolved: number;
    timeSavedMinutes: number;
    resolutionRate: number;
  };
  analytics: {
    daily: DailyInsights;
    issueTypes: Record<string, number>;
    sessionCounts: Record<string, number>;
    response: {
      totalFirstReplyMs: number;
      count: number;
    };
  };
}

const CARD_CLASS =
  "rounded-2xl border border-gray-200 bg-white shadow-sm";

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-neutral-100 ${className ?? ""}`} style={{ minHeight: 100 }} />
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-10">
      <div className="text-sm font-medium text-neutral-900">{title}</div>
      <div className="mt-1 text-sm text-gray-500">{body}</div>
    </div>
  );
}

function formatMinutesToHoursMinutes(totalMinutes: number): { hours: number; minutes: number } {
  const safe = Math.max(0, Math.floor(Number(totalMinutes) || 0));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return { hours, minutes };
}

const RANGE_OPTIONS: Array<{ value: "7d" | "30d" | "90d" | "1y"; label: string; days: number }> = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "1y", label: "Last 1 year", days: 365 },
];

/**
 * Insights — Single source of truth: insights doc only.
 */
export default function InsightsPage() {
  const { user: authUser, loading: authLoading } = useAuthGuard();
  const [data, setData] = useState<InsightsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "1y">("7d");
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [sessionTitleMap, setSessionTitleMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isRangeOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsRangeOpen(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-range-dropdown-root='true']")) return;
      setIsRangeOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [isRangeOpen]);

  const rangeDays = useMemo((): number => {
    return RANGE_OPTIONS.find((o) => o.value === range)?.days ?? 7;
  }, [range]);

  const mapDocToApi = (docData: WorkspaceInsightsDoc): InsightsApiResponse => ({
    lifetime: {
      totalFeedback: Math.max(0, Number(docData.totalFeedback) || 0),
      totalComments: Math.max(0, Number(docData.totalComments) || 0),
      totalResolved: Math.max(0, Number(docData.totalResolved) || 0),
      timeSavedMinutes: Math.max(0, Number(docData.timeSavedMinutes) || 0),
      resolutionRate:
        Number(docData.totalFeedback) > 0
          ? Math.round(
              (Math.max(0, Number(docData.totalResolved) || 0) /
                Math.max(0, Number(docData.totalFeedback) || 0)) *
                100
            )
          : 0,
    },
    analytics: {
      daily: docData.daily ?? {},
      issueTypes: docData.issueTypes ?? {},
      sessionCounts: docData.sessionCounts ?? {},
      response: docData.response ?? { totalFirstReplyMs: 0, count: 0 },
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) setLoading(false);
  }, [authUser, authLoading]);

  useEffect(() => {
    if (!authUser) return;
    setLoading(true);
    setError(null);
    // Realtime: keep Insights UI synced to the insights doc (no queries).
    const ref = workspaceInsightsRef(authUser.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        console.log("Insights snapshot update");
        if (!snap.exists()) {
          setData(mapDocToApi(emptyWorkspaceInsightsDoc()));
          setLoading(false);
          return;
        }
        setData(mapDocToApi(snap.data() as WorkspaceInsightsDoc));
        setLoading(false);
      },
      (err) => {
        console.error("[insights] onSnapshot error:", err);
        setError("Failed to load insights.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [authUser?.uid]);

  const filteredDaily = useMemo(() => {
    return filterDaily(data?.analytics?.daily ?? {}, rangeDays);
  }, [data?.analytics?.daily, rangeDays]);

  const activityTrend: ActivityTrendPoint[] = useMemo(() => {
    const keys = Object.keys(filteredDaily).sort();
    if (keys.length === 0) return [];
    return keys.map((date) => ({
      date,
      issues: Math.max(0, Number(filteredDaily[date]?.feedback) || 0),
      resolved: Math.max(0, Number(filteredDaily[date]?.resolved) || 0),
    }));
  }, [filteredDaily]);

  const totalIssuesInRange = useMemo(() => {
    return Object.values(filteredDaily).reduce(
      (sum, d) => sum + Math.max(0, Number(d?.feedback) || 0),
      0
    );
  }, [filteredDaily]);

  const totalResolvedInRange = useMemo(() => {
    return Object.values(filteredDaily).reduce(
      (sum, d) => sum + Math.max(0, Number(d?.resolved) || 0),
      0
    );
  }, [filteredDaily]);

  const issueTypeSlices: IssueSlice[] = useMemo(() => {
    const entries = Object.entries(data?.analytics?.issueTypes ?? {}).filter(
      ([k, v]) => typeof k === "string" && k.trim() !== "" && Number(v) > 0,
    );
    entries.sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
    const total = entries.reduce((sum, [, v]) => sum + (Number(v) || 0), 0) || 1;
    return entries.slice(0, 8).map(([type, count]) => ({
      type,
      count: Number(count) || 0,
      percentage: ((Number(count) || 0) / total) * 100,
    }));
  }, [data?.analytics?.issueTypes]);

  const topIssue = useMemo(() => {
    const entries = Object.entries(data?.analytics?.issueTypes ?? {}).filter(
      ([k, v]) => typeof k === "string" && k.trim() !== "" && Number(v) > 0,
    );
    entries.sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
    const [issueName, count] = entries[0] ?? [];
    if (!issueName) return null;
    return { issueName, count: Math.max(0, Number(count) || 0) };
  }, [data?.analytics?.issueTypes]);

  const sessionBars: ActiveSessionBar[] = useMemo(() => {
    const entries = Object.entries(data?.analytics?.sessionCounts ?? {}).filter(
      ([id, v]) => typeof id === "string" && id.trim() !== "" && Number(v) > 0,
    );
    entries.sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
    return entries.slice(0, 5).map(([sessionId, issues]) => ({
      sessionId,
      sessionName: sessionTitleMap[sessionId] || "Untitled session",
      issues: Number(issues) || 0,
    }));
  }, [data?.analytics?.sessionCounts, sessionTitleMap]);

  const topSessionIds = useMemo(() => {
    const entries = Object.entries(data?.analytics?.sessionCounts ?? {}).filter(
      ([id, v]) => typeof id === "string" && id.trim() !== "" && Number(v) > 0,
    );
    entries.sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
    return entries.slice(0, 5).map(([sessionId]) => sessionId);
  }, [data?.analytics?.sessionCounts]);

  const topSessionIdsKey = useMemo(() => topSessionIds.join(","), [topSessionIds]);

  useEffect(() => {
    if (!authUser) return;
    if (topSessionIds.length === 0) {
      setSessionTitleMap((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    // Firestore "in" queries are limited to 10 values; we only fetch top 5.
    const ids = topSessionIds.slice(0, 10);
    const qSessions = query(collection(db, "sessions"), where(documentId(), "in", ids));

    const unsub = onSnapshot(
      qSessions,
      (snap) => {
        setSessionTitleMap((prev) => {
          const next: Record<string, string> = { ...prev };
          // Clear titles for ids we care about, then repopulate from snapshot
          for (const id of ids) delete next[id];
          for (const d of snap.docs) {
            const sd = d.data() as DocumentData;
            const title = (typeof sd.title === "string" ? sd.title : "").trim();
            next[d.id] = title || "Untitled session";
          }
          return next;
        });
      },
      (err) => {
        console.error("[insights] sessions onSnapshot error:", err);
      }
    );

    return () => unsub();
  }, [authUser?.uid, topSessionIdsKey]);

  const topSession = useMemo(() => {
    return sessionBars[0] ?? null;
  }, [sessionBars]);

  const showSkeleton = authLoading || loading || !data;
  const timeSaved = formatMinutesToHoursMinutes(data?.lifetime?.timeSavedMinutes ?? 0);
  const formattedTimeSaved = `${timeSaved.hours}h ${timeSaved.minutes}m saved`;
  const totalFeedback = data?.lifetime?.totalFeedback ?? 0;
  const resolutionRate = Math.max(0, Math.floor(Number(data?.lifetime?.resolutionRate) || 0));
  const rangeLabel = RANGE_OPTIONS.find((o) => o.value === range)?.label ?? "Last 7 days";
  const resolutionRateTone =
    resolutionRate >= 70
      ? "text-emerald-600"
      : resolutionRate >= 40
        ? "text-secondary"
        : "text-amber-600";

  return (
    <div className="flex-1 bg-white flex flex-col w-full min-h-0">
      <div className="pt-10 pb-12 max-w-[1200px] mx-auto px-6 w-full">
        <div className="mb-8 space-y-1">
          <h1 className="text-xl font-semibold">Insights</h1>
          <p className="text-sm text-muted-foreground">
            A decision engine for what to fix next.
          </p>
        </div>

        <div className="space-y-10">
          {/* Premium hero */}
          <div className="mt-6 relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20">
            <div className="rounded-2xl bg-white px-6 py-6 flex items-center justify-between gap-6">
              <div className="shrink-0">
                <Image
                  src="/illustrations/time-saved.png"
                  alt="Time saved"
                  width={120}
                  height={120}
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Time saved</p>
                  <div className="text-3xl font-semibold tracking-tight tabular-nums text-neutral-900">
                    {showSkeleton ? (
                      <span className="inline-block h-9 w-44 rounded bg-neutral-100 animate-pulse align-middle" />
                    ) : (
                      formattedTimeSaved
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    Based on{" "}
                    {showSkeleton ? (
                      <span className="inline-block h-4 w-10 rounded bg-neutral-100 animate-pulse align-middle" />
                    ) : (
                      <span className="tabular-nums font-semibold text-neutral-900">
                        {totalFeedback}
                      </span>
                    )}{" "}
                    feedback items captured.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <section className={`${CARD_CLASS} p-7`}>
              <p className="text-sm text-red-600">{error}</p>
            </section>
          ) : showSkeleton ? (
            <>
              <SkeletonCard className="min-h-[72px]" />
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonCard className="p-7 h-[140px]" />
                <SkeletonCard className="p-7 h-[140px]" />
              </section>
              <SkeletonCard className="p-7 h-[420px]" />
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonCard className="p-7 h-[360px]" />
                <SkeletonCard className="p-7 h-[360px]" />
              </section>
            </>
          ) : (data.lifetime?.totalFeedback ?? 0) === 0 &&
            (data.lifetime?.totalComments ?? 0) === 0 ? (
            <section className={`${CARD_CLASS} p-7`}>
              <EmptyState
                title="No feedback yet"
                body="Insights will appear once you start collecting feedback."
              />
            </section>
          ) : (
            <>
            {/* 2) Focus section (2 cards side-by-side) */}
            <section className="space-y-4 max-w-3xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-neutral-900">
                    What needs your attention
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Quick highlights from your recent feedback.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${CARD_CLASS} p-7`}>
                  <div className="text-sm text-gray-500">Top issue</div>
                  <div className="mt-2 text-lg font-semibold text-neutral-900 capitalize truncate">
                    {topIssue?.issueName ?? "—"}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 tabular-nums">
                    {topIssue ? `${topIssue.count} reports` : "No issue data yet"}
                  </div>
                </div>

                <div className={`${CARD_CLASS} p-7`}>
                  <div className="text-sm text-gray-500">Most active session</div>
                  <div className="mt-2 text-lg font-semibold text-neutral-900 truncate">
                    {topSession?.sessionName ?? "Untitled session"}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 tabular-nums">
                    {topSession ? `${topSession.issues} issues` : "No session data yet"}
                  </div>
                </div>
              </div>
            </section>

            {/* 3) Activity (full width) */}
            <section className={`${CARD_CLASS} px-5 py-5 space-y-2`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-neutral-900">
                    Activity
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Your feedback activity over time
                  </div>
                </div>

                <div className="relative" data-range-dropdown-root="true">
                  <button
                    type="button"
                    className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={isRangeOpen}
                    onClick={() => setIsRangeOpen((v) => !v)}
                  >
                    {rangeLabel}
                  </button>

                  {isRangeOpen && (
                    <div
                      role="menu"
                      className="dropdown-enter absolute right-0 mt-2 w-40 rounded-xl border border-neutral-200 bg-white shadow-lg p-1 z-10"
                    >
                      {RANGE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setRange(opt.value);
                            setIsRangeOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-neutral-50 ${
                            opt.value === range ? "bg-neutral-50 text-neutral-900" : "text-neutral-700"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="tabular-nums">
                  <span className="text-2xl font-bold text-neutral-900">
                    {totalIssuesInRange}
                  </span>{" "}
                  feedback
                </div>
                <div className="tabular-nums">
                  <span className="text-2xl font-bold text-neutral-900">
                    {totalResolvedInRange}
                  </span>{" "}
                  resolved
                </div>
                <div className="tabular-nums">
                  <span className={`text-2xl font-bold ${resolutionRateTone}`}>
                    {resolutionRate}%
                  </span>{" "}
                  resolved
                </div>
              </div>

              <div key={range} className="transition-opacity duration-300">
                <ActivityTrendChart data={activityTrend} />
              </div>
            </section>

            {/* 4) Bottom section (2 columns on desktop) */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${CARD_CLASS} p-7 space-y-5`}>
                <div>
                  <div className="text-lg font-semibold text-neutral-900">
                    What users are saying
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    A quick breakdown of feedback themes
                  </div>
                </div>
                <IssueTypeDonutChart
                  data={issueTypeSlices}
                  totalOverride={data.lifetime?.totalFeedback ?? 0}
                />
              </div>

              <div className={`${CARD_CLASS} p-7 space-y-5`}>
                <div>
                  <div className="text-lg font-semibold text-neutral-900">
                    Top sessions
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Where feedback is concentrated
                  </div>
                </div>
                <MostActiveSessionsBarChart data={sessionBars} />
              </div>
            </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
