"use client";

import { useMemo } from "react";
import type { SessionWithCounts } from "./useWorkspaceOverview";
import type {
  AIExecutiveSummary,
  PriorityRadarGroup,
  ExecutionMomentum,
  SignalHeatmapBucket,
  PriorityRadarBucket,
  MomentumDirection,
  RiskLevel,
} from "@/lib/domain/signal";

/**
 * Synthesizes Command Center insight data from session/counts.
 * Backend can replace with real AI-driven summaries later.
 */
export function useCommandCenterData(sessions: SessionWithCounts[]) {
  const summary = useMemo((): AIExecutiveSummary => {
    const withOpen = sessions
      .filter((s) => s.counts.open > 0)
      .sort((a, b) => b.counts.open - a.counts.open);

    const highImpactItems = withOpen.slice(0, 3).map((s) => ({
      id: s.session.id,
      title: s.session.title || "Untitled Session",
      sessionId: s.session.id,
      impactScore: 50 + s.counts.open * 10,
    }));

    const riskAlerts = withOpen.slice(0, 2).map((s) => ({
      id: s.session.id,
      title: s.session.title || "Untitled Session",
      sessionId: s.session.id,
      riskLevel: (s.counts.open > 5 ? "high" : "medium") as RiskLevel,
    }));

    const openTotal = sessions.reduce((acc, s) => acc + s.counts.open, 0);
    const momentum: MomentumDirection =
      openTotal === 0 ? "improving" : openTotal > 10 ? "slowing" : "stable";

    return {
      highImpactItems,
      riskAlerts,
      emergingPattern:
        withOpen.length >= 2
          ? `${withOpen.length} sessions have open feedback.`
          : null,
      bottleneck:
        withOpen[0] && withOpen[0].counts.open > 3
          ? `${withOpen[0].session.title || "Untitled"} has ${withOpen[0].counts.open} open items.`
          : null,
      momentum,
    };
  }, [sessions]);

  const priorityRadarGroups = useMemo((): PriorityRadarGroup[] => {
    const withOpen = sessions
      .filter((s) => s.counts.open > 0)
      .sort((a, b) => b.counts.open - a.counts.open);

    const toSignal = (s: SessionWithCounts) => ({
      id: s.session.id,
      sessionId: s.session.id,
      title: s.session.title || "Untitled Session",
    });

    const critical = withOpen.filter((s) => s.counts.open >= 5);
    const atRisk = withOpen.filter((s) => {
      const o = s.counts.open;
      return o >= 2 && o < 5;
    });
    const stalled = sessions.filter((s) => {
      const o = s.counts.open;
      const r = s.counts.resolved;
      return o > 0 && r === 0;
    }).slice(0, 4);
    const trending = withOpen
      .filter((s) => !critical.includes(s) && !atRisk.includes(s))
      .slice(0, 4);

    return [
      { bucket: "Critical" as PriorityRadarBucket, signals: critical.map(toSignal) },
      { bucket: "At Risk" as PriorityRadarBucket, signals: atRisk.map(toSignal) },
      { bucket: "Stalled" as PriorityRadarBucket, signals: stalled.map(toSignal) },
      { bucket: "Trending" as PriorityRadarBucket, signals: trending.map(toSignal) },
    ];
  }, [sessions]);

  const momentum = useMemo((): ExecutionMomentum => {
    const totalOpen = sessions.reduce((acc, s) => acc + s.counts.open, 0);
    const totalResolved = sessions.reduce((acc, s) => acc + s.counts.resolved, 0);
    return {
      resolutionVelocityTrend: totalResolved > totalOpen ? "up" : totalOpen > 0 ? "down" : "flat",
      avgResolutionTimeHours: null,
      ownerLoadBalance: [{ ownerId: "me", ownerName: "You", openCount: totalOpen }],
      confidenceScoreTrend: "flat",
    };
  }, [sessions]);

  const heatmapBuckets = useMemo((): SignalHeatmapBucket[] => {
    return sessions
      .filter((s) => s.counts.total > 0)
      .map((s) => ({
        label: s.session.title || "Untitled",
        count: s.counts.total,
        sessionId: s.session.id,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [sessions]);

  return { summary, priorityRadarGroups, momentum, heatmapBuckets };
}
