import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import type { NotificationRow, NotificationType } from "@/lib/domain/notification";

/**
 * Required Firestore composite indexes (notifications):
 *   1. userId ASC, createdAt DESC, __name__ DESC
 *   2. userId ASC, read ASC, createdAt DESC, __name__ DESC
 */

const COLLECTION = "notifications";
const LIST_LIMIT_DEFAULT = 20;
const LIST_LIMIT_MAX = 50;
const BATCH_CHUNK = 400;
const MARK_ALL_READ_LIMIT = 500;

export interface CreateNotificationData {
  userId: string;
  workspaceId: string;
  sessionId: string;
  sessionTitle?: string | null;
  feedbackId?: string | null;
  commentId?: string | null;
  type: NotificationType | string;
  actor: { id: string; name: string; photoURL?: string | null };
  title: string;
  entityTitle?: string | null;
  body?: string | null;
  accessRequestId?: string | null;
  requestedAccess?: "view" | "resolve" | null;
  actionStatus?: "pending" | "approved" | "rejected" | null;
}

function buildPayload(data: CreateNotificationData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    userId: data.userId,
    workspaceId: data.workspaceId,
    sessionId: data.sessionId,
    type: data.type,
    actor: {
      id: data.actor.id,
      name: data.actor.name,
      ...(data.actor.photoURL ? { photoURL: data.actor.photoURL } : {}),
    },
    title: data.title,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  };
  if (data.sessionTitle) payload.sessionTitle = data.sessionTitle;
  if (data.feedbackId) payload.feedbackId = data.feedbackId;
  if (data.commentId) payload.commentId = data.commentId;
  if (data.entityTitle) payload.entityTitle = data.entityTitle;
  if (data.body) payload.body = data.body;
  if (data.accessRequestId) payload.accessRequestId = data.accessRequestId;
  if (data.requestedAccess) payload.requestedAccess = data.requestedAccess;
  if (data.actionStatus !== undefined) payload.actionStatus = data.actionStatus ?? null;
  return payload;
}

export async function createNotification(data: CreateNotificationData): Promise<string> {
  const ref = adminDb.collection(COLLECTION).doc();
  await ref.set(buildPayload(data));
  return ref.id;
}

export async function createNotifications(
  notifications: CreateNotificationData[]
): Promise<void> {
  if (notifications.length === 0) return;
  for (let i = 0; i < notifications.length; i += BATCH_CHUNK) {
    const chunk = notifications.slice(i, i + BATCH_CHUNK);
    const batch = adminDb.batch();
    for (const data of chunk) {
      const ref = adminDb.collection(COLLECTION).doc();
      batch.set(ref, buildPayload(data));
    }
    await batch.commit();
  }
}

export interface NotificationsCursor {
  createdAt: number;
  id: string;
}

export interface GetNotificationsOptions {
  limit?: number;
  cursor?: NotificationsCursor | null;
  unreadOnly?: boolean;
}

export interface GetNotificationsResult {
  notifications: NotificationRow[];
  nextCursor: string | null;
}

function rowFromDoc(doc: FirebaseFirestore.QueryDocumentSnapshot): NotificationRow {
  const d = doc.data();
  return {
    id: doc.id,
    userId: typeof d.userId === "string" ? d.userId : "",
    workspaceId: typeof d.workspaceId === "string" ? d.workspaceId : "",
    sessionId: typeof d.sessionId === "string" ? d.sessionId : "",
    sessionTitle: typeof d.sessionTitle === "string" ? d.sessionTitle : null,
    feedbackId: typeof d.feedbackId === "string" ? d.feedbackId : null,
    commentId: typeof d.commentId === "string" ? d.commentId : null,
    type: d.type,
    actor: d.actor,
    title: typeof d.title === "string" ? d.title : "",
    entityTitle: typeof d.entityTitle === "string" ? d.entityTitle : null,
    body: typeof d.body === "string" ? d.body : null,
    read: d.read === true,
    readAt: d.readAt?.toMillis?.() ?? null,
    createdAt: d.createdAt?.toMillis?.() ?? null,
    accessRequestId: typeof d.accessRequestId === "string" ? d.accessRequestId : null,
    requestedAccess:
      d.requestedAccess === "view" || d.requestedAccess === "resolve"
        ? d.requestedAccess
        : null,
    actionStatus:
      d.actionStatus === "pending" ||
      d.actionStatus === "approved" ||
      d.actionStatus === "rejected"
        ? d.actionStatus
        : null,
  };
}

export async function getNotifications(
  userId: string,
  options?: GetNotificationsOptions
): Promise<GetNotificationsResult> {
  const uid = userId.trim();
  if (!uid) return { notifications: [], nextCursor: null };

  const rawLimit =
    typeof options?.limit === "number" && Number.isFinite(options.limit)
      ? Math.floor(options.limit)
      : LIST_LIMIT_DEFAULT;
  const limit = Math.min(LIST_LIMIT_MAX, Math.max(1, rawLimit));

  let query: FirebaseFirestore.Query = adminDb
    .collection(COLLECTION)
    .where("userId", "==", uid);

  if (options?.unreadOnly) {
    query = query.where("read", "==", false);
  }

  query = query
    .orderBy("createdAt", "desc")
    .orderBy(FieldPath.documentId(), "desc");

  if (options?.cursor) {
    query = query.startAfter(
      Timestamp.fromMillis(options.cursor.createdAt),
      options.cursor.id
    );
  }

  query = query.limit(limit);

  const snap = await query.get();
  const notifications = snap.docs.map((d) =>
    rowFromDoc(d as FirebaseFirestore.QueryDocumentSnapshot)
  );

  let nextCursor: string | null = null;
  if (notifications.length === limit) {
    const last = notifications[notifications.length - 1];
    if (last && last.createdAt != null) {
      nextCursor = JSON.stringify({ createdAt: last.createdAt, id: last.id });
    }
  }

  return { notifications, nextCursor };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const uid = userId.trim();
  if (!uid) return 0;
  const snap = await adminDb
    .collection(COLLECTION)
    .where("userId", "==", uid)
    .where("read", "==", false)
    .count()
    .get();
  return snap.data().count;
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  const uid = userId.trim();
  const id = notificationId.trim();
  if (!uid || !id) return;

  const ref = adminDb.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return;
  if (snap.data()?.userId !== uid) return;

  await ref.update({
    read: true,
    readAt: FieldValue.serverTimestamp(),
  });
}

export async function updateNotificationActionStatus(
  userId: string,
  notificationId: string,
  actionStatus: "approved" | "rejected"
): Promise<boolean> {
  const uid = userId.trim();
  const id = notificationId.trim();
  if (!uid || !id) return false;

  const ref = adminDb.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  if (snap.data()?.userId !== uid) return false;

  await ref.update({
    actionStatus,
    read: true,
    readAt: FieldValue.serverTimestamp(),
  });
  return true;
}

export async function markAllRead(userId: string): Promise<number> {
  const uid = userId.trim();
  if (!uid) return 0;

  const snap = await adminDb
    .collection(COLLECTION)
    .where("userId", "==", uid)
    .where("read", "==", false)
    .limit(MARK_ALL_READ_LIMIT)
    .get();

  if (snap.empty) return 0;

  const batch = adminDb.batch();
  const now = FieldValue.serverTimestamp();
  for (const doc of snap.docs) {
    batch.update(doc.ref, { read: true, readAt: now });
  }
  await batch.commit();
  return snap.size;
}
