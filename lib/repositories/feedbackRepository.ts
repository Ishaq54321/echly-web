import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  limitToLast,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentReference,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Feedback,
  FeedbackPriority,
  FeedbackStatus,
  StructuredFeedback,
} from "@/lib/domain/feedback";

export async function addFeedbackRepo(
  sessionId: string,
  userId: string,
  data: StructuredFeedback
): Promise<DocumentReference> {
  const docRef = await addDoc(collection(db, "feedback"), {
    sessionId,
    userId,
    title: data.title,
    description: data.description,
    suggestion: data.suggestion ?? "",
    type: data.type,
    status: "open",
    priority: "medium",
    createdAt: serverTimestamp(),

    url: data.url ?? null,
    viewportWidth: data.viewportWidth ?? null,
    viewportHeight: data.viewportHeight ?? null,
    userAgent: data.userAgent ?? null,
    clientTimestamp: data.timestamp ?? null,

    screenshotUrl: data.screenshotUrl ?? null,
  });

  return docRef;
}

export async function updateFeedbackRepo(
  feedbackId: string,
  data: Partial<{
    title: string;
    description: string;
    type: string;
    status: FeedbackStatus;
    priority: FeedbackPriority;
    screenshotUrl: string | null;
  }>
): Promise<void> {
  await updateDoc(doc(db, "feedback", feedbackId), data);
}

export async function getSessionFeedbackRepo(
  sessionId: string,
  max: number = 50
): Promise<Feedback[]> {
  const q = query(
    collection(db, "feedback"),
    where("sessionId", "==", sessionId),
    orderBy("createdAt", "asc"),
    limitToLast(max)
  );

  const snapshot = await getDocs(q);

  const items = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      sessionId: data.sessionId,
      userId: data.userId,
      title: data.title,
      description: data.description,
      suggestion: data.suggestion ?? "",
      type: data.type,
      status: data.status ?? "open",
      priority: data.priority ?? "medium",
      createdAt: (data.createdAt ?? null) as Timestamp | null,

      url: data.url ?? null,
      viewportWidth: data.viewportWidth ?? null,
      viewportHeight: data.viewportHeight ?? null,
      userAgent: data.userAgent ?? null,
      clientTimestamp: data.clientTimestamp ?? null,

      screenshotUrl: data.screenshotUrl ?? null,
    };
  });

  // UI expects newest-first (matches local insert-at-front behavior).
  return items.reverse();
}

export async function deleteFeedbackRepo(feedbackId: string): Promise<void> {
  await deleteDoc(doc(db, "feedback", feedbackId));
}

export async function resolveFeedbackRepo(feedbackId: string): Promise<void> {
  await updateDoc(doc(db, "feedback", feedbackId), { status: "resolved" });
}

