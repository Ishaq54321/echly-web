import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { Workspace, WorkspaceDoc } from "@/lib/domain/workspace";
import { defaultWorkspaceDoc } from "@/lib/domain/workspace";
import type { PlanId } from "@/lib/billing/plans";
import { addWorkspaceMemberRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import { addWorkspaceMembershipRepo } from "@/lib/repositories/userMembershipsRepository.server";

function requireWorkspaceId(workspaceId: string, context: string): string {
  const trimmed = workspaceId.trim();
  if (!trimmed) {
    throw new Error(`Missing workspaceId - invalid state (${context})`);
  }
  return trimmed;
}

export function invalidateWorkspaceDocCache(workspaceId?: string): void {
  void workspaceId;
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
  workspaceId: string;
  ownerId: string;
  name: string;
  logoUrl?: string | null;
  ownerEmail?: string | null;
  ownerName?: string | null;
}): Promise<void> {
  const resolvedWorkspaceId = requireWorkspaceId(params.workspaceId, "createWorkspaceRepo");
  const ref = adminDb.doc(`workspaces/${resolvedWorkspaceId}`);
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
  invalidateWorkspaceDocCache(resolvedWorkspaceId);

  // Idempotent member add: skip the inner usage.members increment if the
  // owner member doc already exists (we lost the race or are retrying).
  const memberRef = adminDb.doc(`workspaces/${resolvedWorkspaceId}/members/${params.ownerId}`);
  const memberSnap = await memberRef.get();
  if (!memberSnap.exists) {
    const ownerSnap = await adminDb.doc(`users/${params.ownerId}`).get();
    const ownerAvatarUrl = ownerSnap.exists
      ? ((ownerSnap.data()?.avatarUrl ?? ownerSnap.data()?.photoURL) as string | null | undefined) ?? null
      : null;
    await addWorkspaceMemberRepo(resolvedWorkspaceId, {
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
  await addWorkspaceMembershipRepo(params.ownerId, resolvedWorkspaceId);
}

export async function updateWorkspaceName(workspaceId: string, name: string): Promise<void> {
  const resolvedWorkspaceId = requireWorkspaceId(workspaceId, "updateWorkspaceName");
  await adminDb.doc(`workspaces/${resolvedWorkspaceId}`).update({
    name,
    updatedAt: FieldValue.serverTimestamp(),
  });
  invalidateWorkspaceDocCache(resolvedWorkspaceId);
}

export async function updateWorkspaceNotifications(
  workspaceId: string,
  notifications: WorkspaceDoc["notifications"]
): Promise<void> {
  const resolvedWorkspaceId = requireWorkspaceId(
    workspaceId,
    "updateWorkspaceNotifications"
  );
  await adminDb.doc(`workspaces/${resolvedWorkspaceId}`).update({
    notifications,
    updatedAt: FieldValue.serverTimestamp(),
  });
  invalidateWorkspaceDocCache(resolvedWorkspaceId);
}

export async function updateWorkspaceAppearance(
  workspaceId: string,
  appearance: WorkspaceDoc["appearance"]
): Promise<void> {
  const resolvedWorkspaceId = requireWorkspaceId(workspaceId, "updateWorkspaceAppearance");
  await adminDb.doc(`workspaces/${resolvedWorkspaceId}`).update({
    appearance,
    updatedAt: FieldValue.serverTimestamp(),
  });
  invalidateWorkspaceDocCache(resolvedWorkspaceId);
}

export async function updateWorkspaceSettings(
  workspaceId: string,
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
  const resolvedWorkspaceId = requireWorkspaceId(workspaceId, "updateWorkspaceSettings");
  const payload: Record<string, unknown> = {
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  };
  await adminDb.doc(`workspaces/${resolvedWorkspaceId}`).update(payload);
  invalidateWorkspaceDocCache(resolvedWorkspaceId);
}

export async function updateWorkspacePlanRepo(
  workspaceId: string,
  newPlan: PlanId
): Promise<void> {
  const resolvedWorkspaceId = requireWorkspaceId(workspaceId, "updateWorkspacePlanRepo");
  await adminDb.doc(`workspaces/${resolvedWorkspaceId}`).update({
    "billing.plan": newPlan,
    updatedAt: FieldValue.serverTimestamp(),
  } as Record<string, unknown>);
  invalidateWorkspaceDocCache(resolvedWorkspaceId);
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

