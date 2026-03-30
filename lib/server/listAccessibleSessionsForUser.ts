import "server-only";

import { getAccessContext } from "@/lib/access/getAccessContext";
import { adminDb } from "@/lib/server/firebaseAdmin";
import type { Session } from "@/lib/domain/session";
import { assertQueryLimit } from "@/lib/querySafety";
import {
  getUserWorkspaceIdRepo,
  isShareAuthUid,
} from "@/lib/repositories/usersRepository.server";

const SHARE_EMAIL_LOOKUP_LIMIT = 100;
const DEFAULT_CREATED_BY_LIMIT = 80;

function updatedAtMs(session: Session): number {
  const t = session.updatedAt ?? session.createdAt;
  if (t == null) return 0;
  if (typeof t === "string") return Date.parse(t) || 0;
  if (t instanceof Date) return t.getTime();
  const o = t as { seconds?: number; toDate?: () => Date };
  if (typeof o.seconds === "number") return o.seconds * 1000;
  if (typeof o.toDate === "function") return o.toDate().getTime();
  return 0;
}

/**
 * Candidate session ids: created by the user, sessions in the user's workspace, plus email shares.
 * Each row is kept only if {@link getAccessContext} grants `capabilities.canView` (single path).
 */
export async function listAccessibleSessionsForUser(args: {
  userId: string;
  userEmail: string | null | undefined;
  /** Max sessions returned (after access filter). */
  limit?: number;
  /** Max sessions to read from createdByUserId query. */
  createdByLimit?: number;
}): Promise<Session[]> {
  const outLimit = Math.min(args.limit ?? 30, 100);
  const createdByLimit = Math.min(args.createdByLimit ?? DEFAULT_CREATED_BY_LIMIT, 120);
  assertQueryLimit(createdByLimit, "listAccessibleSessionsForUser.createdBy");
  assertQueryLimit(outLimit, "listAccessibleSessionsForUser.out");

  const uid = args.userId.trim();
  if (!uid) return [];
  if (isShareAuthUid(uid)) return [];

  const ids = new Set<string>();

  const createdSnap = await adminDb
    .collection("sessions")
    .where("createdByUserId", "==", uid)
    .orderBy("updatedAt", "desc")
    .limit(createdByLimit)
    .get();
  for (const d of createdSnap.docs) ids.add(d.id);

  const workspaceId = await getUserWorkspaceIdRepo(uid);
  const workspaceSnap = await adminDb
    .collection("sessions")
    .where("workspaceId", "==", workspaceId)
    .orderBy("updatedAt", "desc")
    .limit(createdByLimit)
    .get();
  for (const d of workspaceSnap.docs) ids.add(d.id);

  const email =
    typeof args.userEmail === "string" ? args.userEmail.trim().toLowerCase() : "";
  if (email) {
    const shareSnap = await adminDb
      .collection("session_shares")
      .where("email", "==", email)
      .limit(SHARE_EMAIL_LOOKUP_LIMIT)
      .get();
    for (const d of shareSnap.docs) {
      const row = d.data() as { sessionId?: unknown };
      const sid = typeof row.sessionId === "string" ? row.sessionId.trim() : "";
      if (sid) ids.add(sid);
    }
  }

  const userPayload = { uid, email: args.userEmail ?? null };

  const resolved = await Promise.all(
    [...ids].map(async (sessionId) => {
      const { session, access } = await getAccessContext({
        sessionId,
        user: userPayload,
      });
      if (!access?.capabilities.canView || !session) return null;
      return session;
    })
  );

  const sessions = resolved.filter((s): s is Session => s != null);
  sessions.sort((a, b) => updatedAtMs(b) - updatedAtMs(a));
  return sessions.slice(0, outLimit);
}
