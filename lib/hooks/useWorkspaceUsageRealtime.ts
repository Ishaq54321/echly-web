"use client";

import { useEffect, useState } from "react";
import {
  retainWorkspaceFirestoreListener,
  useWorkspaceRealtimeStore,
  type WorkspaceUsageRealtimeData,
} from "@/lib/realtime/workspaceStore";
import { useWorkspace } from "@/lib/client/workspaceContext";

export function useWorkspaceUsageRealtime(options?: {
  enabled?: boolean;
}): {
  data: WorkspaceUsageRealtimeData | null;
  loading: boolean;
  error: string | null;
} {
  const enabled = options?.enabled ?? true;
  const { workspaceId: ctxWorkspaceId, isIdentityReady } = useWorkspace();
  const workspaceState = useWorkspaceRealtimeStore();
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setTargetWorkspaceId(null);
      return;
    }

    if (!isIdentityReady) {
      setTargetWorkspaceId(null);
      return;
    }

    const trimmed =
      ctxWorkspaceId != null && ctxWorkspaceId.trim() !== ""
        ? ctxWorkspaceId.trim()
        : null;
    if (trimmed == null) {
      setTargetWorkspaceId(null);
      return;
    }

    setTargetWorkspaceId(trimmed);
    const release = retainWorkspaceFirestoreListener(trimmed);

    return () => {
      release();
      setTargetWorkspaceId(null);
    };
  }, [enabled, isIdentityReady, ctxWorkspaceId]);

  if (!enabled) {
    return { data: null, loading: false, error: null };
  }

  const widReady =
    ctxWorkspaceId != null && ctxWorkspaceId.trim() !== "";
  const waitingForAuthOrWorkspace = !isIdentityReady || !widReady;

  const isMatchingWorkspace =
    targetWorkspaceId != null && workspaceState.workspaceId === targetWorkspaceId;
  const storeLoading = isMatchingWorkspace ? workspaceState.loading : false;

  return {
    data: isMatchingWorkspace ? workspaceState.data : null,
    loading:
      waitingForAuthOrWorkspace ||
      (targetWorkspaceId != null && !isMatchingWorkspace) ||
      storeLoading,
    error: isMatchingWorkspace ? (workspaceState.error?.message ?? null) : null,
  };
}
