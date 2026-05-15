"use client";

import { useSyncExternalStore } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import type { NotificationRow } from "@/lib/domain/notification";

type NotificationStoreSnapshot = {
  notifications: NotificationRow[];
  unreadCount: number;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
  version: number;
};

const initialSnapshot: NotificationStoreSnapshot = {
  notifications: [],
  unreadCount: 0,
  isLoaded: false,
  isLoading: false,
  error: null,
  hasMore: false,
  nextCursor: null,
  version: 0,
};

let snapshot: NotificationStoreSnapshot = initialSnapshot;
const listeners = new Set<() => void>();

let unreadUnsubscribe: (() => void) | null = null;
let authUnsubscribe: (() => void) | null = null;
let currentUserId: string | null = null;
let currentWorkspaceId: string | null = null;
let retainCount = 0;
let inFlightFetchKey: string | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: Partial<NotificationStoreSnapshot>) {
  snapshot = {
    ...snapshot,
    ...next,
    version: snapshot.version + 1,
  };
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): NotificationStoreSnapshot {
  return snapshot;
}

function tearDownUnreadListener() {
  if (unreadUnsubscribe) {
    unreadUnsubscribe();
    unreadUnsubscribe = null;
  }
  currentUserId = null;
  currentWorkspaceId = null;
}

/**
 * Real-time unread badge: Firestore onSnapshot of unread notifications for the current
 * user *in their active workspace*. Only the count is consumed here — full notification
 * data is fetched via REST when the panel opens.
 */
function startUnreadListener(userId: string, workspaceId: string | null) {
  if (
    currentUserId === userId &&
    currentWorkspaceId === workspaceId &&
    unreadUnsubscribe
  ) {
    return;
  }

  if (unreadUnsubscribe) {
    unreadUnsubscribe();
    unreadUnsubscribe = null;
  }

  currentUserId = userId;
  currentWorkspaceId = workspaceId;

  if (!workspaceId) {
    // No active workspace — nothing to show, but track userId so a later
    // setActiveWorkspaceForNotifications() call re-attaches the listener.
    setSnapshot({ unreadCount: 0 });
    return;
  }

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("workspaceId", "==", workspaceId),
    where("read", "==", false)
  );

  unreadUnsubscribe = onSnapshot(
    q,
    (snap) => {
      if (currentUserId !== userId || currentWorkspaceId !== workspaceId) return;
      setSnapshot({ unreadCount: snap.size });
    },
    (err) => {
      if (currentUserId !== userId || currentWorkspaceId !== workspaceId) return;
      setSnapshot({
        error: err instanceof Error ? err.message : String(err),
      });
    }
  );
}

/** Called by the workspace context whenever the active workspace changes. */
export function setActiveWorkspaceForNotifications(
  workspaceId: string | null
): void {
  const user = auth.currentUser;
  if (!user) return;
  if (retainCount === 0) {
    // No listener requested yet — just remember the value for when retain happens.
    currentWorkspaceId = workspaceId;
    return;
  }
  startUnreadListener(user.uid, workspaceId);
}

function ensureAuthListener() {
  if (authUnsubscribe) return;
  authUnsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      clearNotificationStore();
      return;
    }
    if (retainCount === 0) return;
    startUnreadListener(user.uid, currentWorkspaceId);
  });
}

/**
 * Increment retain count and ensure the unread listener is active for the current user.
 * Returns a release function — listener is torn down only when retain count returns to zero.
 */
export function retainNotificationListener(): () => void {
  retainCount += 1;
  ensureAuthListener();
  const user = auth.currentUser;
  if (user) {
    startUnreadListener(user.uid, currentWorkspaceId);
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    retainCount = Math.max(0, retainCount - 1);
    if (retainCount === 0) {
      tearDownUnreadListener();
      if (authUnsubscribe) {
        authUnsubscribe();
        authUnsubscribe = null;
      }
    }
  };
}

/** Auth sign-out: drop retain count, tear down listeners, and clear all state. */
export function clearNotificationStore(): void {
  retainCount = 0;
  tearDownUnreadListener();
  if (authUnsubscribe) {
    authUnsubscribe();
    authUnsubscribe = null;
  }
  inFlightFetchKey = null;
  snapshot = { ...initialSnapshot, version: snapshot.version + 1 };
  emitChange();
}

