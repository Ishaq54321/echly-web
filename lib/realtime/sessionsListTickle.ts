"use client";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type FirestoreError,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface Entry {
  unsubscribe: (() => void) | null;
  retainCount: number;
  workspaceId: string;
  initialFired: boolean;
  callbacks: Set<() => void>;
  pendingFollowupTimer: ReturnType<typeof setTimeout> | null;
  /** Unconditional fire ~1.5s after a successful attach (Fix #1). */
  attachFollowupTimer: ReturnType<typeof setTimeout> | null;
  /** One-shot re-attach scheduled after a permission-denied (Fix #2). */
  reattachTimer: ReturnType<typeof setTimeout> | null;
  /** True once we've already burned our single re-attach attempt. */
  reattachAttempted: boolean;
}

const entries = new Map<string, Entry>();

/** If a pending-writes (own-write) snapshot fires but no server-confirmed
 *  snapshot follows soon, refetch anyway — covers the case where the tab is
 *  suspended before Firestore confirms the write. Kept well under the store's
 *  5s in-memory TTL so it never causes a double-fetch. */
const PENDING_WRITES_FOLLOWUP_MS = 1_500;

/** Unconditional fire after a successful attach (Fix #1, see attach()). */
const ATTACH_FOLLOWUP_MS = 1_500;

/** Delay before the single permission-denied re-attach attempt (Fix #2). */
const REATTACH_DELAY_MS = 2_000;

/** Cap on the forced token refresh before the re-attach so a hung refresh
 *  doesn't strand the retry. */
const TOKEN_REFRESH_TIMEOUT_MS = 3_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

/*
 * We use Firestore as a change bell only, with REST as source-of-truth to
 * preserve server-side access filtering. The 1.5s follow-up fire handles the
 * race where a session is created between sign-in and listener attach,
 * otherwise lost in the swallowed initial snapshot. The error handler
 * force-refreshes the token and re-attaches once on permission-denied because
 * the underlying race is a stale token at attach time, which Firestore
 * listeners cannot recover from on their own.
 */

/**
 * (Re)attach the Firestore listener for `entry`. Idempotent w.r.t. the entry:
 * it always installs a fresh `onSnapshot` and resets the per-attach state so a
 * Fix #2 retry can reuse this without duplicating the listener wiring. Each
 * successful attach schedules its own one-shot follow-up fire (Fix #1).
 */
