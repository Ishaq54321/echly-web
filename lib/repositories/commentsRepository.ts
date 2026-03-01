import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Comment } from "@/lib/domain/comment";
import { incrementSessionCommentCountRepo } from "@/lib/repositories/sessionsRepository";

export async function addCommentRepo(
  sessionId: string,
  feedbackId: string,
  data: {
    userId: string;
    userName: string;
    userAvatar: string;
    message: string;
  }
): Promise<void> {
  const collectionRef = collection(db, "comments");
  const payload = {
    sessionId,
    feedbackId,
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    message: data.message,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collectionRef, payload);
  await incrementSessionCommentCountRepo(sessionId);
}

/** Max comments per feedback thread (cost protection). */
const COMMENTS_QUERY_LIMIT = 100;

/**
 * Single realtime listener for comments of one feedback item.
 * Cost protection: limit(COMMENTS_QUERY_LIMIT). Caller must unsubscribe when
 * switching feedback or unmounting to avoid stacking listeners.
 */
export function listenToCommentsRepo(
  sessionId: string,
  feedbackId: string,
  callback: (comments: Comment[]) => void
): Unsubscribe {
  assertQueryLimit(COMMENTS_QUERY_LIMIT, "listenToCommentsRepo");
  const q = query(
    collection(db, "comments"),
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
  sessionId: string,
  max: number = RECENT_ACTIVITY_LIMIT
): Promise<Comment[]> {
  assertQueryLimit(max, "getSessionRecentCommentsRepo");
  const q = query(
    collection(db, "comments"),
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

const DELETE_SESSION_COMMENTS_LIMIT = 500;

/**
 * Deletes all comments for a session. Used when deleting a session.
 */
export async function deleteAllCommentsForSessionRepo(
  sessionId: string
): Promise<void> {
  const q = query(
    collection(db, "comments"),
    where("sessionId", "==", sessionId),
    limit(DELETE_SESSION_COMMENTS_LIMIT)
  );
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
}


