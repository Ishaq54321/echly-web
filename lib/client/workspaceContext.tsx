"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authFetch, clearAuthTokenCache } from "@/lib/authFetch";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { clearWorkspaceSubscription } from "@/lib/realtime/workspaceStore";
import {
  clearWorkspaceHint,
  getWorkspaceHint,
  setWorkspaceHint,
} from "@/lib/client/workspaceBootstrap";

export type WorkspaceContextValue = {
  workspaceId: string | null;
  /** Set when workspace resolution failed for a signed-in user (system error; do not continue as if unauthenticated). */
  workspaceError: string | null;
  /** True while a signed-in user is being resolved and workspaceId is not yet known. */
  workspaceLoading: boolean;
  /**
   * True only after POST /api/users succeeds and `getIdToken(true)` has run — custom claims are usable for Firestore rules.
   */
  claimsReady: boolean;
  /** `authUid && claimsReady` — gate all Firestore subscriptions and workspace-scoped fetches. */
  isIdentityReady: boolean;
  /** True after the first Firebase auth callback for this mount (signed-in or signed-out). */
  authReady: boolean;
  /**
   * True when auth, custom claims, and workspace id are all ready — gate data subscriptions and mutations.
   * Do not use for shell render (see `useRenderReadiness` / NBIB).
   */
  isIdentityResolved: boolean;
  /** Firebase Auth uid when signed in; null when signed out. */
  authUid: string | null;
  authEmail: string | null;
  authDisplayName: string | null;
  authPhotoUrl: string | null;
};

/** Throws if identity is not ready; use before destructive or workspace-scoped API calls. */
export function assertIdentityResolved(resolved: boolean): asserts resolved is true {
  if (!resolved) {
    throw new Error("Identity not ready");
  }
}

function normalizeWorkspaceId(value: string | null | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/**
 * Single workspace identity + claims gate for the signed-in app shell.
 * Must wrap any tree that calls useWorkspace() so listeners see one consistent claimsReady.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const authSyncGenerationRef = useRef(0);
  const syncLockUidRef = useRef<string | null>(null);
  const workspaceIdRef = useRef<string | null>(null);

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [claimsReady, setClaimsReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authDisplayName, setAuthDisplayName] = useState<string | null>(null);
  const [authPhotoUrl, setAuthPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const commitWorkspaceId = (next: string | null) => {
      if (workspaceIdRef.current === next) return;
      workspaceIdRef.current = next;
      setWorkspaceId(next);
      setWorkspaceHint(next);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);

      if (!user?.uid) {
        syncLockUidRef.current = null;
        authSyncGenerationRef.current += 1;
        clearAuthTokenCache();
        clearWorkspaceSubscription();
        clearWorkspaceHint();
        if (!cancelled) {
          workspaceIdRef.current = null;
          setAuthUid(null);
          setAuthEmail(null);
          setAuthDisplayName(null);
          setAuthPhotoUrl(null);
          setWorkspaceId(null);
          setWorkspaceError(null);
          setWorkspaceLoading(false);
          setClaimsReady(false);
        }
        return;
      }

      const uid = user.uid;
      setAuthUid(uid);
      setAuthEmail(user.email ?? null);
      setAuthDisplayName(user.displayName ?? null);
      setAuthPhotoUrl(user.photoURL ?? null);

      if (syncLockUidRef.current === uid) {
        return;
      }
      syncLockUidRef.current = uid;
      authSyncGenerationRef.current += 1;
      const currentGen = authSyncGenerationRef.current;

      if (cancelled) return;
      setWorkspaceError(null);
      setWorkspaceLoading(true);

      setClaimsReady(false);
      const cachedWorkspaceId = getWorkspaceHint();
      if (cachedWorkspaceId) {
        commitWorkspaceId(cachedWorkspaceId);
      }

      void (async () => {
        try {
          if (cancelled) return;
          if (currentGen !== authSyncGenerationRef.current) return;

          const res = await authFetch("/api/users", { method: "POST" });

          if (cancelled) return;
          if (currentGen !== authSyncGenerationRef.current) return;

          if (res == null || !res.ok) {
            setClaimsReady(false);
            commitWorkspaceId(null);
            setWorkspaceError(
              res == null
                ? "Identity sync failed (no session)"
                : `Identity sync failed (${res.status})`
            );
            return;
          }

          if (cancelled) return;
          if (currentGen !== authSyncGenerationRef.current) return;

          await user.getIdToken(true);

          if (cancelled) return;
          if (currentGen !== authSyncGenerationRef.current) return;

          const resolved = await getUserWorkspaceIdRepo(uid);
          const normalized = normalizeWorkspaceId(resolved);

          if (cancelled) return;
          if (currentGen !== authSyncGenerationRef.current) return;

          if (!normalized) {
            commitWorkspaceId(null);
            setWorkspaceError(MISSING_USER_WORKSPACE_ERROR);
            setClaimsReady(false);
            return;
          }

          commitWorkspaceId(normalized);
          setWorkspaceError(null);
          setClaimsReady(true);
        } catch (err) {
          console.error("IDENTITY SYNC FAILED", err);
          if (cancelled) return;
          if (currentGen !== authSyncGenerationRef.current) return;
          setClaimsReady(false);
          commitWorkspaceId(null);
          setWorkspaceError(
            err instanceof Error ? err.message : String(err)
          );
        } finally {
          if (syncLockUidRef.current === uid) {
            syncLockUidRef.current = null;
          }
          if (cancelled) return;
          if (currentGen !== authSyncGenerationRef.current) return;
          setWorkspaceLoading(false);
        }
      })();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const isIdentityResolved = useMemo(
    () =>
      authReady &&
      claimsReady &&
      Boolean(workspaceId && workspaceId.trim()),
    [authReady, claimsReady, workspaceId]
  );

  const isIdentityReady = useMemo(
    () => Boolean(authUid) && claimsReady,
    [authUid, claimsReady]
  );

  useEffect(() => {
    console.log("IDENTITY READY:", isIdentityReady);
  }, [isIdentityReady]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaceId,
        workspaceError,
        workspaceLoading,
        claimsReady,
        isIdentityReady,
        authReady,
        isIdentityResolved,
        authUid,
        authEmail,
        authDisplayName,
        authPhotoUrl,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
