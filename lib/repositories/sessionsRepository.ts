import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Session } from "@/lib/domain/session";
import { requireGeneralAccess } from "@/lib/domain/session";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { requireAccessLevel } from "@/lib/domain/accessLevel";

type SessionDoc = Omit<Session, "id"> & {
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  accessLevel?: AccessLevel;
};

/** Client read of a single session doc (session-scoped UI). Prefer API for lists. */
export async function getSessionByIdRepo(sessionId: string): Promise<Session | null> {
  const snap = await getDoc(doc(db, "sessions", sessionId));
  if (!snap.exists()) return null;

  const data = snap.data() as SessionDoc;
  const workspaceId = typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
  const createdByUserId =
    typeof data.createdByUserId === "string" ? data.createdByUserId.trim() : "";
  if (!workspaceId || !createdByUserId) {
    return null;
  }

  return {
    id: snap.id,
    ...data,
    workspaceId,
    createdByUserId,
    accessLevel: requireAccessLevel(data.accessLevel),
    generalAccess: requireGeneralAccess(data.generalAccess),
    hasConfiguredShare: data.hasConfiguredShare === true,
  };
}
