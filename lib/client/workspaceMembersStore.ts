"use client";

import { useSyncExternalStore } from "react";
import { authFetch } from "@/lib/authFetch";

/**
 * Phase 28.X — client cache for the workspace member list.
 *
 * Why this exists: AssignDropdown is keyed by `key={assign-${item.id}}` in
 * FeedbackHeader, so navigating between feedback items remounts it and
 * destroyed its local member cache — every open re-hit GET
 * /api/workspace/members (token verify + 4 serial Firestore round-trips).
 * Members rarely change mid-session, so this module-level cache (warmed by a
 * WorkspaceProvider prefetch) serves the list instantly across remounts.
 *
 * Pattern: module-level snapshot + listener set consumed via
 * useSyncExternalStore — identical to lib/realtime/workspaceStore.ts. (The
 * plan called this a "Zustand store"; zustand is not a dependency in this
 * repo and the established store pattern here is useSyncExternalStore, so we
 * use that rather than add a new cache layer.)
 *
 * The row shape mirrors EXACTLY what AssignDropdown consumed from
 * `body.data.members` before this cache existed — do not reshape it here.
 */
export interface WorkspaceMemberRow {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string;
}

const TTL_MS = 5 * 60 * 1000; // 5 min

type Snapshot = {
  members: WorkspaceMemberRow[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  lastWorkspaceId: string | null;
  version: number;
};

let snapshot: Snapshot = {
  members: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,
  lastWorkspaceId: null,
  version: 0,
};

// Dedup concurrent callers (e.g. WorkspaceProvider prefetch racing the first
// dropdown open). Module-level, not in the snapshot — it's control state, not
// render state.
let fetchPromise: Promise<WorkspaceMemberRow[]> | null = null;

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: Partial<Snapshot>) {
  snapshot = {
    ...snapshot,
    ...next,
    version: snapshot.version + 1,
  };
  emitChange();
}

function isFresh(workspaceId: string): boolean {
  return (
    snapshot.members.length > 0 &&
    snapshot.lastWorkspaceId === workspaceId &&
    snapshot.lastFetchedAt != null &&
    Date.now() - snapshot.lastFetchedAt < TTL_MS
  );
}

async function doFetch(workspaceId: string): Promise<WorkspaceMemberRow[]> {
  setSnapshot({ isLoading: true, error: null });
  try {
    // Copied verbatim from the old AssignDropdown.fetchMembers — same
    // endpoint, same response parsing, so the consumed shape is identical.
    const res = await authFetch("/api/workspace/members");
    if (!res?.ok) {
      // Keep stale data (stale-while-error); just record the failure.
      setSnapshot({ isLoading: false, error: "Failed to load members" });
      return snapshot.members;
    }
    const body = (await res.json()) as {
      data?: { members?: WorkspaceMemberRow[] };
    };
    const list = body.data?.members ?? [];
    setSnapshot({
      members: list,
      isLoading: false,
      error: null,
      lastFetchedAt: Date.now(),
      lastWorkspaceId: workspaceId,
    });
    return list;
  } catch {
    // Stale-while-error: don't blow away whatever we already had.
    setSnapshot({ isLoading: false, error: "Failed to load members" });
    return snapshot.members;
  }
}

/**
 * Returns the member list for `workspaceId`, fetching only when necessary.
 *
 * - Fresh cache (non-empty, same workspace, within TTL) → returns immediately,
 *   no network.
 * - A fetch already in flight → awaits and returns it (dedup).
 * - Otherwise → fetches, stores, returns.
 *
 * Safe to call fire-and-forget (prefetch) or awaited.
 */
export function fetchMembers(
  workspaceId: string
): Promise<WorkspaceMemberRow[]> {
  if (!workspaceId) return Promise.resolve(snapshot.members);

  if (isFresh(workspaceId)) {
    return Promise.resolve(snapshot.members);
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = doFetch(workspaceId).finally(() => {
    fetchPromise = null;
  });
  return fetchPromise;
}

/**
 * Mark the cache stale so the next fetchMembers() re-hits the network.
 * Does NOT clear `members` — stale data keeps showing while the refresh runs.
 */
export function invalidateMembers(): void {
  setSnapshot({ lastFetchedAt: null });
}

export function getMembersSnapshot(): Snapshot {
  return snapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** React binding — re-renders on any member-cache change. */
export function useWorkspaceMembers(): Snapshot {
  return useSyncExternalStore(
    subscribe,
    getMembersSnapshot,
    getMembersSnapshot
  );
}
