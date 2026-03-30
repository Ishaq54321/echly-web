import "server-only";

import { getAccessContext } from "@/lib/access/getAccessContext";
import { adminDb } from "@/lib/server/firebaseAdmin";
import type { Session } from "@/lib/domain/session";
import { assertQueryLimit } from "@/lib/querySafety";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { buildSystemContext } from "@/lib/server/systemContext";

const DEFAULT_OWNER_SESSIONS_QUERY_LIMIT = 80;

function updatedAtMs(session: Session): number {
  const t =
    session.updatedAt !== undefined && session.updatedAt !== null
      ? session.updatedAt
      : session.createdAt;
  if (t == null) return 0;
  if (typeof t === "string") return Date.parse(t) || 0;
  if (t instanceof Date) return t.getTime();
  const o = t as { seconds?: number; toDate?: () => Date };
  if (typeof o.seconds === "number") return o.seconds * 1000;
  if (typeof o.toDate === "function") return o.toDate().getTime();
  return 0;
}

/**
 * Candidate session ids: created by the user and sessions in the user's workspace.
 * Each row is kept only if {@link getAccessContext} grants `capabilities.canView` (single path).
 */
export async function listAccessibleSessionsForUser(args: {
  userId: string;
  /** Max sessions returned (after access filter). */
  limit?: number;
  /** Max sessions to read per Firestore branch (owned + workspace lists). */
  ownerSessionsQueryLimit?: number;
}): Promise<Session[]> {
  const limitArg = args.limit !== undefined ? args.limit : 30;
  const outLimit = Math.min(limitArg, 100);
  const ownerLimitArg =
    args.ownerSessionsQueryLimit !== undefined
      ? args.ownerSessionsQueryLimit
      : DEFAULT_OWNER_SESSIONS_QUERY_LIMIT;
  const ownerSessionsQueryLimit = Math.min(ownerLimitArg, 120);
  assertQueryLimit(ownerSessionsQueryLimit, "listAccessibleSessionsForUser.ownerSessionsQuery");
  assertQueryLimit(outLimit, "listAccessibleSessionsForUser.out");

  const uid = args.userId.trim();
  if (!uid) return [];

  const ids = new Set<string>();

  const createdSnap = await adminDb
    .collection("sessions")
    .where("createdByUserId", "==", uid)
    .orderBy("updatedAt", "desc")
    .limit(ownerSessionsQueryLimit)
    .get();
  for (const d of createdSnap.docs) ids.add(d.id);

  const workspaceId = await getUserWorkspaceIdRepo(uid);
  const workspaceSnap = await adminDb
    .collection("sessions")
    .where("workspaceId", "==", workspaceId)
    .orderBy("updatedAt", "desc")
    .limit(ownerSessionsQueryLimit)
    .get();
  for (const d of workspaceSnap.docs) ids.add(d.id);

  const wsTrim = workspaceId.trim();
  const accessCallerContext = buildSystemContext({
    userId: uid,
    workspaceId: wsTrim === "" ? null : wsTrim,
  });

  const resolved = await Promise.all(
    [...ids].map(async (sessionId) => {
      const { session, access } = await getAccessContext({
        sessionId,
        context: accessCallerContext,
      });
      if (!access.capabilities.canView) return null;
      return session;
    })
  );

  const sessions = resolved.filter((s): s is Session => s != null);
  sessions.sort((a, b) => updatedAtMs(b) - updatedAtMs(a));
  return sessions.slice(0, outLimit);
}
