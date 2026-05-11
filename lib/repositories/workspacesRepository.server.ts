import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { Workspace, WorkspaceDoc } from "@/lib/domain/workspace";
import { defaultWorkspaceDoc } from "@/lib/domain/workspace";
import type { PlanId } from "@/lib/billing/plans";
import { addWorkspaceMemberRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import { addWorkspaceMembershipRepo } from "@/lib/repositories/userMembershipsRepository.server";

function requireUserId(userId: string, context: string): string {
  const trimmed = userId.trim();
  if (!trimmed) {
    throw new Error(`Missing userId - invalid state (${context})`);
  }
  return trimmed;
}

export function invalidateWorkspaceDocCache(userId?: string): void {
  void userId;
}

function docToWorkspace(workspaceId: string, data: FirebaseFirestore.DocumentData): Workspace {
  return {
    id: workspaceId,
    ...(data as Omit<Workspace, "id">),
  };
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const snap = await adminDb.doc(`workspaces/${workspaceId}`).get();
  if (!snap.exists) return null;
  return docToWorkspace(snap.id, snap.data() as FirebaseFirestore.DocumentData);
}

export async function createWorkspaceRepo(params: {
  userId: string;
  ownerId: string;
  name: string;
  logoUrl?: string | null;
  ownerEmail?: string | null;
  ownerName?: string | null;
}): Promise<void> {
  const resolvedUserId = requireUserId(params.userId, "createWorkspaceRepo");
  const ref = adminDb.doc(`workspaces/${resolvedUserId}`);
  const payload: WorkspaceDoc = defaultWorkspaceDoc({
    ownerId: params.ownerId,
    name: params.name.trim() || "My Workspace",
    logoUrl: params.logoUrl ?? null,
  });
  try {
    await ref.create({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 6) {
      // ALREADY_EXISTS — concurrent request won the race. If the existing
      // workspace is owned by the same user, fall through and ensure the
      // owner member + membership records exist (idempotent). If a different
      // owner already holds this slot, surface a real conflict.
      const existing = await ref.get();
      const existingOwnerId = existing.data()?.ownerId;
      if (existingOwnerId !== params.ownerId) {
        throw new Error("Workspace already exists with a different owner");
      }
    } else {
      throw err;
    }
  }
  invalidateWorkspaceDocCache(resolvedUserId);

  // Idempotent member add: skip the inner usage.members increment if the
  // owner member doc already exists (we lost the race or are retrying).
  const memberRef = adminDb.doc(`workspaces/${resolvedUserId}/members/${params.ownerId}`);
  const memberSnap = await memberRef.get();
  if (!memberSnap.exists) {
    const ownerSnap = await adminDb.doc(`users/${params.ownerId}`).get();
    const ownerAvatarUrl = ownerSnap.exists
      ? ((ownerSnap.data()?.avatarUrl ?? ownerSnap.data()?.photoURL) as string | null | undefined) ?? null
      : null;
    await addWorkspaceMemberRepo(resolvedUserId, {
      uid: params.ownerId,
      email: params.ownerEmail ?? "",
      displayName: params.ownerName ?? null,
      avatarUrl: ownerAvatarUrl,
      role: "OWNER",
      joinedAt: Timestamp.now(),
      invitedBy: null,
    });
  }

  // arrayUnion is idempotent — safe to call regardless of race outcome.
  await addWorkspaceMembershipRepo(params.ownerId, resolvedUserId);
}

export async function updateWorkspaceName(userId: string, name: string): Promise<void> {
  const resolvedUserId = requireUserId(userId, "updateWorkspaceName");
  await adminDb.doc(`workspaces/${resolvedUserId}`).update({
    name,
    updatedAt: FieldValue.serverTimestamp(),
  });
  invalidateWorkspaceDocCache(resolvedUserId);
}

export async function updateWorkspaceNotifications(
  userId: string,
  notifications: WorkspaceDoc["notifications"]
): Promise<void> {
  const resolvedUserId = requireUserId(
    userId,
    "updateWorkspaceNotifications"
  );
  await adminDb.doc(`workspaces/${resolvedUserId}`).update({
    notifications,
    updatedAt: FieldValue.serverTimestamp(),
  });
  invalidateWorkspaceDocCache(resolvedUserId);
}

export async function updateWorkspaceAppearance(
  userId: string,
  appearance: WorkspaceDoc["appearance"]
): Promise<void> {
  const resolvedUserId = requireUserId(userId, "updateWorkspaceAppearance");
  await adminDb.doc(`workspaces/${resolvedUserId}`).update({
    appearance,
    updatedAt: FieldValue.serverTimestamp(),
  });
  invalidateWorkspaceDocCache(resolvedUserId);
}

export async function updateWorkspaceSettings(
  userId: string,
  updates: Partial<
    Pick<
      WorkspaceDoc,
      | "name"
      | "logoUrl"
      | "appearance"
      | "notifications"
      | "automations"
      | "permissions"
      | "integrations"
      | "billing"
      | "entitlements"
      | "usage"
    >
  >
): Promise<void> {
  const resolvedUserId = requireUserId(userId, "updateWorkspaceSettings");
  const payload: Record<string, unknown> = {
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  };
  await adminDb.doc(`workspaces/${resolvedUserId}`).update(payload);
  invalidateWorkspaceDocCache(resolvedUserId);
}

export async function updateWorkspacePlanRepo(
  userId: string,
  newPlan: PlanId
): Promise<void> {
  const resolvedUserId = requireUserId(userId, "updateWorkspacePlanRepo");
  await adminDb.doc(`workspaces/${resolvedUserId}`).update({
    "billing.plan": newPlan,
    updatedAt: FieldValue.serverTimestamp(),
  } as Record<string, unknown>);
  invalidateWorkspaceDocCache(resolvedUserId);
}

/**
 * Increments workspace.usage.feedbackCreatedThisMonth by 1.
 * Called after a feedback ticket is successfully created.
 */
export async function incrementFeedbackCreatedThisMonthRepo(
  workspaceId: string
): Promise<void> {
  const trimmed = workspaceId.trim();
  if (!trimmed) throw new Error("Missing workspaceId - incrementFeedbackCreatedThisMonthRepo");
  await adminDb.doc(`workspaces/${trimmed}`).update({
    "usage.feedbackCreated": FieldValue.increment(1),
    "usage.feedbackCreatedThisMonth": FieldValue.increment(1),
  });
}

