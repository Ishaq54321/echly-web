import "server-only";

import {
  getAccessContext,
  buildWorkspaceMemberAccessContextForList,
} from "@/lib/access/getAccessContext";
import { adminDb } from "@/lib/server/firebaseAdmin";
import type { Session } from "@/lib/domain/session";
import { requireGeneralAccess } from "@/lib/domain/session";
import { requireAccessLevel } from "@/lib/domain/accessLevel";
import { assertQueryLimit } from "@/lib/querySafety";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { buildSystemContext } from "@/lib/server/systemContext";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

/**
 * Map a Firestore session doc to {@link Session}. Mirrors `getSessionByIdRepo`'s
 * mapping so list rows and single-fetch rows are shaped identically. Returns
 * null for docs missing the required `workspaceId` / `createdByUserId`.
 */
function mapSessionDoc(snap: QueryDocumentSnapshot): Session | null {
  const data = snap.data() as Record<string, unknown>;
  const workspaceId =
    typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
  const createdByUserId =
    typeof data.createdByUserId === "string"
      ? data.createdByUserId.trim()
      : "";
  if (!workspaceId || !createdByUserId) return null;
  return {
    ...(data as Omit<Session, "id">),
    id: snap.id,
    workspaceId,
    createdByUserId,
    accessLevel: requireAccessLevel(data.accessLevel),
    generalAccess: requireGeneralAccess(data.generalAccess),
    hasConfiguredShare: data.hasConfiguredShare === true,
  };
}

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

  const workspaceId = await getUserWorkspaceIdRepo(uid);
  const wsTrim = workspaceId.trim();
  const workspaceSnap = await adminDb
    .collection("sessions")
    .where("workspaceId", "==", workspaceId)
    .orderBy("updatedAt", "desc")
    .limit(ownerSessionsQueryLimit)
    .get();

  // The query filters by `workspaceId == <viewer workspace>`, so every row is a
  // session in the viewer's own workspace. A workspace member always resolves to
  // at least RESOLVER (canView=true) — proven by `resolveAccess` — so the full
  // per-session access fan-out (5 reads/session) is redundant here and is
  // replaced by `buildWorkspaceMemberAccessContextForList`. The slow path
  // (`getAccessContext` with the already-fetched session, no re-fetch) is kept
  // only as a defensive fallback for the structurally-impossible case where a
  // returned doc's workspaceId does not equal the viewer's workspace.
  const accessCallerContext = buildSystemContext({
    userId: uid,
    workspaceId: wsTrim === "" ? null : wsTrim,
  });

  let fastPathCount = 0;
  let slowPathCount = 0;

  const resolved = await Promise.all(
    workspaceSnap.docs.map(async (doc) => {
      const session = mapSessionDoc(doc);
      if (!session) return null;

      if (wsTrim !== "" && session.workspaceId.trim() === wsTrim) {
        fastPathCount += 1;
        const { access } = buildWorkspaceMemberAccessContextForList({
          uid,
          session,
          viewerWorkspaceId: wsTrim,
        });
        if (!access.capabilities.canView) return null;
        return session;
      }

      slowPathCount += 1;
      const { session: resolvedSession, access } = await getAccessContext({
        sessionId: session.id,
        context: accessCallerContext,
        session,
      });
      if (!access.capabilities.canView) return null;
      return resolvedSession;
    })
  );

  // TEMP (Phase 2.1c verification — remove after Firestore-read drop confirmed):
  console.log(
    `[sessions] fast-path: ${fastPathCount}, slow-path: ${slowPathCount}`
  );

  const sessions = resolved.filter((s): s is Session => s != null);
  sessions.sort((a, b) => updatedAtMs(b) - updatedAtMs(a));
  return sessions.slice(0, outLimit);
}
