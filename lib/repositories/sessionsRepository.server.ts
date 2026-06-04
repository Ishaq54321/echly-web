import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { assertQueryLimit } from "@/lib/querySafety";
import type {
  Session,
  SessionGeneralAccess,
} from "@/lib/domain/session";
import { requireGeneralAccess } from "@/lib/domain/session";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { requireAccessLevel } from "@/lib/domain/accessLevel";
import type { Workspace } from "@/lib/domain/workspace";
import { deleteAllCommentsForSessionRepo } from "@/lib/repositories/commentsRepository.server";
import { deleteAllFeedbackForSessionRepo } from "@/lib/repositories/feedbackRepository.server";
import { deleteAllSessionAccessForSessionRepo } from "@/lib/repositories/sessionAccessRepository.server";

type SessionDoc = Omit<Session, "id"> & {
  createdAt?: FirebaseFirestore.Timestamp | Date | null;
  updatedAt?: FirebaseFirestore.Timestamp | Date | null;
};

function requireUserId(userId: string, context: string): string {
  const trimmed = userId.trim();
  if (!trimmed) {
    throw new Error(`Missing userId - invalid state (${context})`);
  }
  return trimmed;
}

/**
 * Creates a single new session and increments workspace usage in one transaction.
 * Only writes ONE session document; never modifies existing session documents.
 *
 * SERVER-ONLY: Import and use only from API routes (e.g. POST /api/sessions).
 * Client code must create sessions via POST /api/sessions so plan limits are enforced.
 */
