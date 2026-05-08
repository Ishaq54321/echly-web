"use client";

import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Entry {
  unsubscribe: (() => void) | null;
  retainCount: number;
  workspaceId: string;
  initialFired: boolean;
  callbacks: Set<() => void>;
}

const entries = new Map<string, Entry>();

/**
 * Attach a Firestore listener on sessions where workspaceId == wid. Calls onChange()
 * after each change snapshot AFTER the initial one. Used to invalidate REST caches
 * and trigger a refetch — this preserves server-side access filtering.
 * Ref-counted: multiple consumers share one listener. Returns a release fn.
 */
export function retainSessionsListTickle(
  workspaceId: string,
  onChange: () => void
): () => void {
  const wid = workspaceId.trim();
  if (!wid) return () => {};

  let entry = entries.get(wid);
  if (!entry) {
    entry = {
      unsubscribe: null,
      retainCount: 0,
      workspaceId: wid,
      initialFired: false,
      callbacks: new Set(),
    };
    entries.set(wid, entry);
  }
  entry.retainCount += 1;
  entry.callbacks.add(onChange);

  if (!entry.unsubscribe) {
    const q = query(
      collection(db, "sessions"),
      where("workspaceId", "==", wid),
      orderBy("updatedAt", "desc"),
      limit(50)
    );
    entry.unsubscribe = onSnapshot(
      q,
      (snap) => {
        const e = entries.get(wid);
        if (!e) return;
        if (!e.initialFired) {
          e.initialFired = true;
          return;
        }
        if (snap.metadata.hasPendingWrites) return;
        e.callbacks.forEach((cb) => cb());
      },
      () => { /* permission-denied during teardown is non-fatal */ }
    );
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const e = entries.get(wid);
    if (!e) return;
    e.callbacks.delete(onChange);
    e.retainCount = Math.max(0, e.retainCount - 1);
    if (e.retainCount === 0) {
      e.unsubscribe?.();
      entries.delete(wid);
    }
  };
}
