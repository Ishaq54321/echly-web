import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  orderBy,
  limit,
  Timestamp,
  Query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const TIME_SAVED_PER_TICKET_MINUTES = 5;

/** Metrics window for recent activity (profile dropdown cards). */
const METRICS_WINDOW_DAYS = 30;

/** Max feedback docs to fetch for aggregations (grouping by session/type). */
const FEEDBACK_QUERY_LIMIT = 2000;

/** Max comments to fetch for reply count and first-reply timing. */
const COMMENTS_QUERY_LIMIT = 3000;

/** Max sessions to count as "sessions reviewed". */
const SESSIONS_QUERY_LIMIT = 500;

type TimestampLike = { toDate?: () => Date } | null | undefined;

function toMs(t: TimestampLike): number {
  if (t == null) return 0;
  const d =
    typeof (t as { toDate?: () => Date }).toDate === "function"
      ? (t as { toDate: () => Date }).toDate()
      : null;
  return d ? d.getTime() : 0;
}

export interface MostCommentedSession {
  sessionId: string;
  sessionName: string;
  commentCount: number;
}

export interface MostReportedIssueType {
  type: string;
  count: number;
}

export interface ResponseSpeed {
  averageFirstReply: string;
  averageResolutionTime: string;
}

export interface MostActiveSession {
  sessionName: string;
  issues: number;
  replies: number;
  collaborators: number;
}

export interface TimeSaved {
  minutes: number;
  formatted: string;
}

export interface ActivityPoint {
  /** ISO date string (YYYY-MM-DD) for the day bucket. */
  date: string;
  issues: number;
  replies: number;
}

export interface IssueTypeSlice {
  type: string;
  count: number;
  /** Percentage of total issues for this slice (0–100). */
  percentage: number;
}

export interface ActiveSessionPoint {
  sessionId: string;
  sessionName: string;
  issues: number;
}

export interface ResponseSpeedPoint {
  /** ISO week label, e.g. 2026-W10. */
  week: string;
  /** Average first reply time in milliseconds for the bucket. */
  averageFirstReplyMs: number;
}

export interface FeedbackHeatmapBin {
  /** 0–6, where 0 = Sunday, 6 = Saturday. */
  dayOfWeek: number;
  /** 0–23 hour of day (user local time). */
  hourOfDay: number;
  count: number;
}

export interface AnalyticsWindow {
  issuesCaptured: number;
  repliesMade: number;
  sessionsReviewed: number;
  timeSavedHours: number;
}

export interface InsightsData {
  lifetime: AnalyticsWindow;
  last30Days: AnalyticsWindow;
  resolvedDiscussions: number;
  mostCommentedSessions: MostCommentedSession[];
  mostReportedIssueTypes: MostReportedIssueType[];
  responseSpeed: ResponseSpeed;
  mostActiveSession: MostActiveSession | null;
  /** Lifetime, formatted for the Insights hero card. */
  timeSaved: TimeSaved;
  /** Daily trend of issues and replies over the last 30 days. */
  issuesPerDay: ActivityPoint[];
  /** Daily trend of replies over the last 30 days (alias for convenience). */
  repliesPerDay: ActivityPoint[];
  /** Issue types enriched with percentage of total, for donut charts. */
  issueTypeDistribution: IssueTypeSlice[];
  /** Top sessions by raw issue count for bar charts. */
  mostActiveSessions: ActiveSessionPoint[];
  /** Weekly buckets of response speed, for trend charting. */
  responseSpeedTrend: ResponseSpeedPoint[];
  /** Heatmap-style counts of feedback volume by day-of-week and hour-of-day. */
  feedbackHeatmap: FeedbackHeatmapBin[];
}

async function safeCount(queryRef: Query): Promise<number> {
  try {
    const snapshot = await getCountFromServer(queryRef);
    return Number(snapshot?.data()?.count ?? 0);
  } catch (error) {
    console.error("Firestore count failed:", error);
    return 0;
  }
}

function createEmptySnapshot<T = unknown>() {
  return {
    size: 0,
    docs: [] as Array<{ data: () => T }>,
    forEach: (_cb: (doc: { data: () => T }) => void) => {},
  } as any;
}

