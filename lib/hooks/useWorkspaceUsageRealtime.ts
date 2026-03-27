"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  clearWorkspaceSubscription,
  subscribeWorkspace,
  useWorkspaceRealtimeStore,
  type WorkspaceUsageRealtimeData,
} from "@/lib/realtime/workspaceStore";
import { useWorkspace } from "@/lib/client/workspaceContext";

export function useWorkspaceUsageRealtime(options?: {
  enabled?: boolean;
  uid?: string | null;
}): {
  data: WorkspaceUsageRealtimeData | null;
  loading: boolean;
  error: string | null;
} {
  const enabled = options?.enabled ?? true;
  const uidOpt = options?.uid ?? null;
  const { workspaceId: ctxWorkspaceId, claimsReady } = useWorkspace();
  const workspaceState = useWorkspaceRealtimeStore();
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string | null>(null);
  const [authCheckedNoUser, setAuthCheckedNoUser] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setTargetWorkspaceId(null);
      setAuthCheckedNoUser(false);
      return;
    }

    let cancelled = false;

    const sync = (user: User | null) => {
      if (cancelled) return;
      if (!user) {
        clearWorkspaceSubscription();
        setTargetWorkspaceId(null);
        setAuthCheckedNoUser(true);
        return;
      }
      setAuthCheckedNoUser(false);

      if (uidOpt != null && user.uid !== uidOpt) {
        clearWorkspaceSubscription();
        setTargetWorkspaceId(null);
        return;
      }

      if (!claimsReady || !ctxWorkspaceId) {
        clearWorkspaceSubscription();
        setTargetWorkspaceId(null);
        return;
      }

      setTargetWorkspaceId(ctxWorkspaceId);
      subscribeWorkspace(ctxWorkspaceId);
    };

    const unsub = onAuthStateChanged(auth, sync);
    sync(auth.currentUser);

    return () => {
      cancelled = true;
      unsub();
    };
  }, [enabled, uidOpt, claimsReady, ctxWorkspaceId]);

  if (!enabled) {
    return { data: null, loading: false, error: null };
  }

  if (!uidOpt && authCheckedNoUser) {
    return { data: null, loading: false, error: null };
  }

  const user = auth.currentUser;
  const waitingForClaimsOrWorkspace =
    !!user && (!claimsReady || !ctxWorkspaceId || (uidOpt != null && user.uid !== uidOpt));

  const isMatchingWorkspace =
    targetWorkspaceId != null && workspaceState.workspaceId === targetWorkspaceId;
  const storeLoading = isMatchingWorkspace ? workspaceState.loading : false;

  return {
    data: isMatchingWorkspace ? workspaceState.data : null,
    loading:
      waitingForClaimsOrWorkspace ||
      (targetWorkspaceId != null && !isMatchingWorkspace) ||
      storeLoading,
    error: isMatchingWorkspace ? (workspaceState.error?.message ?? null) : null,
  };
}
