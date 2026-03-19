"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import {
  clearWorkspaceSubscription,
  subscribeWorkspace,
  useWorkspaceRealtimeStore,
  type WorkspaceUsageRealtimeData,
} from "@/lib/realtime/workspaceStore";

export function useWorkspaceUsageRealtime(options?: {
  enabled?: boolean;
  uid?: string | null;
}): {
  data: WorkspaceUsageRealtimeData | null;
  loading: boolean;
  error: string | null;
} {
  const enabled = options?.enabled ?? true;
  const uid = options?.uid ?? null;
  const workspaceState = useWorkspaceRealtimeStore();
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string | null>(null);
  const [resolvingWorkspaceId, setResolvingWorkspaceId] = useState<boolean>(enabled);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [authCheckedNoUser, setAuthCheckedNoUser] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setTargetWorkspaceId(null);
      setResolvingWorkspaceId(false);
      setResolveError(null);
      setAuthCheckedNoUser(false);
      return;
    }

    let cancelled = false;
    let unsubscribeAuth: (() => void) | null = null;

    const resolveAndSubscribe = async (resolvedUid: string) => {
      const workspaceId = (await getUserWorkspaceIdRepo(resolvedUid)) ?? resolvedUid;
      if (cancelled) return;
      setTargetWorkspaceId(workspaceId);
      setResolvingWorkspaceId(false);
      setResolveError(null);
      setAuthCheckedNoUser(false);
      subscribeWorkspace(workspaceId);
    };

    setResolvingWorkspaceId(true);
    setResolveError(null);
    setTargetWorkspaceId(null);
    setAuthCheckedNoUser(false);

    if (uid) {
      void resolveAndSubscribe(uid).catch((err) => {
        if (cancelled) return;
        setTargetWorkspaceId(null);
        setResolveError(err instanceof Error ? err.message : "Failed to load workspace usage");
        setResolvingWorkspaceId(false);
      });
    } else {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (cancelled) return;
        if (!user) {
          clearWorkspaceSubscription();
          setTargetWorkspaceId(null);
          setResolvingWorkspaceId(false);
          setResolveError(null);
          setAuthCheckedNoUser(true);
          return;
        }
        setResolvingWorkspaceId(true);
        setResolveError(null);
        setAuthCheckedNoUser(false);
        void resolveAndSubscribe(user.uid).catch((err) => {
          if (cancelled) return;
          setTargetWorkspaceId(null);
          setResolveError(err instanceof Error ? err.message : "Failed to load workspace usage");
          setResolvingWorkspaceId(false);
        });
      });
    }

    return () => {
      cancelled = true;
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [enabled, uid]);

  if (!enabled) {
    return { data: null, loading: false, error: null };
  }

  if (!uid && authCheckedNoUser) {
    return { data: null, loading: false, error: null };
  }

  if (resolveError) {
    return { data: null, loading: false, error: resolveError };
  }

  const isMatchingWorkspace =
    targetWorkspaceId != null && workspaceState.workspaceId === targetWorkspaceId;
  const storeLoading = isMatchingWorkspace ? workspaceState.loading : false;

  return {
    data: isMatchingWorkspace ? workspaceState.data : null,
    loading: resolvingWorkspaceId || (targetWorkspaceId != null && !isMatchingWorkspace) || storeLoading,
    error: isMatchingWorkspace ? workspaceState.error : null,
  };
}