function attach(entry: Entry): void {
  const wid = entry.workspaceId;
  const q = query(
    collection(db, "sessions"),
    where("workspaceId", "==", wid),
    orderBy("updatedAt", "desc"),
    limit(200)
  );

  entry.initialFired = false;

  entry.unsubscribe = onSnapshot(
    q,
    (snap) => {
      const e = entries.get(wid);
      if (!e) return;
      if (!e.initialFired) {
        e.initialFired = true;
        return;
      }
      if (snap.metadata.hasPendingWrites) {
        // Own-write snapshot. Optimistic UI already reflects it, so we
        // don't refetch immediately — but schedule a follow-up in case
        // the server-confirmed snapshot never arrives (tab suspended /
        // navigated away before confirmation).
        if (!e.pendingFollowupTimer) {
          e.pendingFollowupTimer = setTimeout(() => {
            const cur = entries.get(wid);
            if (!cur) return;
            cur.pendingFollowupTimer = null;
            cur.callbacks.forEach((cb) => cb());
          }, PENDING_WRITES_FOLLOWUP_MS);
        }
        return;
      }
      // Server-confirmed snapshot: cancel any pending follow-up so we
      // don't double-fire, then notify now.
      if (e.pendingFollowupTimer) {
        clearTimeout(e.pendingFollowupTimer);
        e.pendingFollowupTimer = null;
      }
      e.callbacks.forEach((cb) => cb());
    },
    (err: FirestoreError) => {
      const e = entries.get(wid);
      const uid = auth.currentUser?.uid ?? "(none)";

      // Benign teardown race: release() ran (or is running) and a final
      // permission-denied snapshot beat it. The entry is gone or its
      // listener was already cleared — nothing to recover.
      if (!e || !e.unsubscribe) {
        console.warn(
          `[sessionsListTickle] listener error during teardown ` +
            `(workspace=${wid}, user=${uid}, code=${err.code}): ${err.message}`
        );
        return;
      }

      console.error(
        `[sessionsListTickle] listener error ` +
          `(workspace=${wid}, user=${uid}, code=${err.code}): ${err.message}`
      );

      if (err.code !== "permission-denied") {
        // Network / transient Firestore errors: Firestore's built-in retry
        // reconnects the listener on its own. Don't add custom retry here.
        return;
      }

      // Permission-denied during normal operation: the token was almost
      // certainly stale at attach time (claimsReady can flip true on a 5s
      // best-effort timeout without the workspaceIds claim actually
      // landing). The listener is dead and will not auto-retry — clear it
      // and schedule exactly one refresh-and-reattach.
      e.unsubscribe = null;
      e.initialFired = false;
      if (e.attachFollowupTimer) {
        clearTimeout(e.attachFollowupTimer);
        e.attachFollowupTimer = null;
      }
      if (e.pendingFollowupTimer) {
        clearTimeout(e.pendingFollowupTimer);
        e.pendingFollowupTimer = null;
      }

      if (e.reattachAttempted) {
        // Already spent our one retry — leave it detached. One
        // refresh-and-retry is enough; don't loop.
        return;
      }
      e.reattachAttempted = true;

      e.reattachTimer = setTimeout(() => {
        const cur = entries.get(wid);
        if (!cur) return;
        cur.reattachTimer = null;
        // Force a fresh token before re-attaching — retrying the attach
        // with the same stale token would fail identically.
        const refresh = auth.currentUser
          ? withTimeout(
              auth.currentUser.getIdToken(true),
              TOKEN_REFRESH_TIMEOUT_MS
            ).then(
              () => {},
              () => {}
            )
          : Promise.resolve();
        refresh.then(() => {
          const c = entries.get(wid);
          // Only re-attach if the entry still exists and a concurrent
          // retain() didn't already re-establish the listener.
          if (!c || c.unsubscribe) return;
          attach(c);
        });
      }, REATTACH_DELAY_MS);
    }
  );

  // Fix #1: unconditional one-shot fire after this attach succeeds. The
  // initial snapshot is intentionally swallowed above, so a session created
  // between sign-in and attach would otherwise never be seen. This is
  // separate from PENDING_WRITES_FOLLOWUP_MS (own-writes only) and is
  // cancelled by teardown / re-attach so it never fires for a dead listener.
  if (entry.attachFollowupTimer) {
    clearTimeout(entry.attachFollowupTimer);
  }
  entry.attachFollowupTimer = setTimeout(() => {
    const cur = entries.get(wid);
    if (!cur) return;
    cur.attachFollowupTimer = null;
    cur.callbacks.forEach((cb) => cb());
  }, ATTACH_FOLLOWUP_MS);
}

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
      pendingFollowupTimer: null,
      attachFollowupTimer: null,
      reattachTimer: null,
      reattachAttempted: false,
    };
    entries.set(wid, entry);
  }
  entry.retainCount += 1;
  entry.callbacks.add(onChange);

  if (!entry.unsubscribe) {
    attach(entry);
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
      e.unsubscribe = null;
      if (e.pendingFollowupTimer) {
        clearTimeout(e.pendingFollowupTimer);
        e.pendingFollowupTimer = null;
      }
      if (e.attachFollowupTimer) {
        clearTimeout(e.attachFollowupTimer);
        e.attachFollowupTimer = null;
      }
      if (e.reattachTimer) {
        clearTimeout(e.reattachTimer);
        e.reattachTimer = null;
      }
      entries.delete(wid);
    }
  };
}