function createDefaultInsights(): InsightsData {
  return {
    lifetime: {
      issuesCaptured: 0,
      repliesMade: 0,
      sessionsReviewed: 0,
      timeSavedHours: 0,
    },
    last30Days: {
      issuesCaptured: 0,
      repliesMade: 0,
      sessionsReviewed: 0,
      timeSavedHours: 0,
    },
    resolvedDiscussions: 0,
    mostCommentedSessions: [],
    mostReportedIssueTypes: [],
    responseSpeed: {
      averageFirstReply: "—",
      averageResolutionTime: "—",
    },
    mostActiveSession: null,
    timeSaved: {
      minutes: 0,
      formatted: "0m",
    },
    issuesPerDay: [],
    repliesPerDay: [],
    issueTypeDistribution: [],
    mostActiveSessions: [],
    responseSpeedTrend: [],
    feedbackHeatmap: [],
  };
}

function formatDuration(ms: number): string {
  if (ms <= 0 || !Number.isFinite(ms)) return "—";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `~${days}d`;
  if (hours > 0) return `~${hours}h ${minutes}m`;
  if (minutes > 0) return `~${minutes}m`;
  return "~<1m";
}

/**
 * Computes insights for a user from Firestore.
 *
 * - `lifetime` window: all historical records (no date filters)
 * - `last30Days` window: records with createdAt >= now() - 30 days
 */
