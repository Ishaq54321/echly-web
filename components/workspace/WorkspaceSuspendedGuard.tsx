"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";

interface WorkspaceSuspendedGuardProps {
  children: React.ReactNode;
}

function StatusErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <p className="text-lg font-medium text-gray-900">Could not load workspace status</p>
      <p className="max-w-md text-sm text-gray-600">{message}</p>
      <button
        type="button"
        className="rounded-lg bg-[#466EFF] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  );
}

/**
 * Fetches workspace status when signed in. If suspended, redirects to /workspace-suspended.
 * Failures do not fall through as "not suspended".
 */
export function WorkspaceSuspendedGuard({ children }: WorkspaceSuspendedGuardProps) {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [suspended, setSuspended] = useState<boolean | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!authReady) return;
    if (firebaseUser === null) {
      setSuspended(false);
      setStatusError(null);
      return;
    }
    setSuspended(null);
    setStatusError(null);
    authFetch("/api/workspace/status")
      .then((res) => {
        if (!res) {
          throw new Error("Could not fetch workspace status");
        }
        if (!res.ok) {
          throw new Error(`Workspace status failed (${res.status})`);
        }
        return res.json() as Promise<{ suspended?: boolean }>;
      })
      .then((data) => {
        if (!cancelled) setSuspended(data.suspended === true);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatusError(err instanceof Error ? err.message : "Failed to load workspace status");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, firebaseUser]);

  useEffect(() => {
    if (suspended === true) {
      router.replace("/workspace-suspended");
    }
  }, [suspended, router]);

  if (statusError) {
    return <StatusErrorScreen message={statusError} />;
  }

  return <>{children}</>;
}
