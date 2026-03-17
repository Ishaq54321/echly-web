import type { Workspace } from "@/lib/domain/workspace";
import type { Feedback } from "@/lib/domain/feedback";
import type { Comment } from "@/lib/domain/comment";
import type { Session } from "@/lib/domain/session";

function toMs(
  ts: { toDate?: () => Date; seconds?: number } | null | undefined
): number | null {
  if (!ts) return null;
  const d = typeof ts.toDate === "function" ? ts.toDate() : null;
  if (d) return d.getTime();
  if (typeof (ts as { seconds?: number }).seconds === "number") {
    return (ts as { seconds: number }).seconds * 1000;
  }
  return null;
}

export interface InsightsSummary {
  totalIssues: number;
  totalReplies: number;
  activeSessions: number;
  avgResponseTime: string;
}

export interface InsightsTopIssue {
  title: string;
  count: number;
  sessionIds: string[];
}

export interface InsightsTopSession {
  sessionId: string;
  sessionName: string;
  issueCount: number;
}

export interface InsightsTeamPerformance {
  avgFirstReply: string;
  /** 0–1 float */
  resolutionRate: number;
}

export interface InsightsData {
  summary: InsightsSummary;
  topIssues: InsightsTopIssue[];
  topSessions: InsightsTopSession[];
  teamPerformance: InsightsTeamPerformance;
  timeSaved?: {
    minutes: number;
    formatted: string;
    totalFeedback: number;
  };
}

function createDefaultInsights(): InsightsData {
  return {
    summary: {
      totalIssues: 0,
      totalReplies: 0,
      activeSessions: 0,
      avgResponseTime: "—",
    },
    topIssues: [],
    topSessions: [],
    teamPerformance: {
      avgFirstReply: "—",
      resolutionRate: 0,
    },
  };
}

/**
 * Builds InsightsData from pre-aggregated workspace.stats.
 * No Firestore count or getDocs — one workspace doc read only.
 * Kept for backward compatibility; Decision Engine prefers computeInsightsFromFetchedData.
 */
export function computeInsightsFromWorkspaceStats(
  workspace: Workspace | null
): InsightsData {
  if (!workspace?.stats) {
    return createDefaultInsights();
  }

  const s = workspace.stats;
  const totalFeedback = Math.max(0, Number(s.totalFeedback) || 0);
  const totalComments = Math.max(0, Number(s.totalComments) || 0);
  const totalSessions = Math.max(0, Number(s.totalSessions) || 0);

  return {
    summary: {
      totalIssues: totalFeedback,
      totalReplies: totalComments,
      activeSessions: Math.max(0, totalSessions),
      avgResponseTime: "—",
    },
    topIssues: [],
    topSessions: [],
    teamPerformance: {
      avgFirstReply: "—",
      resolutionRate: 0,
    },
  };
}

/**
 * Legacy: builds Decision Engine payload from bounded Firestore fetches.
 * This path has been removed in favor of a single-read pre-aggregated insights doc.
 */
export const computeInsightsFromFetchedData = undefined as unknown as never;

/**
 * Computes insights for the given workspace using pre-aggregated stats only.
 * Replaces the previous implementation that did 6 count queries + 3 getDocs.
 */
export function computeInsights(workspace: Workspace | null): InsightsData {
  return computeInsightsFromWorkspaceStats(workspace);
}