export async function computeInsights(userId: string): Promise<InsightsData> {
  try {
    const feedbackColl = collection(db, "feedback");
    const commentsColl = collection(db, "comments");
    const sessionsColl = collection(db, "sessions");

    const now = new Date();
    const windowStart = new Date(
      now.getTime() - METRICS_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );
    const windowStartTimestamp = Timestamp.fromDate(windowStart);

    // Lifetime vs last-30-days count queries for core metrics.
    const lifetimeFeedbackCountQuery = query(
      feedbackColl,
      where("userId", "==", userId)
    );
    const last30FeedbackCountQuery = query(
      feedbackColl,
      where("userId", "==", userId),
      where("createdAt", ">=", windowStartTimestamp)
    );

    const lifetimeCommentsCountQuery = query(
      commentsColl,
      where("userId", "==", userId)
    );
    const last30CommentsCountQuery = query(
      commentsColl,
      where("userId", "==", userId),
      where("createdAt", ">=", windowStartTimestamp)
    );

    const lifetimeSessionsCountQuery = query(
      sessionsColl,
      where("userId", "==", userId)
    );
    const last30SessionsCountQuery = query(
      sessionsColl,
      where("userId", "==", userId),
      where("createdAt", ">=", windowStartTimestamp)
    );

    // Detailed activity queries (used for Insights page breakdowns).
    const feedbackListQuery = query(
      feedbackColl,
      where("userId", "==", userId),
      where("createdAt", ">=", windowStartTimestamp),
      orderBy("createdAt", "desc"),
      limit(FEEDBACK_QUERY_LIMIT)
    );
    const commentsQuery = query(
      commentsColl,
      where("userId", "==", userId),
      where("createdAt", ">=", windowStartTimestamp),
      orderBy("createdAt", "asc"),
      limit(COMMENTS_QUERY_LIMIT)
    );
    const sessionsQuery = query(
      sessionsColl,
      where("userId", "==", userId),
      limit(SESSIONS_QUERY_LIMIT)
    );

    const [
      lifetimeIssuesCapturedRaw,
      last30IssuesCapturedRaw,
      lifetimeRepliesRaw,
      last30RepliesRaw,
      lifetimeSessionsReviewedRaw,
      last30SessionsReviewedRaw,
    ] = await Promise.all([
      safeCount(lifetimeFeedbackCountQuery),
      safeCount(last30FeedbackCountQuery),
      safeCount(lifetimeCommentsCountQuery),
      safeCount(last30CommentsCountQuery),
      safeCount(lifetimeSessionsCountQuery),
      safeCount(last30SessionsCountQuery),
    ]);

    let feedbackSnap = createEmptySnapshot();
    let commentsSnap = createEmptySnapshot();
    let sessionsSnap = createEmptySnapshot();

    try {
      [feedbackSnap, commentsSnap, sessionsSnap] = await Promise.all([
        getDocs(feedbackListQuery),
        getDocs(commentsQuery),
        getDocs(sessionsQuery),
      ]);
    } catch (error) {
      console.error("Firestore getDocs failed:", error);
      feedbackSnap = createEmptySnapshot();
      commentsSnap = createEmptySnapshot();
      sessionsSnap = createEmptySnapshot();
    }

    const lifetimeIssuesCaptured = Number(lifetimeIssuesCapturedRaw) || 0;
    const last30IssuesCaptured = Number(last30IssuesCapturedRaw) || 0;

    const lifetimeReplies = Number(lifetimeRepliesRaw) || 0;
    const last30Replies = Number(last30RepliesRaw) || 0;

    const lifetimeSessionsReviewed =
      Number(lifetimeSessionsReviewedRaw) || 0;
    const last30SessionsReviewed =
      Number(last30SessionsReviewedRaw) || 0;

    const lifetimeTimeSavedMinutes =
      lifetimeIssuesCaptured * TIME_SAVED_PER_TICKET_MINUTES;
    const last30TimeSavedMinutes =
      last30IssuesCaptured * TIME_SAVED_PER_TICKET_MINUTES;

    const lifetimeTimeSavedHours = lifetimeTimeSavedMinutes / 60;
    const last30TimeSavedHours = last30TimeSavedMinutes / 60;

    const feedback = feedbackSnap.docs.map((doc: any) => {
      const d = doc.data?.() ?? {};
      return {
        id: doc.id,
        sessionId: (d.sessionId as string) ?? "",
        status: (d.status as string) ?? "open",
        type: (d.type as string) ?? "Feedback",
        createdAt: d.createdAt as TimestampLike,
        lastCommentAt: d.lastCommentAt as TimestampLike,
        commentCount: Number(d.commentCount ?? 0) || 0,
      };
    });

    const resolvedDiscussions = feedback.filter(
      (f: {
        status: string;
      }) => f.status === "resolved"
    ).length;

    const sessionIdToName = new Map<string, string>();
    sessionsSnap.docs.forEach((doc: any) => {
      const d = doc.data?.() ?? {};
      sessionIdToName.set(
        doc.id,
        ((d.title as string) ?? "Untitled Session") || "Untitled Session"
      );
    });

    const commentCountBySession = new Map<string, number>();
    for (const f of feedback) {
      const total = Number((f as any).commentCount ?? 0) || 0;
      const sessionId = (f as any).sessionId as string;
      commentCountBySession.set(
        sessionId,
        (commentCountBySession.get(sessionId) ?? 0) + total
      );
    }
    const mostCommentedSessions: MostCommentedSession[] = Array.from(
      commentCountBySession.entries()
    )
      .map(([sessionId, commentCount]) => ({
        sessionId,
        sessionName: sessionIdToName.get(sessionId) ?? "Unknown Session",
        commentCount,
      }))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 3);

    const typeCount = new Map<string, number>();
    for (const f of feedback) {
      const type = f.type || "Feedback";
      typeCount.set(type, (typeCount.get(type) ?? 0) + 1);
    }
    const mostReportedIssueTypes: MostReportedIssueType[] = Array.from(
      typeCount.entries()
    )
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const totalIssueCount = Array.from(typeCount.values()).reduce(
      (sum, c) => sum + c,
      0
    );
    const issueTypeDistribution: IssueTypeSlice[] = Array.from(
      typeCount.entries()
    ).map(([type, count]) => ({
      type,
      count,
      percentage: totalIssueCount > 0 ? (count / totalIssueCount) * 100 : 0,
    }));

    const commentsByFeedbackId = new Map<string, { createdAt: number }[]>();
    commentsSnap.docs.forEach((docSnap: any) => {
      const d = docSnap.data?.() ?? {};
      const fid = d.feedbackId as string;
      const createdAt = toMs(
        (d as { createdAt?: TimestampLike }).createdAt ?? null
      );
      if (!fid) return;
      const list = commentsByFeedbackId.get(fid) ?? [];
      list.push({ createdAt });
      commentsByFeedbackId.set(fid, list);
    });
    commentsByFeedbackId.forEach((list) =>
      list.sort((a, b) => a.createdAt - b.createdAt)
    );

    const feedbackById = new Map(
      feedback.map((f: any) => [f.id as string, f])
    );

    let firstReplySum = 0;
    let firstReplyCount = 0;
    const firstReplyByWeek = new Map<
      string,
      { sumMs: number; count: number }
    >();
    for (const [fid, comments] of commentsByFeedbackId as Map<
      string,
      { createdAt: number }[]
    >) {
      const fb = feedbackById.get(fid) as {
        createdAt?: TimestampLike;
      } | null;
      if (!fb || comments.length === 0) continue;
      const firstComment = comments[0];
      const feedbackCreated = toMs(
        (fb as { createdAt?: TimestampLike }).createdAt ?? null
      );
      if (feedbackCreated <= 0) continue;
      const delta = firstComment.createdAt - feedbackCreated;
      firstReplySum += delta;
      firstReplyCount += 1;

      const createdDate = new Date(feedbackCreated);
      const year = createdDate.getUTCFullYear();
      const firstJan = new Date(Date.UTC(year, 0, 1));
      const dayMs = 24 * 60 * 60 * 1000;
      const week = Math.ceil(
        ((createdDate.getTime() - firstJan.getTime()) / dayMs + firstJan.getUTCDay() + 1) /
          7
      );
      const weekKey = `${year}-W${String(week).padStart(2, "0")}`;
      const bucket = firstReplyByWeek.get(weekKey) ?? { sumMs: 0, count: 0 };
      bucket.sumMs += delta;
      bucket.count += 1;
      firstReplyByWeek.set(weekKey, bucket);
    }
    const averageFirstReplyMs =
      firstReplyCount > 0 ? firstReplySum / firstReplyCount : 0;

    let resolutionSum = 0;
    let resolutionCount = 0;
    for (const f of feedback) {
      if (f.status !== "resolved" || !f.commentCount) continue;
      const created = toMs(f.createdAt);
      const lastComment = toMs(f.lastCommentAt);
      if (created <= 0 || lastComment <= 0) continue;
      resolutionSum += lastComment - created;
      resolutionCount += 1;
    }
    const averageResolutionMs =
      resolutionCount > 0 ? resolutionSum / resolutionCount : 0;

    const responseSpeed: ResponseSpeed = {
      averageFirstReply: formatDuration(averageFirstReplyMs),
      averageResolutionTime: formatDuration(averageResolutionMs),
    };

    const responseSpeedTrend: ResponseSpeedPoint[] = Array.from(
      firstReplyByWeek.entries()
    )
      .map(([week, { sumMs, count }]) => ({
        week,
        averageFirstReplyMs: count > 0 ? sumMs / count : 0,
      }))
      .sort((a, b) => (a.week < b.week ? -1 : a.week > b.week ? 1 : 0));

    const issuesBySession = new Map<string, number>();
    for (const f of feedback) {
      issuesBySession.set(
        f.sessionId,
        (issuesBySession.get(f.sessionId) ?? 0) + 1
      );
    }
    const issuesBySessionEntries = Array.from(issuesBySession.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const topSessionEntry = issuesBySessionEntries[0];

    let mostActiveSession: MostActiveSession | null = null;
    if (topSessionEntry) {
      const [sessionId, issues] = topSessionEntry;
      const sessionName = sessionIdToName.get(sessionId) ?? "Unknown Session";
      const replies = commentCountBySession.get(sessionId) ?? 0;
      const collaboratorsSet = new Set<string>();
      commentsSnap.docs.forEach((docSnap: any) => {
        const d = docSnap.data?.() ?? {};
        if ((d.sessionId as string) === sessionId) {
          collaboratorsSet.add((d.userId as string) ?? "");
        }
      });
      mostActiveSession = {
        sessionName,
        issues,
        replies,
        collaborators: collaboratorsSet.size,
      };
    }

    const mostActiveSessions: ActiveSessionPoint[] = issuesBySessionEntries
      .slice(0, 5)
      .map(([sessionId, issues]) => ({
        sessionId,
        sessionName: sessionIdToName.get(sessionId) ?? "Unknown Session",
        issues,
      }));

    const issuesByDay = new Map<string, { issues: number; replies: number }>();
    const repliesByDay = new Map<string, number>();

    const feedbackHeatmapAccumulator = new Map<
      string,
      { dayOfWeek: number; hourOfDay: number; count: number }
    >();

    feedback.forEach((f: {
      createdAt: TimestampLike;
    }) => {
      const createdMs = toMs(f.createdAt);
      if (!createdMs) return;
      const d = new Date(createdMs);
      const dateKey = d.toISOString().slice(0, 10);
      const bucket = issuesByDay.get(dateKey) ?? { issues: 0, replies: 0 };
      bucket.issues += 1;
      issuesByDay.set(dateKey, bucket);

      const dayOfWeek = d.getDay();
      const hourOfDay = d.getHours();
      const heatKey = `${dayOfWeek}-${hourOfDay}`;
      const heatBucket =
        feedbackHeatmapAccumulator.get(heatKey) ?? {
          dayOfWeek,
          hourOfDay,
          count: 0,
        };
      heatBucket.count += 1;
      feedbackHeatmapAccumulator.set(heatKey, heatBucket);
    });

    commentsSnap.docs.forEach((docSnap: any) => {
      const d = docSnap.data?.() ?? {};
      const created = toMs((d as { createdAt?: TimestampLike }).createdAt);
      if (!created) return;
      const dateKey = new Date(created).toISOString().slice(0, 10);
      repliesByDay.set(dateKey, (repliesByDay.get(dateKey) ?? 0) + 1);
      const dt = new Date(created);
      const dayOfWeek = dt.getDay();
      const hourOfDay = dt.getHours();
      const heatKey = `${dayOfWeek}-${hourOfDay}`;
      const heatBucket =
        feedbackHeatmapAccumulator.get(heatKey) ?? {
          dayOfWeek,
          hourOfDay,
          count: 0,
        };
      heatBucket.count += 1;
      feedbackHeatmapAccumulator.set(heatKey, heatBucket);
    });

    const issuesPerDay: ActivityPoint[] = Array.from(
      issuesByDay.entries()
    )
      .map(([date, { issues }]) => ({
        date,
        issues,
        replies: repliesByDay.get(date) ?? 0,
      }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    const repliesPerDay: ActivityPoint[] = issuesPerDay.map((p) => ({
      date: p.date,
      issues: p.issues,
      replies: p.replies,
    }));

    const feedbackHeatmap: FeedbackHeatmapBin[] = Array.from(
      feedbackHeatmapAccumulator.values()
    );

    const lifetimeHoursWhole = Math.floor(lifetimeTimeSavedMinutes / 60);
    const lifetimeMinsRemainder = lifetimeTimeSavedMinutes % 60;
    const timeSavedFormatted =
      lifetimeHoursWhole > 0
        ? `${lifetimeHoursWhole}h ${lifetimeMinsRemainder}m`
        : `${lifetimeMinsRemainder}m`;

    return {
      lifetime: {
        issuesCaptured: Number(lifetimeIssuesCaptured) || 0,
        repliesMade: Number(lifetimeReplies) || 0,
        sessionsReviewed: Number(lifetimeSessionsReviewed) || 0,
        timeSavedHours: Number(lifetimeTimeSavedHours) || 0,
      },
      last30Days: {
        issuesCaptured: Number(last30IssuesCaptured) || 0,
        repliesMade: Number(last30Replies) || 0,
        sessionsReviewed: Number(last30SessionsReviewed) || 0,
        timeSavedHours: Number(last30TimeSavedHours) || 0,
      },
      resolvedDiscussions,
      mostCommentedSessions,
      mostReportedIssueTypes,
      responseSpeed,
      mostActiveSession,
      timeSaved: {
        minutes: lifetimeTimeSavedMinutes,
        formatted: timeSavedFormatted,
      },
      issuesPerDay,
      repliesPerDay,
      issueTypeDistribution,
      mostActiveSessions,
      responseSpeedTrend,
      feedbackHeatmap,
    };
  } catch (error) {
    console.error("computeInsights failed:", error);
    return createDefaultInsights();
  }
}
