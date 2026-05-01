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
  getUidHint,
  setUidHint,
  clearUidHint,
} from "@/lib/client/workspaceBootstrap";
import type { Workspace } from "@/lib/domain/workspace";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

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
  switchWorkspace: (workspaceId: string) => Promise<void>;
  /** True while allWorkspaces is loading. */
  isLoadingWorkspaces: boolean;
  /** User's uploaded avatar URL (updated immediately after upload without page reload). */
  avatarUrl: string | null;
  /** Update the local avatar URL in context (call after upload/remove in Settings). */
  updateAvatarUrl: (url: string | null) => void;
  /** True while Firestore workspace doc hasn't fired yet (initial load or workspace switch). */
  workspaceDocLoading: boolean;
  /** Workspace name from local hint (available before Firestore fires). */
  hintWorkspaceName: string | null;
  /** Workspace logo URL from local hint (available before Firestore fires). */
  hintWorkspaceLogoUrl: string | null;
  /** Total member count for the active workspace. */
  memberCount: number;
  /** Manually re-run identity sync after a failure. Resets retry count and clears error. */
  retryIdentitySync: () => void;
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
  const membershipsLastFetchedRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const authUidRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

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
  const [workspaceDocLoading, setWorkspaceDocLoading] = useState(true);
  const [hintWorkspaceName, setHintWorkspaceName] = useState<string | null>(null);
  const [hintWorkspaceLogoUrl, setHintWorkspaceLogoUrl] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);

  useEffect(() => {
    const hint = getUidHint();
    if (hint) {
      setAuthUid(hint);
    }
  }, []);

  useEffect(() => {
    authUidRef.current = authUid;
  }, [authUid]);

  const commitWorkspaceId = useCallback((next: string | null) => {
    if (workspaceIdRef.current === next) return;
    workspaceIdRef.current = next;
    setWorkspaceId(next);
    if (next) {
      setWorkspaceHint({ workspaceId: next, workspaceName: null, workspaceLogoUrl: null });
    } else {
      clearWorkspaceHint();
    }
  }, []);

  const runIdentitySync = useCallback(async (uid: string, forceRetry = false) => {
    if (syncLockUidRef.current === uid && !forceRetry) return;
    syncLockUidRef.current = uid;
    authSyncGenerationRef.current += 1;
    const currentGen = authSyncGenerationRef.current;

    if (!mountedRef.current) return;
    setWorkspaceError(null);
    setWorkspaceLoading(true);
    setClaimsReady(false);

    const hint = getWorkspaceHint();
    if (hint) {
      commitWorkspaceId(hint.workspaceId);
      setHintWorkspaceName(hint.workspaceName);
      setHintWorkspaceLogoUrl(hint.workspaceLogoUrl);
    }

    try {
      if (!mountedRef.current) return;
      if (currentGen !== authSyncGenerationRef.current) return;

      let res: Response | null = null;
      try {
        res = await withTimeout(
          authFetch("/api/users", { method: "POST" }),
          8000,
          "POST /api/users"
        );
      } catch (err) {
        console.warn("[WorkspaceContext] Claim sync failed/timed out:", err);
      }

      if (!mountedRef.current) return;
      if (currentGen !== authSyncGenerationRef.current) return;

      if (res != null && res.ok) {
        try {
          const body = await res.json() as { success?: boolean; data?: { avatarUrl?: string | null } };
          if (body?.data?.avatarUrl) {
            setAvatarUrl(body.data.avatarUrl);
          }
        } catch { /* non-fatal */ }
      }

      if (!mountedRef.current) return;
      if (currentGen !== authSyncGenerationRef.current) return;

      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await withTimeout(currentUser.getIdToken(false), 5000, "getIdToken");
        } catch (err) {
          console.warn("[WorkspaceContext] Token refresh failed/timed out:", err);
        }
      }

      if (!mountedRef.current) return;
      if (currentGen !== authSyncGenerationRef.current) return;

      const resolved = await withTimeout(
        getUserWorkspaceIdRepo(uid),
        5000,
        "getUserWorkspaceIdRepo"
      );
      const normalized = normalizeWorkspaceId(resolved);

      if (!mountedRef.current) return;
      if (currentGen !== authSyncGenerationRef.current) return;

      if (!normalized) {
        commitWorkspaceId(null);
        setWorkspaceError(MISSING_USER_WORKSPACE_ERROR);
        setClaimsReady(false);
        setWorkspaceLoading(false);
        if (syncLockUidRef.current === uid) {
          syncLockUidRef.current = null;
        }
        return;
      }

      commitWorkspaceId(normalized);
      setWorkspaceError(null);
      setClaimsReady(true);
      retryCountRef.current = 0;
      setWorkspaceLoading(false);
      if (syncLockUidRef.current === uid) {
        syncLockUidRef.current = null;
      }
    } catch (err) {
      console.error("IDENTITY SYNC FAILED", err);

      // Always clear the lock on failure so retries are possible.
      if (syncLockUidRef.current === uid) {
        syncLockUidRef.current = null;
      }

      if (!mountedRef.current) return;
      if (currentGen !== authSyncGenerationRef.current) return;

      const message = err instanceof Error ? err.message : String(err);
      setWorkspaceError(message);

      const isTimeout = err instanceof Error && err.message.includes("timed out");
      const isMissing = message.includes("MISSING_USER_WORKSPACE");

      if (isMissing) {
        commitWorkspaceId(null);
        setClaimsReady(false);
        setWorkspaceLoading(false);
      } else if (isTimeout && retryCountRef.current < 2) {
        retryCountRef.current += 1;
        const genAtSchedule = authSyncGenerationRef.current;
        console.warn(
          `[WorkspaceContext] Auto-retrying identity sync (attempt ${retryCountRef.current})`
        );
        setTimeout(() => {
          if (!mountedRef.current) return;
          // Bail if a newer sync started in the meantime.
          if (authSyncGenerationRef.current !== genAtSchedule) return;
          if (authUidRef.current !== uid) return;
          void runIdentitySync(uid, true);
        }, 1500);
        // Stay in loading state — don't flip claimsReady here.
      } else {
        commitWorkspaceId(null);
        setClaimsReady(false);
        setWorkspaceLoading(false);
      }
    }
  }, [commitWorkspaceId]);

  const retryIdentitySync = useCallback(() => {
    const uid = authUidRef.current;
    if (!uid) return;
    retryCountRef.current = 0;
    setWorkspaceError(null);
    void runIdentitySync(uid, true);
  }, [runIdentitySync]);

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);

      if (!user?.uid) {
        syncLockUidRef.current = null;
        authSyncGenerationRef.current += 1;
        retryCountRef.current = 0;
        clearAuthTokenCache();
        clearWorkspaceSubscription();
        clearWorkspaceHint();
        clearUidHint();
        if (mountedRef.current) {
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
      setUidHint(uid);
      setAuthEmail(user.email ?? null);
      setAuthDisplayName(user.displayName ?? null);
      setAuthPhotoUrl(user.photoURL ?? null);

      void runIdentitySync(uid);
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [runIdentitySync]);

  // Sync localStorage to server state — workspaceId from Firestore IS the active workspace after Prompt 1
  useEffect(() => {
    if (!authUid || !workspaceId) {
      setActiveWorkspaceId(null);
      return;
    }
    localStorage.setItem(`echly_active_workspace_${authUid}`, workspaceId);
    setActiveWorkspaceId(workspaceId);
  }, [authUid, workspaceId]);

  // Fetch all workspace memberships when identity is ready
  useEffect(() => {
    if (!claimsReady || !authUid) {
      setAllWorkspaces([]);
      return;
    }
    const MEMBERSHIPS_TTL_MS = 5 * 60 * 1000;
    const lastFetched = membershipsLastFetchedRef.current;
    if (lastFetched && Date.now() - lastFetched < MEMBERSHIPS_TTL_MS) {
      return;
    }
    membershipsLastFetchedRef.current = Date.now();
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

  // Fetch member count once when active workspace changes
  useEffect(() => {
    if (!activeWorkspaceId) return;
    fetch("/api/workspace/members/all")
      .then((res) => res.json())
      .then((data: { totalMembers?: number }) => setMemberCount(data.totalMembers || 0))
      .catch(() => setMemberCount(0));
  }, [activeWorkspaceId]);

  // Subscribe to the workspace document for live name/logo/owner data
  useEffect(() => {
    setWorkspaceDocLoading(true);
    setHintWorkspaceName(null);
    setHintWorkspaceLogoUrl(null);
    const targetId = activeWorkspaceId ?? workspaceId;
    if (!claimsReady || !targetId) {
      setWorkspaceDoc(null);
      setWorkspaceDocLoading(false);
      return;
    }
    let firstCall = true;
    const unsub = listenToWorkspace(
      targetId,
      (doc) => {
        setWorkspaceDoc(doc);
        if (firstCall) {
          firstCall = false;
          setWorkspaceDocLoading(false);
        }
      },
      claimsReady
    );
    return () => unsub();
  }, [claimsReady, workspaceId, activeWorkspaceId]);

  useEffect(() => {
    if (!workspaceId || !workspaceDoc) return;
    setWorkspaceHint({
      workspaceId,
      workspaceName: workspaceDoc.name ?? null,
      workspaceLogoUrl: workspaceDoc.logoUrl ?? null,
    });
  }, [workspaceId, workspaceDoc]);

  const switchWorkspace = useCallback(async (wid: string) => {
    if (!authUid) return;

    try {
      // 1. Update the server-side active workspace
      const res = await authFetch("/api/users/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: wid }),
      });

      if (!res?.ok) {
        console.error("[switchWorkspace] Server update failed");
        return;
      }

      // 2. Update localStorage preference
      localStorage.setItem(`echly_active_workspace_${authUid}`, wid);

      // 3. Clear memberships TTL so new workspace appears immediately after switch
      membershipsLastFetchedRef.current = null;

      // Clear workspace-unaware session cache entries for this user
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(`echly_sessions:${authUid}`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));

      // Clear activity feed caches
      const activityKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith("echly_activity:")) {
          activityKeysToRemove.push(key);
        }
      }
      activityKeysToRemove.forEach((k) => sessionStorage.removeItem(k));

      // 4. Force Firebase token refresh to pick up new workspaceId claim
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }

      // 5. Reload to re-bootstrap with new workspace
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("[switchWorkspace] Error:", err);
    }
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
    if (process.env.NODE_ENV === "development") {
      console.log("IDENTITY READY:", isIdentityReady);
    }
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
      workspaceDocLoading,
      hintWorkspaceName,
      hintWorkspaceLogoUrl,
      memberCount,
      retryIdentitySync,
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
      workspaceDocLoading,
      hintWorkspaceName,
      hintWorkspaceLogoUrl,
      memberCount,
      retryIdentitySync,
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
