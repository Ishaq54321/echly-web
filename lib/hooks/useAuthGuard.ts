"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authFetch, clearAuthTokenCache } from "@/lib/authFetch";
import { clearFeedbackSubscription } from "@/lib/realtime/feedbackStore";
import { clearWorkspaceSubscription } from "@/lib/realtime/workspaceStore";

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
  const [, setSyncStatus] = useState<"idle" | "syncing" | "ok" | "failed">(
    "idle"
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ?? null);
      setLoading(false);
      if (currentUser) {
        // Idempotent: creates/ensures user profile.
        // Fire-and-forget: UI uses Firebase auth; /api/users failure must not break the app.
        setSyncStatus("syncing");
        authFetch("/api/users", { method: "POST" })
          .then(async (res) => {
            if (!res || !res.ok) {
              const msg = res ? await res.text() : "Not authenticated";
              console.warn("[AUTH_SYNC] Non-blocking failure:", msg);
              setSyncStatus("failed");
              return;
            }
            try {
              await auth.currentUser?.getIdToken(true);
            } catch (err) {
              console.warn("[AUTH_SYNC] Token refresh failed", err);
            }
            setSyncStatus("ok");
          })
          .catch((err) => {
            console.warn("[AUTH_SYNC] Request failed (non-blocking):", err);
            setSyncStatus("failed");
          });
      }
      if (currentUser == null) {
        setSyncStatus("idle");
        clearAuthTokenCache();
        clearFeedbackSubscription();
        clearWorkspaceSubscription();
        if (router) {
          if (useReplace) {
            router.replace("/login");
          } else {
            router.push("/login");
          }
        }
      }
    });
    return () => unsubscribe();
  }, [router, useReplace]);

  return { user, loading };
}
