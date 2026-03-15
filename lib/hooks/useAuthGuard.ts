"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserWorkspaceLinkRepo } from "@/lib/repositories/usersRepository";

type UseAuthGuardOptions = {
  /** If provided, redirect to /login when user is null (after first check). */
  router?: { push: (url: string) => void; replace: (url: string) => void };
  /** Use replace instead of push for login redirect. Default false. */
  useReplace?: boolean;
};

/**
 * Subscribe to Firebase auth state. Optionally redirect to /login when not authenticated.
 * Returns { user, loading } so callers can gate content.
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}): {
  user: User | null;
  loading: boolean;
} {
  const { router, useReplace = false } = options;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ?? null);
      setLoading(false);
      if (currentUser) {
        // Idempotent: creates user + workspace + links workspaceId if missing.
        // Fire-and-forget so auth transitions aren't blocked.
        ensureUserWorkspaceLinkRepo(currentUser).catch((err) => {
          console.error("Failed to ensure user workspace link:", err);
        });
      }
      if (currentUser == null && router) {
        if (useReplace) {
          router.replace("/login");
        } else {
          router.push("/login");
        }
      }
    });
    return () => unsubscribe();
  }, [router, useReplace]);

  return { user, loading };
}
