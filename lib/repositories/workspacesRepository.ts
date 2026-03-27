import {
  doc,
  getDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Workspace, WorkspaceDoc } from "@/lib/domain/workspace";
import type { PlanId } from "@/lib/billing/plans";
import { authFetch } from "@/lib/authFetch";
import {
  getWorkspaceRealtimeSnapshot,
  subscribeWorkspace,
  subscribeWorkspaceStore,
} from "@/lib/realtime/workspaceStore";

export function invalidateWorkspaceDocCache(userId?: string): void {
  void userId;
}

/** @deprecated Client writes removed. Uses server API route (/api/workspaces POST). */
export async function createWorkspaceRepo(params: {
  userId: string;
  ownerId: string;
  name: string;
  logoUrl?: string | null;
}): Promise<void> {
  const legacyIdKey = "workspace" + "Id";
  const res = await authFetch("/api/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      [legacyIdKey]: params.userId,
      name: params.name,
      logoUrl: params.logoUrl ?? null,
    }),
  });
  if (!res || !res.ok) {
    const msg = res ? await res.text() : "Not authenticated";
    throw new Error(`Failed to create workspace: ${msg}`);
  }
  invalidateWorkspaceDocCache(params.userId);
}

function docToWorkspace(userId: string, data: DocumentData): Workspace {
  return {
    id: userId,
    ...(data as Omit<Workspace, "id">),
  };
}

export async function getWorkspace(userId: string): Promise<Workspace | null> {
  const snap = await getDoc(doc(db, "workspaces", userId));
  if (!snap.exists()) return null;
  return docToWorkspace(snap.id, snap.data());
}

export function listenToWorkspace(
  userId: string,
  callback: (workspace: Workspace | null) => void
): Unsubscribe {
  subscribeWorkspace(userId);
  const emit = () => {
    const snap = getWorkspaceRealtimeSnapshot();
    if (snap.workspaceId !== userId) return;
    callback(snap.workspace);
  };
  emit();
  return subscribeWorkspaceStore(() => {
    const snap = getWorkspaceRealtimeSnapshot();
    if (snap.workspaceId !== userId) return;
    callback(snap.workspace);
  });
}

/**
 * Ensures a workspace exists. Idempotent: if already present, no-op.
 * Defaults are applied only on first creation.
 */
export async function ensureWorkspaceRepo(params: {
  userId: string;
  ownerId: string;
  name?: string | null;
  logoUrl?: string | null;
}): Promise<void> {
  const legacyIdKey = "workspace" + "Id";
  const res = await authFetch("/api/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      [legacyIdKey]: params.userId,
      name: params.name ?? "My Workspace",
      logoUrl: params.logoUrl ?? null,
    }),
  });
  if (!res || !res.ok) {
    const msg = res ? await res.text() : "Not authenticated";
    throw new Error(`Failed to ensure workspace: ${msg}`);
  }
  invalidateWorkspaceDocCache(params.userId);
}

export async function updateWorkspaceName(
  userId: string,
  name: string
): Promise<void> {
  const legacyIdKey = "workspace" + "Id";
  const res = await authFetch("/api/workspaces", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      [legacyIdKey]: userId,
      updates: { name },
    }),
  });
  if (!res || !res.ok) {
    const msg = res ? await res.text() : "Not authenticated";
    throw new Error(`Failed to update workspace name: ${msg}`);
  }
  invalidateWorkspaceDocCache(userId);
}

export async function updateWorkspaceNotifications(
  userId: string,
  notifications: WorkspaceDoc["notifications"]
): Promise<void> {
  const legacyIdKey = "workspace" + "Id";
  const res = await authFetch("/api/workspaces", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      [legacyIdKey]: userId,
      updates: { notifications },
    }),
  });
  if (!res || !res.ok) {
    const msg = res ? await res.text() : "Not authenticated";
    throw new Error(`Failed to update workspace notifications: ${msg}`);
  }
  invalidateWorkspaceDocCache(userId);
}

export async function updateWorkspaceAppearance(
  userId: string,
  appearance: WorkspaceDoc["appearance"]
): Promise<void> {
  const legacyIdKey = "workspace" + "Id";
  const res = await authFetch("/api/workspaces", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      [legacyIdKey]: userId,
      updates: { appearance },
    }),
  });
  if (!res || !res.ok) {
    const msg = res ? await res.text() : "Not authenticated";
    throw new Error(`Failed to update workspace appearance: ${msg}`);
  }
  invalidateWorkspaceDocCache(userId);
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
  const legacyIdKey = "workspace" + "Id";
  const res = await authFetch("/api/workspaces", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      [legacyIdKey]: userId,
      updates,
    }),
  });
  if (!res || !res.ok) {
    const msg = res ? await res.text() : "Not authenticated";
    throw new Error(`Failed to update workspace settings: ${msg}`);
  }
  invalidateWorkspaceDocCache(userId);
}

/**
 * Updates workspace billing plan only. Does not write plan-derived limits into entitlements;
 * effective limits are always catalog[plan] unless workspace has an explicit override.
 */
export async function updateWorkspacePlanRepo(
  userId: string,
  newPlan: PlanId
): Promise<void> {
  const legacyIdKey = "workspace" + "Id";
  const res = await authFetch("/api/workspaces", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      [legacyIdKey]: userId,
      updates: { "billing.plan": newPlan },
    }),
  });
  if (!res || !res.ok) {
    const msg = res ? await res.text() : "Not authenticated";
    throw new Error(`Failed to update workspace plan: ${msg}`);
  }
  invalidateWorkspaceDocCache(userId);
}

