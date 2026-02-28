import {
  addDoc,
  collection,
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
  console.log("ADDING COMMENT TO FIRESTORE", { sessionId, feedbackId, data });
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

  console.log("[commentsRepository.addCommentRepo] Firestore path used", {
    collectionPath: collectionRef.path,
  });

  console.log("[commentsRepository.addCommentRepo] Data being written", payload);

  try {
    const docRef = await addDoc(collectionRef, payload);

    console.log("[commentsRepository.addCommentRepo] addDoc result", {
      id: docRef.id,
      path: docRef.path,
    });
  } catch (error) {
    console.error(
      "[commentsRepository.addCommentRepo] Error adding comment",
      error
    );
    throw error;
  }
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


