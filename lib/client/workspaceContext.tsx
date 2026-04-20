"use client";

import {
  createContext,
  useCallback,
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
import { listenToWorkspace } from "@/lib/repositories/workspacesRepository";
import {
  clearWorkspaceHint,
  getWorkspaceHint,
  setWorkspaceHint,
} from "@/lib/client/workspaceBootstrap";
import type { Workspace } from "@/lib/domain/workspace";

export type WorkspaceMembership = {
  workspaceId: string;
  name: string;
  logoUrl: string | null;
  plan: string;
  isOwner: boolean;
};

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
  /** Workspace display name from the workspace document. */
  workspaceName: string | null;
  /** Workspace logo URL from the workspace document. */
  workspaceLogoUrl: string | null;
  /** Workspace owner UID from the workspace document. */
  workspaceOwnerId: string | null;
  /** True when the signed-in user is the workspace owner. */
  isWorkspaceOwner: boolean;
  /** True when the workspace has been soft-deleted. */
  isWorkspaceDeleted: boolean;
  /** All workspaces this user is a member of. */
  allWorkspaces: WorkspaceMembership[];
  /** The currently active workspace ID (from localStorage or user doc). */
  activeWorkspaceId: string | null;
  /** Switch the active workspace and reload. */
  switchWorkspace: (workspaceId: string) => void;
  /** True while allWorkspaces is loading. */
  isLoadingWorkspaces: boolean;
  /** User's uploaded avatar URL (updated immediately after upload without page reload). */
  avatarUrl: string | null;
  /** Update the local avatar URL in context (call after upload/remove in Settings). */
  updateAvatarUrl: (url: string | null) => void;
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
  const [workspaceDoc, setWorkspaceDoc] = useState<Workspace | null>(null);
  const [allWorkspaces, setAllWorkspaces] = useState<WorkspaceMembership[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
          setAllWorkspaces([]);
          setActiveWorkspaceId(null);
          setAvatarUrl(null);
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

          try {
            const body = await res.json() as { success?: boolean; data?: { avatarUrl?: string | null } };
            if (body?.data?.avatarUrl) {
              setAvatarUrl(body.data.avatarUrl);
            }
          } catch { /* non-fatal */ }

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

  // Resolve active workspace from localStorage when uid + workspaceId are known
  useEffect(() => {
    if (!authUid || !workspaceId) {
      setActiveWorkspaceId(null);
      return;
    }
    const stored = typeof window !== "undefined"
      ? localStorage.getItem(`echly_active_workspace_${authUid}`)
      : null;
    setActiveWorkspaceId(stored && stored.trim() ? stored.trim() : workspaceId);
  }, [authUid, workspaceId]);

  // Fetch all workspace memberships when identity is ready
  useEffect(() => {
    if (!claimsReady || !authUid) {
      setAllWorkspaces([]);
      return;
    }
    let cancelled = false;
    setIsLoadingWorkspaces(true);
    authFetch("/api/workspace/memberships")
      .then((res) => {
        if (!res?.ok) return;
        return res.json() as Promise<{ success: boolean; data?: { memberships: WorkspaceMembership[] } }>;
      })
      .then((body) => {
        if (cancelled) return;
        if (body?.success && body.data?.memberships) {
          setAllWorkspaces(body.data.memberships);
        }
      })
      .catch(() => {/* non-fatal */})
      .finally(() => {
        if (!cancelled) setIsLoadingWorkspaces(false);
      });
    return () => { cancelled = true; };
  }, [claimsReady, authUid]);

  // Subscribe to the workspace document for live name/logo/owner data
  useEffect(() => {
    const targetWid = activeWorkspaceId ?? workspaceId;
    if (!targetWid || !claimsReady) {
      setWorkspaceDoc(null);
      return;
    }
    const unsub = listenToWorkspace(targetWid, setWorkspaceDoc, claimsReady);
    return () => unsub();
  }, [activeWorkspaceId, workspaceId, claimsReady]);

  const switchWorkspace = useCallback((wid: string) => {
    if (!authUid) return;
    localStorage.setItem(`echly_active_workspace_${authUid}`, wid);
    window.location.href = "/dashboard";
  }, [authUid]);

  const updateAvatarUrl = useCallback((url: string | null) => {
    setAvatarUrl(url);
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

  // PERF R-004: memoize context value so the ~20+ consumers only re-render when
  // a field they actually use changes, not on every WorkspaceProvider render.
  const contextValue = useMemo(
    () => ({
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
      // Derived from workspace document — zero additional Firestore reads
      workspaceName: workspaceDoc?.name ?? null,
      workspaceLogoUrl: workspaceDoc?.logoUrl ?? null,
      workspaceOwnerId: workspaceDoc?.ownerId ?? null,
      isWorkspaceOwner: !!authUid && !!workspaceDoc?.ownerId && authUid === workspaceDoc.ownerId,
      isWorkspaceDeleted: workspaceDoc?.deletedAt != null,
      allWorkspaces,
      activeWorkspaceId,
      switchWorkspace,
      isLoadingWorkspaces,
      avatarUrl: avatarUrl ?? authPhotoUrl,
      updateAvatarUrl,
    }),
    [
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
      workspaceDoc,
      allWorkspaces,
      activeWorkspaceId,
      switchWorkspace,
      isLoadingWorkspaces,
      avatarUrl,
      updateAvatarUrl,
    ]
  );

  return (
    <WorkspaceContext.Provider value={contextValue}>
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
