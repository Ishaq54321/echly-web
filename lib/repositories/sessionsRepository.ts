import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Session, SessionCreatedBy } from "@/lib/domain/session";
import type { Workspace } from "@/lib/domain/workspace";

type SessionDoc = Omit<Session, "id"> & { createdAt?: Timestamp | null; updatedAt?: Timestamp | null };

/**
 * Returns the number of *active* sessions in a workspace (active = sessionCount - archivedCount).
 * When workspace is provided and has sessionCount/archivedCount, uses those (instant).
 * Otherwise falls back to Firestore count queries (slow; temporary until workspaces are backfilled).
 */
export async function getWorkspaceSessionCountRepo(
  workspaceId: string,
  workspace?: Workspace | null
): Promise<number> {
  if (
    workspace &&
    typeof workspace.sessionCount === "number" &&
    typeof workspace.archivedCount === "number"
  ) {
    const active = Math.max(0, workspace.sessionCount - workspace.archivedCount);
    return active;
  }

  // Fallback: count queries (temporary until workspace.sessionCount/archivedCount are backfilled)
  const baseQuery = query(
    collection(db, "sessions"),
    where("workspaceId", "==", workspaceId)
  );
  const [allSnap, archivedSnap] = await Promise.all([
    getCountFromServer(baseQuery),
    getCountFromServer(
      query(
        collection(db, "sessions"),
        where("workspaceId", "==", workspaceId),
        where("archived", "==", true)
      )
    ),
  ]);

  const total = allSnap.data().count;
  const archived = archivedSnap.data().count;
  return Math.max(0, total - archived);
}

/**
 * Lists workspace sessions. Sorted by most recent activity (updatedAt desc).
 * Composite index required: (workspaceId Ascending, updatedAt Descending).
 * When archivedOnly is true: (workspaceId Ascending, archived Ascending, updatedAt Descending).
 * When includeArchived is true, returns both active and archived sessions.
 */
export async function getWorkspaceSessionsRepo(
  workspaceId: string,
  max: number = 50,
  archivedOnly?: boolean,
  includeArchived?: boolean
): Promise<Session[]> {
  assertQueryLimit(max, "getWorkspaceSessionsRepo");
  const q = query(
    collection(db, "sessions"),
    where("workspaceId", "==", workspaceId),
    ...(archivedOnly === true
      ? [where("archived", "==", true) as ReturnType<typeof where>]
      : []),
    orderBy("updatedAt", "desc"),
    limit(max)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .filter((docSnap) => {
      if (includeArchived) return true;
      const archived = (docSnap.data() as { archived?: boolean }).archived === true;
      return archivedOnly ? archived : !archived;
    })
    .map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as SessionDoc),
    }));
}

/**
 * Alias of {@link getWorkspaceSessionsRepo} (workspace-scoped).
 */
export async function getUserSessionsRepo(
  workspaceId: string,
  max: number = 50,
  archivedOnly?: boolean,
  includeArchived?: boolean
): Promise<Session[]> {
  assertQueryLimit(max, "getUserSessionsRepo");
  const q = query(
    collection(db, "sessions"),
    where("workspaceId", "==", workspaceId),
    ...(archivedOnly === true
      ? [where("archived", "==", true) as ReturnType<typeof where>]
      : []),
    orderBy("updatedAt", "desc"),
    limit(max)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .filter((docSnap) => {
      if (includeArchived) return true;
      const archived = (docSnap.data() as { archived?: boolean }).archived === true;
      return archivedOnly ? archived : !archived;
    })
    .map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as SessionDoc),
    }));
}

/** Limit for insights top sessions query. NEVER increase. */
const INSIGHTS_TOP_SESSIONS_LIMIT = 10;

/**
 * Bounded sessions fetch for /api/insights "most active sessions" chart.
 * Returns top sessions by feedbackCount. Composite index required: sessions (workspaceId ASC, feedbackCount DESC).
 */
export async function getWorkspaceSessionsByFeedbackCountRepo(
  workspaceId: string
): Promise<Session[]> {
  assertQueryLimit(INSIGHTS_TOP_SESSIONS_LIMIT, "getWorkspaceSessionsByFeedbackCountRepo");
  const isSimple = process.env.INSIGHTS_SIMPLE_QUERY === "1";

  const q = isSimple
    ? query(
        collection(db, "sessions"),
        where("workspaceId", "==", workspaceId),
        limit(10)
      )
    : query(
        collection(db, "sessions"),
        where("workspaceId", "==", workspaceId),
        orderBy("feedbackCount", "desc"),
        limit(INSIGHTS_TOP_SESSIONS_LIMIT)
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

