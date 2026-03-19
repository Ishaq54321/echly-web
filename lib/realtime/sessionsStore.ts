"use client";

import { useSyncExternalStore } from "react";
import { collection, onSnapshot, query, where, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Session } from "@/lib/domain/session";

type SessionsStoreSnapshot = {
  workspaceId: string | null;
  items: Session[];
  loading: boolean;
  error: string | null;
  version: number;
};

let snapshot: SessionsStoreSnapshot = {
  workspaceId: null,
  items: [],
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

function setSnapshot(next: Partial<SessionsStoreSnapshot>) {
  snapshot = {
    ...snapshot,
    ...next,
    version: snapshot.version + 1,
  };
  emitChange();
}

function mapSession(id: string, data: DocumentData): Session {
  return {
    id,
    ...(data as Omit<Session, "id">),
  };
}

export function subscribeSessionsStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSessionsSnapshot(): SessionsStoreSnapshot {
  return snapshot;
}

export function useSessionsRealtimeStore(): SessionsStoreSnapshot {
  return useSyncExternalStore(subscribeSessionsStore, getSessionsSnapshot, getSessionsSnapshot);
}

export function subscribeSessions(workspaceId: string): void {
  const normalizedWorkspaceId = workspaceId.trim();
  if (!normalizedWorkspaceId) return;

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
    items: [],
  });

  const sessionsQuery = query(
    collection(db, "sessions"),
    where("workspaceId", "==", normalizedWorkspaceId)
  );

  unsubscribe = onSnapshot(
    sessionsQuery,
    (snap) => {
      setSnapshot({
        items: snap.docs.map((docSnap) => mapSession(docSnap.id, docSnap.data())),
        loading: false,
        error: null,
      });
    },
    (err) => {
      setSnapshot({
        items: [],
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load sessions realtime",
      });
    }
  );
}

export function clearSessionsSubscription(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  currentWorkspaceId = null;
  setSnapshot({
    workspaceId: null,
    items: [],
    loading: false,
    error: null,
  });
}
