import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { Workspace, WorkspaceDoc } from "@/lib/domain/workspace";
import type { PlanId } from "@/lib/billing/plans";

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

export async function updateWorkspacePlanRepo(
  workspaceId: string,
  newPlan: PlanId
): Promise<void> {
  await adminDb.doc(`workspaces/${workspaceId}`).update({
    "billing.plan": newPlan,
    updatedAt: FieldValue.serverTimestamp(),
  } as Record<string, unknown>);
  invalidateWorkspaceDocCache(workspaceId);
}

