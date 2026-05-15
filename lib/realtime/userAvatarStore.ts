"use client";

import { doc, onSnapshot, type DocumentData } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  recordListenerAttach,
  recordListenerDetach,
  recordListenerError,
  recordListenerUpdate,
} from "@/lib/observability/listenerEvents";

/**
 * Phase 25.3 — client-side live avatar resolution.
 *
 * Server endpoints resolve avatars live via `resolveUserAvatars`
 * (lib/utils/resolveUserAvatar.ts). Realtime Firestore listeners bypass
 * those endpoints entirely and only see denormalized snapshot fields
 * (feedback.creatorAvatarUrl, comment.userAvatar, recentViewers[].avatarUrl,
 * presence.photoURL) that go stale the moment a user changes their photo.
 *
 * This singleton store holds one `userProfiles/{uid}` onSnapshot subscription
 * per uid, ref-counted across every component that needs that uid.
 *
 * Phase 25.4: the listener reads `userProfiles/{uid}` — the rules-readable
 * public mirror (displayName + avatarUrl only), written by the Admin SDK in
 * lib/repositories/userProfilesRepository.server.ts. The private `users/{uid}`
 * doc is self-read-only, so a client could never resolve another user's
 * avatar from it (that was the permission-denied spam this fixes). The mirror
 * stores avatarUrl already collapsed via the avatarUrl → photoURL ladder, so
 * client and server still resolve identically.
 */

export interface UserAvatarRecord {
  uid: string;
  avatarUrl: string | null;
  displayName: string | null;
}

type Listener = (record: UserAvatarRecord) => void;

interface Subscription {
  unsubscribeFromFirestore: () => void;
  listeners: Set<Listener>;
  lastValue: UserAvatarRecord | null;
}

const subscriptions = new Map<string, Subscription>();

/**
 * Resolve the avatar from a userProfiles/{uid} mirror doc. The server stores
 * avatarUrl already collapsed (avatarUrl → photoURL), but we keep the photoURL
 * fallback so a doc written by an older server build still resolves. Mirrors
 * `avatarFromUserData` in lib/utils/resolveUserAvatar.ts.
 */
function resolveAvatarFromDoc(data: DocumentData | undefined): string | null {
  if (!data) return null;
  const avatarUrl =
    typeof data.avatarUrl === "string" ? data.avatarUrl.trim() : "";
  if (avatarUrl) return avatarUrl;
  const photoURL =
    typeof data.photoURL === "string" ? data.photoURL.trim() : "";
  return photoURL || null;
}

function ensureSubscription(uid: string): Subscription {
  const existing = subscriptions.get(uid);
  if (existing) return existing;

  const userRef = doc(db, "userProfiles", uid);

  const sub: Subscription = {
    listeners: new Set(),
    lastValue: null,
    unsubscribeFromFirestore: () => {},
  };

  sub.unsubscribeFromFirestore = onSnapshot(
    userRef,
    (snap) => {
      const data = snap.exists() ? snap.data() : undefined;
      const record: UserAvatarRecord = {
        uid,
        avatarUrl: resolveAvatarFromDoc(data),
        displayName:
          typeof data?.displayName === "string" ? data.displayName : null,
      };
      sub.lastValue = record;
      sub.listeners.forEach((l) => l(record));
      recordListenerUpdate("userAvatar", uid, {
        fromCache: snap.metadata.fromCache,
      });
    },
    (err) => {
      const error = err instanceof Error ? err : new Error(String(err));
      recordListenerError("userAvatar", uid, error);
      // On error (e.g. permission-denied) push a null record so consumers
      // fall back to the initials avatar rather than rendering nothing.
      const record: UserAvatarRecord = {
        uid,
        avatarUrl: null,
        displayName: null,
      };
      sub.lastValue = record;
      sub.listeners.forEach((l) => l(record));
    }
  );

  subscriptions.set(uid, sub);
  recordListenerAttach("userAvatar", uid);
  return sub;
}

function teardown(uid: string) {
  const sub = subscriptions.get(uid);
  if (!sub) return;
  sub.unsubscribeFromFirestore();
  subscriptions.delete(uid);
  recordListenerDetach("userAvatar", uid);
}

/**
 * Subscribe to a user's live avatar. Pushes the cached value immediately if
 * one exists, then every subsequent users/{uid} change. Call the returned
 * function on cleanup — the underlying Firestore listener is torn down once
 * the last consumer for that uid unsubscribes.
 */
export function subscribeToUserAvatar(
  uid: string,
  listener: Listener
): () => void {
  const sub = ensureSubscription(uid);
  sub.listeners.add(listener);

  if (sub.lastValue) listener(sub.lastValue);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const cur = subscriptions.get(uid);
    if (!cur) return;
    cur.listeners.delete(listener);
    if (cur.listeners.size === 0) teardown(uid);
  };
}

/** Read the current cached value without subscribing. Null if never seen. */
export function getCachedUserAvatar(uid: string): UserAvatarRecord | null {
  return subscriptions.get(uid)?.lastValue ?? null;
}

// Tear down every subscription on sign-out, mirroring the other realtime
// stores in this directory (commentsStore, presenceStore, etc.). Consumers'
// effects re-run on the next mount and re-subscribe themselves.
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (user) return;
    for (const uid of Array.from(subscriptions.keys())) teardown(uid);
  });
}
