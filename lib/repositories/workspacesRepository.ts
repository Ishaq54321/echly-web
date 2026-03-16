import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Workspace, WorkspaceDoc } from "@/lib/domain/workspace";
import { defaultWorkspaceDoc } from "@/lib/domain/workspace";
import type { PlanId } from "@/lib/billing/plans";

/** Used by onboarding: create a new workspace and return its id (caller must update user.workspaceId). */
export async function createWorkspaceRepo(params: {
  workspaceId: string;
  ownerId: string;
  name: string;
  logoUrl?: string | null;
}): Promise<void> {
  const ref = doc(db, "workspaces", params.workspaceId);
  const payload: WorkspaceDoc = defaultWorkspaceDoc({
    ownerId: params.ownerId,
    name: params.name.trim() || "My Workspace",
    logoUrl: params.logoUrl ?? null,
  });
  await setDoc(ref, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function docToWorkspace(workspaceId: string, data: DocumentData): Workspace {
  return {
    id: workspaceId,
    ...(data as Omit<Workspace, "id">),
  };
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const snap = await getDoc(doc(db, "workspaces", workspaceId));
  if (!snap.exists()) return null;
  return docToWorkspace(snap.id, snap.data());
}

export function listenToWorkspace(
  workspaceId: string,
  callback: (workspace: Workspace | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "workspaces", workspaceId), (snap) => {
    callback(snap.exists() ? docToWorkspace(snap.id, snap.data()) : null);
  });
}

/**
 * Ensures a workspace exists. Idempotent: if already present, no-op.
 * Defaults are applied only on first creation.
 */
export async function ensureWorkspaceRepo(params: {
  workspaceId: string;
  ownerId: string;
  name?: string | null;
  logoUrl?: string | null;
}): Promise<void> {
  const ref = doc(db, "workspaces", params.workspaceId);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const payload: WorkspaceDoc = defaultWorkspaceDoc({
    ownerId: params.ownerId,
    name: params.name ?? null,
    logoUrl: params.logoUrl ?? null,
  });

  await setDoc(ref, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateWorkspaceName(
  workspaceId: string,
  name: string
): Promise<void> {
  await updateDoc(doc(db, "workspaces", workspaceId), {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function updateWorkspaceNotifications(
  workspaceId: string,
  notifications: WorkspaceDoc["notifications"]
): Promise<void> {
  await updateDoc(doc(db, "workspaces", workspaceId), {
    notifications,
    updatedAt: serverTimestamp(),
  });
}

export async function updateWorkspaceAppearance(
  workspaceId: string,
  appearance: WorkspaceDoc["appearance"]
): Promise<void> {
  await updateDoc(doc(db, "workspaces", workspaceId), {
    appearance,
    updatedAt: serverTimestamp(),
  });
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
      | "ai"
      | "integrations"
      | "billing"
      | "entitlements"
      | "usage"
    >
  >
): Promise<void> {
  const payload: Record<string, unknown> = { ...updates, updatedAt: serverTimestamp() };
  await updateDoc(doc(db, "workspaces", workspaceId), payload);
}

/**
 * Updates workspace billing plan only. Does not write plan-derived limits into entitlements;
 * effective limits are always catalog[plan] unless workspace has an explicit override.
 */
export async function updateWorkspacePlanRepo(
  workspaceId: string,
  newPlan: PlanId
): Promise<void> {
  const ref = doc(db, "workspaces", workspaceId);
  await updateDoc(ref, {
    "billing.plan": newPlan,
    updatedAt: serverTimestamp(),
  });
}

