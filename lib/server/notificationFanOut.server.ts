import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { listSessionMembers } from "@/lib/repositories/sessionMembersRepository.server";
import { getWorkspaceMembersRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import {
  createNotifications,
  type CreateNotificationData,
} from "@/lib/repositories/notificationsRepository.server";
import type { NotificationType } from "@/lib/domain/notification";

export interface ResolveSessionRecipientsOptions {
  sessionId: string;
  workspaceId: string;
  includeWorkspaceOwners?: boolean;
  excludeUserIds?: string[];
}

export async function resolveSessionRecipients(
  options: ResolveSessionRecipientsOptions
): Promise<string[]> {
  const {
    sessionId,
    workspaceId,
    includeWorkspaceOwners = true,
    excludeUserIds = [],
  } = options;

  const recipients = new Set<string>();

  const members = await listSessionMembers(sessionId);
  for (const m of members) {
    if (typeof m.userId === "string" && m.userId.trim() !== "") {
      recipients.add(m.userId);
    }
  }

  const sessionSnap = await adminDb.collection("sessions").doc(sessionId).get();
  const sessionOwnerId = sessionSnap.data()?.userId;
  if (typeof sessionOwnerId === "string" && sessionOwnerId.trim() !== "") {
    recipients.add(sessionOwnerId);
  }

  if (includeWorkspaceOwners && workspaceId) {
    const wsMembers = await getWorkspaceMembersRepo(workspaceId);
    for (const wm of wsMembers) {
      if (wm.role === "OWNER" && typeof wm.uid === "string" && wm.uid) {
        recipients.add(wm.uid);
      }
    }
  }

  for (const id of excludeUserIds) {
    if (id) recipients.delete(id);
  }

  return Array.from(recipients);
}

export interface DispatchNotificationParams {
  recipientIds: string[];
  workspaceId: string;
  sessionId: string;
  sessionTitle?: string | null;
  feedbackId?: string | null;
  commentId?: string | null;
  type: NotificationType;
  actor: { id: string; name: string; photoURL?: string | null };
  title: string;
  entityTitle?: string | null;
  body?: string | null;
  accessRequestId?: string | null;
  requestedAccess?: "view" | "resolve" | null;
  actionStatus?: "pending" | "approved" | "rejected" | null;
}

export async function dispatchNotifications(
  params: DispatchNotificationParams
): Promise<void> {
  if (params.recipientIds.length === 0) return;

  const notifications: CreateNotificationData[] = params.recipientIds.map(
    (uid) => ({
      userId: uid,
      workspaceId: params.workspaceId,
      sessionId: params.sessionId,
      sessionTitle: params.sessionTitle ?? null,
      feedbackId: params.feedbackId ?? null,
      commentId: params.commentId ?? null,
      type: params.type,
      actor: params.actor,
      title: params.title,
      entityTitle: params.entityTitle ?? null,
      body: params.body ?? null,
      accessRequestId: params.accessRequestId ?? null,
      requestedAccess: params.requestedAccess ?? null,
      actionStatus: params.actionStatus ?? null,
    })
  );

  await createNotifications(notifications);
}
