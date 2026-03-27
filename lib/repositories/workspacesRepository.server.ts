import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { Workspace, WorkspaceDoc } from "@/lib/domain/workspace";
import { defaultWorkspaceDoc } from "@/lib/domain/workspace";
import type { PlanId } from "@/lib/billing/plans";

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
}): Promise<void> {
  const resolvedUserId = requireUserId(params.userId, "createWorkspaceRepo");
  const ref = adminDb.doc(`workspaces/${resolvedUserId}`);
  const payload: WorkspaceDoc = defaultWorkspaceDoc({
    ownerId: params.ownerId,
    name: params.name.trim() || "My Workspace",
    logoUrl: params.logoUrl ?? null,
  });
  await ref.set({
    ...payload,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  invalidateWorkspaceDocCache(resolvedUserId);
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
      | "ai"
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

