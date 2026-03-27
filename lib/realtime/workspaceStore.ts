"use client";

import { useSyncExternalStore } from "react";
import { doc, onSnapshot, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Workspace } from "@/lib/domain/workspace";

export interface WorkspaceUsageRealtimeData {
  plan: string;
  sessionUsed: number;
}

type WorkspaceStoreSnapshot = {
  workspaceId: string | null;
  workspace: Workspace | null;
  data: WorkspaceUsageRealtimeData | null;
  loading: boolean;
  error: Error | null;
  version: number;
};

let snapshot: WorkspaceStoreSnapshot = {
  workspaceId: null,
  workspace: null,
  data: null,
  loading: false,
  error: null,
  version: 0,
};

let unsubscribe: (() => void) | null = null;
let currentWorkspaceId: string | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: Partial<WorkspaceStoreSnapshot>) {
  snapshot = {
    ...snapshot,
    ...next,
    version: snapshot.version + 1,
  };
  emitChange();
}

function asNumber(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value;
}

function resolvePlan(data: DocumentData): string {
  const topLevelPlan = data?.plan;
  if (typeof topLevelPlan === "string" && topLevelPlan.trim()) return topLevelPlan;

  const billingPlan = data?.billing?.plan;
  if (typeof billingPlan === "string" && billingPlan.trim()) return billingPlan;

  throw new Error("Invalid workspace plan data");
}

function resolveSessionUsed(data: DocumentData): number {
  const topLevelUsed = asNumber(data?.sessionUsed);
  if (topLevelUsed != null) return Math.max(0, topLevelUsed);

  const sessionCount = asNumber(data?.sessionCount) ?? 0;
  const archivedCount = asNumber(data?.archivedCount) ?? 0;
  const activeSessions = sessionCount - archivedCount;
  return Math.max(0, activeSessions);
}

function mapWorkspaceUsage(data: DocumentData): WorkspaceUsageRealtimeData {
  return {
    plan: resolvePlan(data),
    sessionUsed: resolveSessionUsed(data),
  };
}

function mapWorkspaceDoc(workspaceId: string, data: DocumentData): Workspace {
  return {
    id: workspaceId,
    ...(data as Omit<Workspace, "id">),
  };
}

export function subscribeWorkspaceStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWorkspaceRealtimeSnapshot(): WorkspaceStoreSnapshot {
  return snapshot;
}

export function useWorkspaceRealtimeStore(): WorkspaceStoreSnapshot {
  return useSyncExternalStore(
    subscribeWorkspaceStore,
    getWorkspaceRealtimeSnapshot,
    getWorkspaceRealtimeSnapshot
  );
}

export function subscribeWorkspace(workspaceId: string): void {
  if (!workspaceId || !workspaceId.trim()) {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    currentWorkspaceId = null;
    setSnapshot({
      workspaceId: null,
      workspace: null,
      data: null,
      loading: false,
      error: new Error("Invalid workspaceId"),
    });
    return;
  }

  const normalizedWorkspaceId = workspaceId.trim();

  if (unsubscribe && currentWorkspaceId === normalizedWorkspaceId) {
    return;
  }

  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  currentWorkspaceId = normalizedWorkspaceId;
  setSnapshot({
    workspaceId: normalizedWorkspaceId,
    loading: true,
    error: null,
  });

  unsubscribe = onSnapshot(
    doc(db, "workspaces", normalizedWorkspaceId),
    (snap) => {
      if (!snap.exists()) {
        setSnapshot({
          workspace: null,
          data: null,
          loading: false,
          error: new Error("Workspace document missing"),
        });
        return;
      }
      try {
        const raw = snap.data();
        setSnapshot({
          workspace: mapWorkspaceDoc(snap.id, raw),
          data: mapWorkspaceUsage(raw),
          loading: false,
          error: null,
        });
      } catch (e) {
        setSnapshot({
          workspace: null,
          data: null,
          loading: false,
          error: e instanceof Error ? e : new Error(String(e)),
        });
      }
    },
    (err) => {
      setSnapshot({
        workspace: null,
        data: null,
        loading: false,
        error: err instanceof Error ? err : new Error(String(err ?? "Failed to load workspace usage")),
      });
    }
  );
}

export function clearWorkspaceSubscription(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  currentWorkspaceId = null;
  setSnapshot({
    workspaceId: null,
    workspace: null,
    data: null,
    loading: false,
    error: null,
  });
}
