import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const TIME_SAVED_PER_TICKET_MINUTES = 5;

/** Max feedback docs to fetch for aggregations (grouping by session/type). */
const FEEDBACK_QUERY_LIMIT = 2000;

/** Max comments to fetch for reply count and first-reply timing. */
const COMMENTS_QUERY_LIMIT = 3000;

/** Max sessions to count as "sessions reviewed". */
const SESSIONS_QUERY_LIMIT = 500;

type TimestampLike = { toDate?: () => Date } | null | undefined;

function toMs(t: TimestampLike): number {
  if (t == null) return 0;
  const d = typeof (t as { toDate?: () => Date }).toDate === "function" ? (t as { toDate: () => Date }).toDate() : null;
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

export interface InsightsData {
  ticketsCaptured: number;
  repliesMade: number;
  sessionsReviewed: number;
  resolvedDiscussions: number;
  mostCommentedSessions: MostCommentedSession[];
  mostReportedIssueTypes: MostReportedIssueType[];
  responseSpeed: ResponseSpeed;
  mostActiveSession: MostActiveSession | null;
  timeSaved: TimeSaved;
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
 * Computes all insights for a user from Firestore.
 * Time saved uses lifetime ticket count (getCountFromServer) so it does not decrease when sessions are deleted or feedback archived.
 */
export async function computeInsights(userId: string): Promise<InsightsData> {
  const feedbackColl = collection(db, "feedback");
  const commentsColl = collection(db, "comments");
  const sessionsColl = collection(db, "sessions");

  const feedbackCountQuery = query(feedbackColl, where("userId", "==", userId));
  const feedbackListQuery = query(
    feedbackColl,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(FEEDBACK_QUERY_LIMIT)
  );
  const commentsQuery = query(
    commentsColl,
    where("userId", "==", userId),
    orderBy("createdAt", "asc"),
    limit(COMMENTS_QUERY_LIMIT)
  );
  const sessionsQuery = query(
    sessionsColl,
    where("userId", "==", userId),
    limit(SESSIONS_QUERY_LIMIT)
  );

  const [countSnap, feedbackSnap, commentsSnap, sessionsSnap] = await Promise.all([
    getCountFromServer(feedbackCountQuery),
    getDocs(feedbackListQuery),
    getDocs(commentsQuery),
    getDocs(sessionsQuery),
  ]);

  const lifetimeTicketsCreated = countSnap.data().count;
  const ticketsCaptured = lifetimeTicketsCreated;

  const feedback = feedbackSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      sessionId: d.sessionId as string,
      status: (d.status as string) ?? "open",
      type: (d.type as string) ?? "Feedback",
      createdAt: d.createdAt as TimestampLike,
      lastCommentAt: d.lastCommentAt as TimestampLike,
      commentCount: (d.commentCount as number) ?? 0,
    };
  });

  const repliesMade = commentsSnap.size;
  const sessionsReviewed = sessionsSnap.size;

  const resolvedDiscussions = feedback.filter((f) => f.status === "resolved").length;

  const sessionIdToName = new Map<string, string>();
  sessionsSnap.docs.forEach((doc) => {
    const d = doc.data();
    sessionIdToName.set(doc.id, (d.title as string) ?? "Untitled Session");
  });

  const commentCountBySession = new Map<string, number>();
  for (const f of feedback) {
    const total = (f.commentCount ?? 0);
    commentCountBySession.set(f.sessionId, (commentCountBySession.get(f.sessionId) ?? 0) + total);
  }
  const mostCommentedSessions: MostCommentedSession[] = Array.from(commentCountBySession.entries())
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
  const mostReportedIssueTypes: MostReportedIssueType[] = Array.from(typeCount.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const commentsByFeedbackId = new Map<string, { createdAt: number }[]>();
  commentsSnap.docs.forEach((docSnap) => {
    const d = docSnap.data();
    const fid = d.feedbackId as string;
    const createdAt = toMs(d.createdAt as TimestampLike);
    if (!fid) return;
    const list = commentsByFeedbackId.get(fid) ?? [];
    list.push({ createdAt });
    commentsByFeedbackId.set(fid, list);
  });
  commentsByFeedbackId.forEach((list) => list.sort((a, b) => a.createdAt - b.createdAt));

  const feedbackById = new Map(feedback.map((f) => [f.id, f]));

  let firstReplySum = 0;
  let firstReplyCount = 0;
  for (const [fid, comments] of commentsByFeedbackId) {
    const fb = feedbackById.get(fid);
    if (!fb || comments.length === 0) continue;
    const firstComment = comments[0];
    const feedbackCreated = toMs(fb.createdAt);
    if (feedbackCreated <= 0) continue;
    firstReplySum += firstComment.createdAt - feedbackCreated;
    firstReplyCount += 1;
  }
  const averageFirstReplyMs = firstReplyCount > 0 ? firstReplySum / firstReplyCount : 0;

  let resolutionSum = 0;
  let resolutionCount = 0;
  for (const f of feedback) {
    if (f.status !== "resolved" || f.commentCount === 0) continue;
    const created = toMs(f.createdAt);
    const lastComment = toMs(f.lastCommentAt);
    if (created <= 0 || lastComment <= 0) continue;
    resolutionSum += lastComment - created;
    resolutionCount += 1;
  }
  const averageResolutionMs = resolutionCount > 0 ? resolutionSum / resolutionCount : 0;

  const responseSpeed: ResponseSpeed = {
    averageFirstReply: formatDuration(averageFirstReplyMs),
    averageResolutionTime: formatDuration(averageResolutionMs),
  };

  const issuesBySession = new Map<string, number>();
  for (const f of feedback) {
    issuesBySession.set(f.sessionId, (issuesBySession.get(f.sessionId) ?? 0) + 1);
  }
  const topSessionEntry = Array.from(issuesBySession.entries())
    .sort((a, b) => b[1] - a[1])[0];

  let mostActiveSession: MostActiveSession | null = null;
  if (topSessionEntry) {
    const [sessionId, issues] = topSessionEntry;
    const sessionName = sessionIdToName.get(sessionId) ?? "Unknown Session";
    const replies = commentCountBySession.get(sessionId) ?? 0;
    const commentDocIds = new Set<string>();
    commentsSnap.docs.forEach((docSnap) => {
      const d = docSnap.data();
      if ((d.sessionId as string) === sessionId) commentDocIds.add(docSnap.id);
    });
    const collaboratorsSet = new Set<string>();
    commentsSnap.docs.forEach((docSnap) => {
      const d = docSnap.data();
      if ((d.sessionId as string) === sessionId) collaboratorsSet.add((d.userId as string) ?? "");
    });
    mostActiveSession = {
      sessionName,
      issues,
      replies,
      collaborators: collaboratorsSet.size,
    };
  }

  const timeSavedMinutes = lifetimeTicketsCreated * TIME_SAVED_PER_TICKET_MINUTES;
  const hours = Math.floor(timeSavedMinutes / 60);
  const mins = timeSavedMinutes % 60;
  const timeSavedFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return {
    ticketsCaptured,
    repliesMade,
    sessionsReviewed,
    resolvedDiscussions,
    mostCommentedSessions,
    mostReportedIssueTypes,
    responseSpeed,
    mostActiveSession,
    timeSaved: { minutes: timeSavedMinutes, formatted: timeSavedFormatted },
  };
}
