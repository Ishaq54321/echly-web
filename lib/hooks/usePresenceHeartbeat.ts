/**
 * DEPLOY ORDER: firestore.rules MUST be deployed before or with this code.
 * If client ships first, heartbeat writes will be PERMISSION_DENIED and
 * silently swallowed — no errors, no presence.
 *
 * Deploy: firebase deploy --only firestore:rules
 */
"use client";

import { useEffect, useRef } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logger } from "@/lib/logger";

const HEARTBEAT_MS = 60_000;

interface PresenceUser {
  uid: string;
  displayName: string;
  photoURL: string | null;
}

interface Args {
  sessionId: string | null | undefined;
  enabled: boolean;
  user: PresenceUser | null;
}

/**
 * Writes a heartbeat to sessions/{sessionId}/presence/{uid} every 30s while:
 *   - args.enabled && args.sessionId && args.user are all set
 *   - the tab is visible (Page Visibility API)
 *
 * Pauses on visibilitychange→hidden, resumes on →visible. On unmount or any
 * arg change that disables the hook, the interval is cleared and no "leaving"
 * doc is written — the 60s staleness window in presenceStore handles eviction.
 */
export function usePresenceHeartbeat({ sessionId, enabled, user }: Args): void {
  // Stash the latest user payload in a ref so the visibilitychange handler
  // always reads the current displayName/photoURL without re-binding.
  const userRef = useRef<PresenceUser | null>(user);
  userRef.current = user;

  useEffect(() => {
    const sid = typeof sessionId === "string" ? sessionId.trim() : "";
    if (!enabled || !sid || !user) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const writeOnce = () => {
      const u = userRef.current;
      if (!u) return;
      void setDoc(
        doc(db, "sessions", sid, "presence", u.uid),
        {
          userId: u.uid,
          displayName: u.displayName,
          photoURL: u.photoURL ?? null,
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      ).catch((err) => {
        logger.debug("presence", `heartbeat write failed for ${sid}`, {
          errorMessage: err instanceof Error ? err.message : String(err),
        });
      });
    };

    const start = () => {
      if (interval) return;
      writeOnce();
      interval = setInterval(writeOnce, HEARTBEAT_MS);
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const onVisibility = () => {
      if (typeof document === "undefined") return;
      if (document.hidden) stop();
      else start();
    };

    if (typeof document !== "undefined" && document.hidden) {
      // Tab is hidden on mount (e.g. backgrounded restore) — wait for visibility.
    } else {
      start();
    }

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      stop();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
  }, [sessionId, enabled, user?.uid]);
}
