"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { useWorkspace } from "@/lib/client/workspaceContext";

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
  const { authReady, authUid, claimsReady } = useWorkspace();
  const [suspended, setSuspended] = useState<boolean | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!claimsReady) return;
    if (!authUid) {
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
  }, [claimsReady, authUid]);

  useEffect(() => {
    if (suspended === true) {
      router.replace("/workspace-suspended");
    }
  }, [suspended, router]);

  if (!authReady || (authUid && (!claimsReady || (suspended === null && !statusError)))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#466EFF]"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (statusError) {
    return <StatusErrorScreen message={statusError} />;
  }

  return <>{children}</>;
}
