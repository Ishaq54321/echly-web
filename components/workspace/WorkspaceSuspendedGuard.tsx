"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StatusOverlay } from "@/components/ui/StatusOverlay";

interface WorkspaceSuspendedGuardProps {
  children: React.ReactNode;
}

/**
 * Fetches workspace status when signed in. If suspended, redirects to /workspace-suspended.
 * Failures do not fall through as "not suspended".
 */
export function WorkspaceSuspendedGuard({ children }: WorkspaceSuspendedGuardProps) {
  const router = useRouter();
  const { authUid, isIdentityReady, workspaceId } = useWorkspace();
  const [suspended, setSuspended] = useState<boolean | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Redirect to /no-workspace if user is authenticated but has no workspace at all
  useEffect(() => {
    if (!authUid || !isIdentityReady) return;
    if (workspaceId) return; // has workspace — no need to check
    let cancelled = false;
    void (async () => {
      try {
        const snap = await getDoc(doc(db, "users", authUid));
        if (cancelled) return;
        const data = (snap.exists() ? snap.data() : {}) as Record<string, unknown>;
        const wid = typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
        const memberships = Array.isArray(data.workspaceMemberships) ? data.workspaceMemberships : [];
        if (!wid && memberships.length === 0) {
          router.replace("/no-workspace");
        }
      } catch {/* non-fatal */}
    })();
    return () => { cancelled = true; };
  }, [authUid, isIdentityReady, workspaceId, router]);

  useEffect(() => {
    let cancelled = false;
    if (!isIdentityReady) {
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
  }, [isIdentityReady]);

  useEffect(() => {
    if (suspended === true) {
      router.replace("/workspace-suspended");
    }
  }, [suspended, router]);

  return (
    <>
      {children}
      {authUid && statusError ? (
        <StatusOverlay title="Could not load workspace status" message={statusError} />
      ) : null}
    </>
  );
}
