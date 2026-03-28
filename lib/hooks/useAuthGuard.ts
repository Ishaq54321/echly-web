"use client";

import { useEffect } from "react";
import type { User } from "firebase/auth";
import {
  useWorkspace,
  type WorkspaceContextValue,
} from "@/lib/client/workspaceContext";

type UseAuthGuardOptions = {
  /** If provided, redirect to /login when user is null (after first check). */
  router?: { push: (url: string) => void; replace: (url: string) => void };
  /** Use replace instead of push for login redirect. Default false. */
  useReplace?: boolean;
};

function compatUser(ws: WorkspaceContextValue): User | null {
  if (!ws.authUid) return null;
  return {
    uid: ws.authUid,
    email: ws.authEmail,
    displayName: ws.authDisplayName,
    photoURL: ws.authPhotoUrl,
  } as User;
}

/**
 * Session user for UI (profile, redirects). Sourced only from WorkspaceProvider auth fields.
 * Returns { user, loading } so callers can gate content.
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}): {
  user: User | null;
  loading: boolean;
} {
  const { router, useReplace = false } = options;
  const ws = useWorkspace();
  const user = compatUser(ws);
  const loading = !ws.authReady;

  useEffect(() => {
    if (!router || loading) return;
    if (user == null) {
      if (useReplace) {
        router.replace("/login");
      } else {
        router.push("/login");
      }
    }
  }, [router, useReplace, loading, user]);

  return { user, loading };
}
