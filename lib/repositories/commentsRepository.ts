import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Comment, CommentAttachment, CommentPosition, CommentTextRange } from "@/lib/domain/comment";

export interface AddCommentData {
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  type?: "pin" | "text" | "general";
  position?: CommentPosition;
  textRange?: CommentTextRange;
  threadId?: string | null;
  attachment?: CommentAttachment;
}

/** Max comments per feedback thread (cost protection). */
const COMMENTS_QUERY_LIMIT = 100;

/**
 * Single realtime listener for comments of one feedback item.
 * Cost protection: limit(COMMENTS_QUERY_LIMIT). Caller must unsubscribe when
 * switching feedback or unmounting to avoid stacking listeners.
 */
export function listenToCommentsRepo(
  workspaceId: string,
  sessionId: string,
  feedbackId: string,
  callback: (comments: Comment[]) => void
): Unsubscribe {
  if (!workspaceId) {
    throw new Error("workspaceId required");
  }
  if (!sessionId) {
    throw new Error("sessionId required");
  }
  if (!feedbackId) {
    throw new Error("feedbackId required");
  }
  assertQueryLimit(COMMENTS_QUERY_LIMIT, "listenToCommentsRepo");
  const q = query(
    collection(db, "comments"),
    where("workspaceId", "==", workspaceId),
    where("sessionId", "==", sessionId),
    where("feedbackId", "==", feedbackId),
    orderBy("createdAt", "asc"),
    limit(COMMENTS_QUERY_LIMIT)
  );

  return onSnapshot(q, (snapshot) => {
    const comments: Comment[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Comment, "id">),
    }));
    callback(comments);
  });
}

const RECENT_ACTIVITY_LIMIT = 10;

/**
 * Fetches most recent comments for a session (for overview activity feed).
 * Composite index: comments (sessionId ASC, createdAt DESC).
 */
export async function getSessionRecentCommentsRepo(
  workspaceId: string,
  sessionId: string,
  max: number = RECENT_ACTIVITY_LIMIT
): Promise<Comment[]> {
  if (!workspaceId) {
    throw new Error("workspaceId required");
  }
  if (!sessionId) {
    throw new Error("sessionId required");
  }
  assertQueryLimit(max, "getSessionRecentCommentsRepo");
  const q = query(
    collection(db, "comments"),
    where("workspaceId", "==", workspaceId),
    where("sessionId", "==", sessionId),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Comment, "id">),
  }));
}

export interface UpdateCommentData {
  message?: string;
  resolved?: boolean;
}

/** Limit for insights comments query. NEVER increase. */
const INSIGHTS_COMMENTS_LIMIT = 100;

/**
 * Bounded comments fetch for /api/insights charts.
 * Composite index required: comments (userId ASC, createdAt DESC).
 */
export async function getWorkspaceCommentsForInsightsRepo(
  workspaceId: string
): Promise<Comment[]> {
  if (!workspaceId) {
    throw new Error("workspaceId required");
  }
  assertQueryLimit(INSIGHTS_COMMENTS_LIMIT, "getWorkspaceCommentsForInsightsRepo");
  const isSimple = process.env.INSIGHTS_SIMPLE_QUERY === "1";

  const q = isSimple
    ? query(
        collection(db, "comments"),
        where("workspaceId", "==", workspaceId),
        limit(10)
      )
    : query(
        collection(db, "comments"),
        where("workspaceId", "==", workspaceId),
        orderBy("createdAt", "desc"),
        limit(INSIGHTS_COMMENTS_LIMIT)
      );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Comment, "id">),
  }));
}

