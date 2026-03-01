import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Session } from "@/lib/domain/session";

type SessionDoc = Omit<Session, "id"> & { createdAt?: Timestamp | null; updatedAt?: Timestamp | null };

/**
 * Creates a single new session. Only writes ONE document; never modifies
 * existing session documents. Do not update session.updatedAt for other
 * sessions when creating a new one.
 */
export async function createSessionRepo(userId: string): Promise<string> {
  const docRef = await addDoc(collection(db, "sessions"), {
    userId,
    title: "Untitled Session",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Lists user sessions. Each document's updatedAt is that session's own last
 * activity only (no cross-session mutation). Sorted by creation; for "most
 * recent by activity" use orderBy("updatedAt", "desc") with composite index
 * (userId Ascending, updatedAt Descending).
 */
export async function getUserSessionsRepo(
  userId: string,
  max: number = 50
): Promise<Session[]> {
  assertQueryLimit(max, "getUserSessionsRepo");
  const q = query(
    collection(db, "sessions"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(max)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as SessionDoc),
  }));
}

export async function getSessionByIdRepo(
  sessionId: string
): Promise<Session | null> {
  const snap = await getDoc(doc(db, "sessions", sessionId));
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as SessionDoc),
  };
}

export async function updateSessionTitleRepo(
  sessionId: string,
  title: string
): Promise<void> {
  await updateDoc(doc(db, "sessions", sessionId), {
    title,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Updates only the given session's updatedAt (last activity). Call only when
 * activity occurred inside that session (ticket create/edit/delete, comment,
 * title change). Never call for other sessions or when creating a new session.
 * Do not batch update multiple sessions.
 */
export async function updateSessionUpdatedAtRepo(sessionId: string): Promise<void> {
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    return;
  }
  await updateDoc(doc(db, "sessions", sessionId), {
    updatedAt: serverTimestamp(),
  });
}

