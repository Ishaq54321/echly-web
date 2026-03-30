"use client";

import { useEffect } from "react";
import type { User } from "firebase/auth";
import { usePathname } from "next/navigation";
import {
  useWorkspace,
  type WorkspaceContextValue,
} from "@/lib/client/workspaceContext";

type UseAuthGuardOptions = {
  /** If provided, redirect to /login when user is null (after first check). */
  router?: { push: (url: string) => void; replace: (url: string) => void };
  /** Use replace instead of push for login redirect. Default false. */
  useReplace?: boolean;
  /**
   * When true, signed-out users are not sent to /login (caller handles public UI).
   * `/session/*` skips redirect automatically so anonymous viewers can load the page.
   */
  skipLoginRedirect?: boolean;
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
  const { router, useReplace = false, skipLoginRedirect = false } = options;
  const pathname = usePathname();
  const publicSessionSurface =
    typeof pathname === "string" && pathname.startsWith("/session/");
  const ws = useWorkspace();
  const user = compatUser(ws);
  const loading = !ws.authReady;

  useEffect(() => {
    if (!router || loading || skipLoginRedirect || publicSessionSurface) return;
    if (user == null) {
      if (useReplace) {
        router.replace("/login");
      } else {
        router.push("/login");
      }
    }
  }, [router, useReplace, loading, user, skipLoginRedirect, publicSessionSurface]);

  return { user, loading };
}
