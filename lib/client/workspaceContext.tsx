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
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { clearWorkspaceSubscription } from "@/lib/realtime/workspaceStore";
import { listenToWorkspace } from "@/lib/repositories/workspacesRepository";
import {
  clearWorkspaceHint,
  getWorkspaceHint,
  setWorkspaceHint,
  setUidHint,
  clearUidHint,
} from "@/lib/client/workspaceBootstrap";
import type { Workspace } from "@/lib/domain/workspace";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { composeFullName } from "@/lib/utils/nameSplit";
import { setActiveWorkspaceForNotifications } from "@/lib/store/notificationStore";

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
  /** True when POST /api/users succeeded but the user has no workspace yet — they need to complete onboarding. */
  needsOnboarding: boolean;
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
  /** First name from users/{uid}.firstName; "" when unknown. */
  firstName: string;
  /** Last name from users/{uid}.lastName; "" when unknown or mononymic. */
  lastName: string;
  /** Composed `${firstName} ${lastName}`; "" when both unset. */
  displayName: string;
  authPhotoUrl: string | null;
  /** Workspace display name from the workspace document. */
  workspaceName: string | null;
  /** Workspace logo URL from the workspace document. */
  workspaceLogoUrl: string | null;
  /** Whitelabel brand logo URL of the *viewer's own* workspace. Used in settings UI only — display surfaces (TopControlBar, PublicSessionNav) use bundle session-owner branding instead. */
  brandLogoUrl: string | null;
  /** Workspace plan id of viewer's workspace. */
  plan: string;
  /** True when viewer's plan + entitlement allows custom branding. Used in settings UI only. */
  customBrandingEntitled: boolean;
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
  /** Force refetch of allWorkspaces (call after creating/joining a workspace). */
  refreshMemberships: () => void;
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
  const retryCountRef = useRef(0);
  const authUidRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  // UX-1: how many times we've seen the active workspace missing from the
  // memberships list. After the first retry we escalate to switching.
  const missingActiveRetriesRef = useRef(0);
  // UX-1: late-bound ref for switchWorkspace — used in the memberships effect
  // which runs before the switchWorkspace useCallback is declared.
  const switchWorkspaceRef = useRef<((wid: string) => Promise<void>) | null>(null);

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [claimsReady, setClaimsReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
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
  const [membershipsRefreshTick, setMembershipsRefreshTick] = useState(0);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const refreshMemberships = useCallback(() => {
    setMembershipsRefreshTick((n) => n + 1);
  }, []);

  // authUid is set ONLY by onAuthStateChanged after Firebase confirms the user.
  // Stale localStorage uidHint must NOT seed authUid — anon viewers with a stale
  // hint would otherwise pass isIdentityReady gates and attach Firestore listeners
  // that fail with permission-denied. The uidHint remains usable for layout-only
  // decisions (e.g., showAuthShell) by reading getUidHint() directly at the call site.

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
    setNeedsOnboarding(false);
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

      let workspaceIdFromResponse: string | null = null;
      if (res != null && res.ok) {
        try {
          const body = await res.json() as {
            success?: boolean;
            data?: {
              workspaceId?: string;
              avatarUrl?: string | null;
              firstName?: string;
              lastName?: string;
            };
          };
          if (body?.data?.avatarUrl) {
            setAvatarUrl(body.data.avatarUrl);
          }
          if (typeof body?.data?.firstName === "string") {
            setFirstName(body.data.firstName);
          }
          if (typeof body?.data?.lastName === "string") {
            setLastName(body.data.lastName);
          }
          if (typeof body?.data?.workspaceId === "string" && body.data.workspaceId.trim()) {
            workspaceIdFromResponse = body.data.workspaceId.trim();
          }
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[WorkspaceContext] response body parse failed", e);
          }
          /* non-fatal — fallback to client-SDK read */
        }
      }

      if (!mountedRef.current) return;
      if (currentGen !== authSyncGenerationRef.current) return;

      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await withTimeout(currentUser.getIdToken(true), 5000, "getIdToken");
        } catch (err) {
          console.warn("[WorkspaceContext] Token refresh failed/timed out:", err);
        }
      }

      if (!mountedRef.current) return;
      if (currentGen !== authSyncGenerationRef.current) return;

      // If POST /api/users returned OK, trust the response as source of truth.
      // A null workspaceIdFromResponse with a successful POST means the user
      // just signed up and needs onboarding — NOT an error. Only fall back to
      // the client-SDK read when the POST itself failed or timed out.
      let resolved: string | null = null;
      if (workspaceIdFromResponse) {
        resolved = workspaceIdFromResponse;
      } else if (res != null && res.ok) {
        resolved = null;
      } else {
        // POST /api/users failed or timed out. Don't call the client-SDK fallback
        // (getUserWorkspaceIdRepo) — it races the doc write and throws
        // MISSING_USER_WORKSPACE on fresh signups. Set resolved to null and let
        // the !normalized block handle it: sets needsOnboarding for fresh signups,
        // retries for returning users via the retry logic below.
        resolved = null;
      }
      const normalized = normalizeWorkspaceId(resolved);

      if (!mountedRef.current) return;
      if (currentGen !== authSyncGenerationRef.current) return;

      if (!normalized) {
        // User has no workspaceId — either needs onboarding (fresh signup)
        // or genuinely missing (edge case). Set needsOnboarding state and
        // let middleware/gate handle the redirect. Do NOT throw.
        commitWorkspaceId(null);
        setNeedsOnboarding(true);
        setWorkspaceError(null);
        setClaimsReady(false);
        setWorkspaceLoading(false);
        if (syncLockUidRef.current === uid) {
          syncLockUidRef.current = null;
        }
        return;
      }

      commitWorkspaceId(normalized);
      setNeedsOnboarding(false);
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

      if ((isMissing || isTimeout) && retryCountRef.current < 2) {
        retryCountRef.current += 1;
        const genAtSchedule = authSyncGenerationRef.current;
        console.warn(
          `[WorkspaceContext] Auto-retrying identity sync (attempt ${retryCountRef.current})`,
          { reason: isMissing ? "missing" : "timeout" }
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
        // Retries exhausted. If the cause is MISSING_USER_WORKSPACE (user doc
        // doesn't exist yet or has no workspaceId), treat as "needs onboarding"
        // rather than surfacing an error overlay.
        if (isMissing) {
          setNeedsOnboarding(true);
          setWorkspaceError(null);
        }
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
          setFirstName("");
          setLastName("");
          setAuthPhotoUrl(null);
          setWorkspaceId(null);
          setWorkspaceError(null);
          setNeedsOnboarding(false);
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
      setActiveWorkspaceForNotifications(null);
      return;
    }
    localStorage.setItem(`echly_active_workspace_${authUid}`, workspaceId);
    setActiveWorkspaceId(workspaceId);
    setActiveWorkspaceForNotifications(workspaceId);
  }, [authUid, workspaceId]);

  // Fetch all workspace memberships when identity is ready, or when an external
  // event (workspace created/joined) bumps membershipsRefreshTick.
  useEffect(() => {
    if (!claimsReady || !authUid) {
      setAllWorkspaces([]);
      return;
    }
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    setIsLoadingWorkspaces(true);
    authFetch("/api/workspace/memberships")
      .then((res) => {
        if (!res?.ok) return;
        return res.json() as Promise<{ success: boolean; data?: { memberships: WorkspaceMembership[] } }>;
      })
      .then((body) => {
        if (cancelled) return;
        if (body?.success && body.data?.memberships) {
          const list = body.data.memberships;
          setAllWorkspaces(list);
          const currentWid = workspaceIdRef.current;
          // UX-1: if the user has been removed from the active workspace,
          // redirect to a remaining workspace or sign them out so they don't
          // sit on a blank dashboard with no error.
          if (currentWid && list.length === 0) {
            missingActiveRetriesRef.current = 0;
            void (async () => {
              try {
                const { signOut } = await import("firebase/auth");
                await signOut(auth);
              } catch {
                /* non-fatal */
              }
              window.location.href = "/login?reason=workspace_access_revoked";
            })();
            return;
          }
          if (
            currentWid &&
            list.length > 0 &&
            !list.some((w) => w.workspaceId === currentWid)
          ) {
            if (missingActiveRetriesRef.current === 0) {
              // Server self-heal write may still be propagating — retry once.
              missingActiveRetriesRef.current += 1;
              retryTimer = setTimeout(() => {
                if (cancelled) return;
                setMembershipsRefreshTick((n) => n + 1);
              }, 1500);
            } else {
              // Confirmed: the user was removed from the active workspace.
              // Switch to a remaining one (switchWorkspace navigates).
              missingActiveRetriesRef.current = 0;
              void switchWorkspaceRef.current?.(list[0].workspaceId);
            }
          } else {
            missingActiveRetriesRef.current = 0;
          }
        }
      })
      .catch(() => {/* non-fatal */})
      .finally(() => {
        if (!cancelled) setIsLoadingWorkspaces(false);
      });
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [claimsReady, authUid, membershipsRefreshTick]);

  // Fetch member count once when active workspace changes
  useEffect(() => {
    if (!activeWorkspaceId || !claimsReady) return;
    authFetch("/api/workspace/members/all")
      .then((res) => res?.ok ? res.json() : null)
      .then((body: { success?: boolean; data?: { totalMembers?: number } } | null) =>
        setMemberCount(body?.data?.totalMembers ?? 0)
      )
      .catch(() => setMemberCount(0));
  }, [activeWorkspaceId, claimsReady]);

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

      // 4b. Signal the extension (if installed) — broadcast via window.postMessage
      // so the extension's content script can pick it up and propagate to its
      // background worker. Regular web pages can't write to chrome.storage.local
      // directly.
      try {
        window.postMessage(
          {
            type: "ANNOTE_WORKSPACE_SWITCH",
            workspaceId: wid,
            uid: auth.currentUser?.uid ?? null,
            timestamp: Date.now(),
          },
          window.location.origin
        );
      } catch {
        /* extension not installed or postMessage failed — non-fatal */
      }

      // 5. Reload to re-bootstrap with new workspace
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("[switchWorkspace] Error:", err);
    }
  }, [authUid]);

  useEffect(() => {
    switchWorkspaceRef.current = switchWorkspace;
  }, [switchWorkspace]);

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

  // claimsReady gates Firestore listeners; needsOnboarding lets the onboarding
  // page render for fresh signups whose workspace hasn't been created yet.
  const isIdentityReady = useMemo(
    () => Boolean(authUid) && (claimsReady || needsOnboarding),
    [authUid, claimsReady, needsOnboarding]
  );

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("IDENTITY READY:", isIdentityReady);
    }
  }, [isIdentityReady]);

  // PERF R-004: memoize context value so the ~20+ consumers only re-render when
  // a field they actually use changes, not on every WorkspaceProvider render.
  const displayName = useMemo(
    () => composeFullName(firstName, lastName),
    [firstName, lastName]
  );

  const contextValue = useMemo(
    () => ({
      workspaceId,
      workspaceError,
      workspaceLoading,
      needsOnboarding,
      claimsReady,
      isIdentityReady,
      authReady,
      isIdentityResolved,
      authUid,
      authEmail,
      firstName,
      lastName,
      displayName,
      authPhotoUrl,
      // Derived from workspace document — zero additional Firestore reads
      workspaceName: workspaceDoc?.name ?? null,
      workspaceLogoUrl: workspaceDoc?.logoUrl ?? null,
      brandLogoUrl: workspaceDoc?.brandLogoUrl ?? null,
      plan: workspaceDoc?.billing?.plan ?? "starter",
      customBrandingEntitled:
        workspaceDoc?.entitlements?.customBranding
          ?? PLANS[(workspaceDoc?.billing?.plan ?? "starter") as PlanId]?.customBranding
          ?? false,
      workspaceOwnerId: workspaceDoc?.ownerId ?? null,
      isWorkspaceOwner: !!authUid && !!workspaceDoc?.ownerId && authUid === workspaceDoc.ownerId,
      isWorkspaceDeleted: workspaceDoc?.deletedAt != null,
      allWorkspaces,
      activeWorkspaceId,
      switchWorkspace,
      isLoadingWorkspaces,
      refreshMemberships,
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
      needsOnboarding,
      claimsReady,
      isIdentityReady,
      authReady,
      isIdentityResolved,
      authUid,
      authEmail,
      firstName,
      lastName,
      displayName,
      authPhotoUrl,
      workspaceDoc,
      allWorkspaces,
      activeWorkspaceId,
      switchWorkspace,
      isLoadingWorkspaces,
      refreshMemberships,
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