export interface FetchNotificationsOptions {
  cursor?: string | null;
  append?: boolean;
}

/**
 * Fetch a page of notifications via REST. Replaces the list (default) or appends (for "Load more").
 */
export async function fetchNotifications(
  options?: FetchNotificationsOptions
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const cursor = options?.cursor ?? null;
  const append = options?.append === true;

  // Dedupe in-flight requests for the same cursor.
  const fetchKey = `${cursor ?? ""}:${append ? "append" : "replace"}`;
  if (inFlightFetchKey === fetchKey) return;
  inFlightFetchKey = fetchKey;

  setSnapshot({ isLoading: true, error: null });

  try {
    const params = new URLSearchParams();
    params.set("limit", "20");
    if (cursor) params.set("cursor", cursor);
    const res = await fetch(`/api/notifications?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });
    const json = (await res.json()) as {
      success?: boolean;
      data?: {
        notifications?: NotificationRow[];
        nextCursor?: string | null;
        unreadCount?: number;
      };
      error?: { message?: string };
    };

    if (!res.ok || json.success === false) {
      const message = json.error?.message || `HTTP ${res.status}`;
      setSnapshot({ isLoading: false, error: message });
      return;
    }

    const data = json.data ?? {};
    const incoming = Array.isArray(data.notifications) ? data.notifications : [];
    const nextCursor = typeof data.nextCursor === "string" ? data.nextCursor : null;
    const unreadCount =
      typeof data.unreadCount === "number" ? data.unreadCount : snapshot.unreadCount;

    let merged: NotificationRow[];
    if (append) {
      const seen = new Set(snapshot.notifications.map((n) => n.id));
      const fresh = incoming.filter((n) => !seen.has(n.id));
      merged = [...snapshot.notifications, ...fresh];
    } else {
      merged = incoming;
    }

    setSnapshot({
      notifications: merged,
      unreadCount,
      hasMore: nextCursor != null,
      nextCursor,
      isLoaded: true,
      isLoading: false,
      error: null,
    });
  } catch (err) {
    setSnapshot({
      isLoading: false,
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    if (inFlightFetchKey === fetchKey) {
      inFlightFetchKey = null;
    }
  }
}

export async function markRead(notificationId: string): Promise<void> {
  const id = notificationId?.trim();
  if (!id) return;
  const user = auth.currentUser;
  if (!user) return;

  const prevNotifications = snapshot.notifications;
  const prevUnreadCount = snapshot.unreadCount;
  const target = prevNotifications.find((n) => n.id === id);
  if (target?.read) return;

  // Optimistic local update.
  setSnapshot({
    notifications: prevNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: target ? Math.max(0, prevUnreadCount - 1) : prevUnreadCount,
  });

  try {
    const res = await fetch(`/api/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("[notifications] markRead failed", err);
    setSnapshot({
      notifications: prevNotifications,
      unreadCount: prevUnreadCount,
      error: "Failed to mark notification as read",
    });
  }
}

export function updateNotificationActionStatus(
  notificationId: string,
  actionStatus: "pending" | "approved" | "rejected"
): void {
  const id = notificationId?.trim();
  if (!id) return;
  const prev = snapshot.notifications;
  if (!prev.some((n) => n.id === id)) return;
  setSnapshot({
    notifications: prev.map((n) => (n.id === id ? { ...n, actionStatus } : n)),
  });
}

export async function markAllRead(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const prevNotifications = snapshot.notifications;
  const prevUnreadCount = snapshot.unreadCount;

  // Optimistic local update.
  setSnapshot({
    notifications: prevNotifications.map((n) => (n.read ? n : { ...n, read: true })),
    unreadCount: 0,
  });

  try {
    const res = await fetch(`/api/notifications/read-all`, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("[notifications] markAllRead failed", err);
    setSnapshot({
      notifications: prevNotifications,
      unreadCount: prevUnreadCount,
      error: "Failed to mark all as read",
    });
  }
}

export function useNotificationStore(): NotificationStoreSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