export async function createSessionRepo(
  workspaceId: string,
  actorUserId: string,
  title?: string
): Promise<string> {
  const resolvedWorkspaceId = requireUserId(workspaceId, "createSessionRepo");
  const resolvedActorUserId = requireUserId(actorUserId, "createSessionRepo");
  const sessionRef = adminDb.collection("sessions").doc();
  const workspaceRef = adminDb.doc(`workspaces/${resolvedWorkspaceId}`);
  const sessionData = {
    workspaceId: resolvedWorkspaceId,
    createdByUserId: resolvedActorUserId,
    title: title || "Untitled Session",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    viewCount: 0,
    commentCount: 0,
    openCount: 0,
    resolvedCount: 0,
    totalCount: 0,
    feedbackCount: 0,
    accessLevel: "view",
    generalAccess: "restricted",
    hasConfiguredShare: false,
  };

  await adminDb.runTransaction(async (tx) => {
    tx.set(sessionRef, sessionData);
    tx.update(workspaceRef, {
      sessionCount: FieldValue.increment(1),
      "usage.sessionsCreated": FieldValue.increment(1),
      "stats.totalSessions": FieldValue.increment(1),
      "stats.updatedAt": FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return sessionRef.id;
}

/**
 * Returns the number of *active* sessions in a workspace (active = sessionCount - archivedCount).
 * When workspace is provided and has sessionCount/archivedCount, uses those (instant).
 * Otherwise uses Firestore count queries (slower).
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

  const [allSnap, archivedSnap] = await Promise.all([
    adminDb.collection("sessions").where("workspaceId", "==", workspaceId).count().get(),
    adminDb
      .collection("sessions")
      .where("workspaceId", "==", workspaceId)
      .where("archived", "==", true)
      .count()
      .get(),
  ]);

  const total = allSnap.data().count;
  const archived = archivedSnap.data().count;
  return Math.max(0, total - archived);
}

export async function getSessionByIdRepo(
  sessionId: string
): Promise<Session | null> {
  const snap = await adminDb.doc(`sessions/${sessionId}`).get();
  if (!snap.exists) return null;

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

export async function updateSessionTitleRepo(
  sessionId: string,
  title: string
): Promise<void> {
  await adminDb.doc(`sessions/${sessionId}`).update({
    title,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function updateSessionAccessLevelRepo(
  sessionId: string,
  accessLevel: AccessLevel
): Promise<void> {
  await adminDb.doc(`sessions/${sessionId}`).update({
    accessLevel,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function updateSessionGeneralAccessRepo(
  sessionId: string,
  generalAccess: SessionGeneralAccess
): Promise<void> {
  await adminDb.doc(`sessions/${sessionId}`).update({
    generalAccess,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Updates session.archived and updates workspace.archivedCount.
 */
export async function updateSessionArchivedRepo(
  sessionId: string,
  archived: boolean,
  workspaceScopeId: string
): Promise<void> {
  const resolvedWorkspaceId = requireUserId(workspaceScopeId, "updateSessionArchivedRepo");
  const sessionRef = adminDb.doc(`sessions/${sessionId}`);
  const workspaceRef = adminDb.doc(`workspaces/${resolvedWorkspaceId}`);
  await adminDb.runTransaction(async (tx) => {
    tx.update(sessionRef, {
      archived,
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.update(workspaceRef, {
      archivedCount: FieldValue.increment(archived ? 1 : -1),
      updatedAt: FieldValue.serverTimestamp(),
    });
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
  await adminDb.doc(`sessions/${sessionId}`).update({
    updatedAt: FieldValue.serverTimestamp(),
  });
}

interface RecentViewer {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAnonymous: boolean;
  viewedAt: number;
}

const RECENT_VIEWERS_LIMIT = 20;

/**
 * Loom-style view tracking: sessionViews/{sessionId}/views/{viewerId}.
 * If viewer has not viewed this session, creates the viewer doc and atomically
 * increments session.viewCount. Only counts once per viewer per session.
 *
 * Skips entirely when the viewer is the session creator (don't count own views).
 * Also denormalizes the most recent {@link RECENT_VIEWERS_LIMIT} viewers onto
 * the session doc as `recentViewers` for cheap avatar rendering on list views.
 */
export async function recordSessionViewIfNewRepo(
  sessionId: string,
  viewerId: string,
  viewerProfile?: { displayName?: string | null; avatarUrl?: string | null }
): Promise<void> {
  const viewerRef = adminDb.doc(`sessionViews/${sessionId}/views/${viewerId}`);
  const sessionRef = adminDb.doc(`sessions/${sessionId}`);

  // Captured inside the txn so we can write the "first viewer" notification
  // AFTER the view is durably recorded (and only when this call was the first to
  // record a non-creator viewer). Stays null on early-returns / repeat views.
  let firstView: {
    ownerUid: string;
    sessionName: string;
    workspaceId: string;
  } | null = null;

  await adminDb.runTransaction(async (tx) => {
    const [viewerSnap, sessionSnap] = await Promise.all([
      tx.get(viewerRef),
      tx.get(sessionRef),
    ]);
    if (!sessionSnap.exists) return;

    const sessionData = sessionSnap.data() ?? {};
    if (viewerId === sessionData.createdByUserId) return;

    const isAnonymous = viewerId.startsWith("anon_");
    // NOTE (Phase 25.3): We continue to denormalize avatarUrl into
    // recentViewers[] at write time even though it goes stale (there is no
    // fan-out when a user changes their photo — see app/api/users/avatar).
    // Display logic must NOT trust this field: the dashboard's recent-viewers
    // row resolves it live via the useUserAvatars hook keyed on viewer.id
    // (see components/dashboard/SessionsWorkspace.tsx). The denormalized copy
    // is kept for non-display purposes — recording that this user viewed the
    // session and preserving the viewer history as a permanent record.
    const newViewer: RecentViewer = {
      id: viewerId,
      displayName: viewerProfile?.displayName ?? null,
      avatarUrl: viewerProfile?.avatarUrl ?? null, // display-irrelevant; see note above
      isAnonymous,
      viewedAt: Date.now(),
    };

    const currentViewers: RecentViewer[] = Array.isArray(sessionData.recentViewers)
      ? (sessionData.recentViewers as RecentViewer[])
      : [];
    const filtered = currentViewers.filter((v) => v && v.id !== viewerId);
    filtered.push(newViewer);
    const trimmed = filtered
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, RECENT_VIEWERS_LIMIT);

    if (viewerSnap.exists) {
      // Already counted; only refresh recentViewers ordering / profile.
      tx.update(sessionRef, { recentViewers: trimmed });
      return;
    }

    tx.set(viewerRef, { viewedAt: FieldValue.serverTimestamp() });
    tx.update(sessionRef, {
      viewCount: FieldValue.increment(1),
      recentViewers: trimmed,
    });

    // This call just recorded a brand-new non-creator viewer (creator/repeat
    // views returned above). Mark it for the post-commit notification dispatch.
    const ownerUid =
      typeof sessionData.createdByUserId === "string"
        ? sessionData.createdByUserId.trim()
        : "";
    if (ownerUid) {
      const title =
        typeof sessionData.title === "string" ? sessionData.title.trim() : "";
      const wid =
        typeof sessionData.workspaceId === "string"
          ? sessionData.workspaceId.trim()
          : "";
      firstView = {
        ownerUid,
        sessionName: title || "Untitled Session",
        workspaceId: wid,
      };
    }
  });

  // DIGEST CUTOVER: session-opened previously sent an instant email with NO
  // in-app notification record. We now write a `session.opened` in-app
  // notification to the owner instead — it surfaces in the bell AND flows into
  // the daily activity digest (the email itself is gone). Fire-and-forget so it
  // never blocks view tracking. The emailSends.firstViewerNotified transaction
  // (kept, key unchanged for back-compat) guarantees exactly ONE notification
  // per session ever, even if multiple viewers land simultaneously — matching
  // the previous once-per-session-email semantics.
  if (firstView) {
    const fv: { ownerUid: string; sessionName: string; workspaceId: string } =
      firstView;
    void (async () => {
      try {
        // Don't notify the owner about their own view (defensive — the txn
        // already skips creator views, but a self-view could still reach here
        // via an aliased id). Also need a workspaceId to write the notification.
        if (!fv.workspaceId || fv.ownerUid === viewerId) return;

        const claimed = await adminDb.runTransaction(async (tx) => {
          const snap = await tx.get(sessionRef);
          if (!snap.exists) return false;
          if (snap.data()?.emailSends?.firstViewerNotified) return false;
          tx.set(
            sessionRef,
            {
              emailSends: {
                firstViewerNotified: FieldValue.serverTimestamp(),
              },
            },
            { merge: true }
          );
          return true;
        });
        if (!claimed) return;

        const { getUserByIdRepo } = await import(
          "@/lib/repositories/usersRepository.server"
        );
        const { displayName } = await import("@/lib/email/helpers");
        const { dispatchNotifications } = await import(
          "@/lib/server/notificationFanOut.server"
        );

        const viewerName =
          (viewerProfile?.displayName ?? "").trim() ||
          (viewerId.startsWith("anon_")
            ? "Someone"
            : displayName(
                (await getUserByIdRepo(viewerId)) ?? { email: null }
              ));

        await dispatchNotifications({
          recipientIds: [fv.ownerUid],
          workspaceId: fv.workspaceId,
          sessionId,
          sessionTitle: fv.sessionName,
          type: "session.opened",
          actor: {
            id: viewerId,
            name: viewerName,
            photoURL: viewerProfile?.avatarUrl ?? null,
          },
          title: `${viewerName} opened "${fv.sessionName}"`,
          entityTitle: fv.sessionName,
          body: null,
        });
      } catch (err) {
        console.error("[notification:session-opened] failed:", err);
      }
    })();
  }
}

/**
 * Permanently deletes a session and all associated data: feedback (tickets),
 * comments, view records. Screenshots in Storage are left as-is (TODO: optional cleanup).
 * Decrements workspace.sessionCount, stats.totalSessions, stats.totalFeedback, stats.totalComments,
 * and if session was archived, workspace.archivedCount.
 */
export async function deleteSessionRepo(sessionId: string): Promise<void> {
  const session = await getSessionByIdRepo(sessionId);
  const workspaceId = requireUserId(
    (session?.workspaceId ?? "").toString(),
    "deleteSessionRepo"
  );

  const [feedbackDeleted, commentsDeleted, _sessionAccessDeleted] = await Promise.all([
    deleteAllFeedbackForSessionRepo(sessionId),
    deleteAllCommentsForSessionRepo(workspaceId, sessionId),
    deleteAllSessionAccessForSessionRepo(sessionId),
  ]);

  const viewsSnap = await adminDb.collection(`sessionViews/${sessionId}/views`).get();
  await Promise.all(viewsSnap.docs.map((d) => d.ref.delete()));

  // Cascade delete: bypasses removeSessionMemberRepo for batch efficiency and to
  // avoid emitting per-member activity events during whole-session deletion.
  const membersSnap = await adminDb
    .collection("sessions")
    .doc(sessionId)
    .collection("members")
    .get();
  if (!membersSnap.empty) {
    const BATCH_LIMIT = 500;
    for (let i = 0; i < membersSnap.docs.length; i += BATCH_LIMIT) {
      const batch = adminDb.batch();
      membersSnap.docs.slice(i, i + BATCH_LIMIT).forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  await adminDb.doc(`sessions/${sessionId}`).delete();

  const workspaceRef = adminDb.doc(`workspaces/${workspaceId}`);
  await workspaceRef.update({
    sessionCount: FieldValue.increment(-1),
    ...(session?.archived === true ? { archivedCount: FieldValue.increment(-1) } : {}),
    "stats.totalSessions": FieldValue.increment(-1),
    ...(feedbackDeleted > 0
      ? { "stats.totalFeedback": FieldValue.increment(-feedbackDeleted) }
      : {}),
    ...(commentsDeleted > 0
      ? { "stats.totalComments": FieldValue.increment(-commentsDeleted) }
      : {}),
    "stats.updatedAt": FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

