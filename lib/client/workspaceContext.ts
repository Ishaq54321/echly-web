"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";

type WorkspaceContextValue = {
  workspaceId: string | null;
  /** Set when workspace resolution failed for a signed-in user (system error; do not continue as if unauthenticated). */
  workspaceError: Error | null;
  /** True while a signed-in user is being resolved and workspaceId is not yet known. */
  workspaceLoading: boolean;
  /** True after ID token has been force-refreshed post workspace sync (custom claims ready for Firestore rules). */
  claimsReady: boolean;
};

let cachedWorkspaceId: string | null = null;
let cacheUid: string | null = null;
let inFlight: Promise<string> | null = null;

async function resolveWorkspaceId(uid: string): Promise<string> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const workspaceId = await getUserWorkspaceIdRepo(uid);
    cacheUid = uid;
    cachedWorkspaceId = workspaceId;
    return workspaceId;
  })();
  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

export function clearWorkspaceContextCache(): void {
  cachedWorkspaceId = null;
  cacheUid = null;
  inFlight = null;
}

function normalizeWorkspaceId(value: string | null | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function useWorkspace(): WorkspaceContextValue {
  const [workspaceId, setWorkspaceId] = useState<string | null>(() =>
    normalizeWorkspaceId(cachedWorkspaceId ?? undefined)
  );
  const [workspaceError, setWorkspaceError] = useState<Error | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(() => {
    const u = auth.currentUser;
    if (!u) return false;
    const cached = normalizeWorkspaceId(cachedWorkspaceId ?? undefined);
    return !cached;
  });
  const [claimsReady, setClaimsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user?.uid) {
        clearWorkspaceContextCache();
        setWorkspaceId(null);
        setWorkspaceError(null);
        setWorkspaceLoading(false);
        setClaimsReady(false);
        return;
      }
      setWorkspaceError(null);
      const hasModuleCacheForUser =
        cacheUid === user.uid &&
        typeof cachedWorkspaceId === "string" &&
        cachedWorkspaceId.trim() !== "";
      if (!hasModuleCacheForUser) {
        setWorkspaceLoading(true);
      }
      void (async () => {
        try {
          const res = await authFetch("/api/users", { method: "POST" });
          if (res?.ok) {
            try {
              await user.getIdToken(true);
              setClaimsReady(true);
            } catch {
              setClaimsReady(false);
            }
          } else {
            setClaimsReady(false);
          }
        } catch {
          // Claim sync is best-effort; resolution still runs for Firestore user doc reads.
          setClaimsReady(false);
        }
        try {
          const resolved = await resolveWorkspaceId(user.uid);
          setWorkspaceId(normalizeWorkspaceId(resolved));
          setWorkspaceError(null);
        } catch (err: unknown) {
          setWorkspaceId(null);
          setWorkspaceError(err instanceof Error ? err : new Error(String(err)));
        } finally {
          setWorkspaceLoading(false);
        }
      })();
    });
    return () => unsubscribe();
  }, []);

  return { workspaceId, workspaceError, workspaceLoading, claimsReady };
}
