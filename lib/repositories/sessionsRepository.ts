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
import type { Session } from "@/lib/domain/session";

type SessionDoc = Omit<Session, "id"> & { createdAt?: Timestamp | null };

export async function createSessionRepo(userId: string): Promise<string> {
  const docRef = await addDoc(collection(db, "sessions"), {
    userId,
    title: "Untitled Session",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getUserSessionsRepo(
  userId: string,
  max: number = 50
): Promise<Session[]> {
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
  await updateDoc(doc(db, "sessions", sessionId), { title });
}

