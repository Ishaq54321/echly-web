import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Session } from "@/lib/domain/session";

type SessionDoc = Omit<Session, "id"> & { createdAt?: Timestamp | null; updatedAt?: Timestamp | null };

/** Client read of a single session doc (session-scoped UI). Prefer API for lists. */
export async function getSessionByIdRepo(sessionId: string): Promise<Session | null> {
  const snap = await getDoc(doc(db, "sessions", sessionId));
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as SessionDoc),
  };
}
