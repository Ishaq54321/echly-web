import {
  doc,
  getDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Workspace } from "@/lib/domain/workspace";
import { authFetch } from "@/lib/authFetch";
import {
  getWorkspaceRealtimeSnapshot,
  retainWorkspaceFirestoreListener,
  subscribeWorkspaceStore,
} from "@/lib/realtime/workspaceStore";

export function invalidateWorkspaceDocCache(workspaceId?: string): void {
  void workspaceId;
}

function docToWorkspace(workspaceDocId: string, data: DocumentData): Workspace {
  return {
    id: workspaceDocId,
    ...(data as Omit<Workspace, "id">),
  };
}

/** Reads `workspaces/{workspaceId}` (client SDK). */
export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const wid = workspaceId.trim();
  if (!wid) return null;
  const snap = await getDoc(doc(db, "workspaces", wid));
  if (!snap.exists()) return null;
  return docToWorkspace(snap.id, snap.data());
}

export function listenToWorkspace(
  workspaceId: string,
  callback: (workspace: Workspace | null) => void,
  identityReady: boolean
): Unsubscribe {
  const wid = workspaceId.trim();
  if (!identityReady || !wid) {
    callback(null);
    return () => {};
  }
  const releaseFirestore = retainWorkspaceFirestoreListener(wid);
  const emit = () => {
    const snap = getWorkspaceRealtimeSnapshot();
    if (snap.workspaceId !== wid) return;
    callback(snap.workspace);
  };
  emit();
  const unsubStore = subscribeWorkspaceStore(() => {
    const snap = getWorkspaceRealtimeSnapshot();
    if (snap.workspaceId !== wid) return;
    callback(snap.workspace);
  });
  return () => {
    unsubStore();
    releaseFirestore();
  };
}

export async function updateWorkspaceName(
  workspaceId: string,
  name: string
): Promise<void> {
  const res = await authFetch("/api/workspaces", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workspaceId,
      updates: { name },
    }),
  });
  if (!res || !res.ok) {
    const msg = res ? await res.text() : "Not authenticated";
    throw new Error(`Failed to update workspace name: ${msg}`);
  }
  invalidateWorkspaceDocCache(workspaceId);
}

