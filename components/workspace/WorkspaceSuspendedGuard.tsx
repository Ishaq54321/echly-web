"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StatusOverlay } from "@/components/ui/StatusOverlay";
import { AlertCircle } from "lucide-react";

interface WorkspaceSuspendedGuardProps {
  children: React.ReactNode;
}

/**
 * Fetches workspace status when signed in. If suspended, renders a non-dismissible
 * banner above the app (the owner can self-recover via the billing portal) instead
 * of hard-redirecting. Status-fetch failures fail closed via StatusOverlay.
 */
export function WorkspaceSuspendedGuard({ children }: WorkspaceSuspendedGuardProps) {
  const router = useRouter();
  const { authUid, isIdentityReady, workspaceId, isWorkspaceOwner } = useWorkspace();
  const [suspended, setSuspended] = useState<boolean | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

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
        return res.json() as Promise<{ data?: { suspended?: boolean } }>;
      })
      .then((body) => {
        if (!cancelled) setSuspended(body.data?.suspended === true);
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

  const handleUpdatePayment = async () => {
    setPortalLoading(true);
    try {
      const res = await authFetch("/api/billing/portal", { method: "POST" });
      const data = (await res?.json()) as { data?: { portalUrl?: string } } | null;
      if (data?.data?.portalUrl) {
        window.location.href = data.data.portalUrl;
        return;
      }
      console.error("[suspended banner] portal returned no URL");
    } catch (err) {
      console.error("[suspended banner] portal failed:", err);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <>
      {suspended === true && (
        <div
          role="alert"
          className="sticky top-0 z-50 w-full"
          style={{
            background: "var(--color-danger-bg)",
            borderBottom: "1px solid var(--color-danger-border)",
          }}
        >
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-6 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <AlertCircle
                className="h-5 w-5 flex-shrink-0"
                style={{ color: "var(--color-danger)" }}
                aria-hidden
              />
              <div className="text-sm" style={{ color: "var(--text-heading)" }}>
                <span className="font-medium">Your workspace is suspended.</span>
                <span className="ml-1" style={{ color: "var(--text-secondary)" }}>
                  {isWorkspaceOwner
                    ? "Update your payment method to restore access."
                    : "Ask your workspace owner to update billing."}
                </span>
              </div>
            </div>
            {isWorkspaceOwner && (
              <button
                type="button"
                onClick={handleUpdatePayment}
                disabled={portalLoading}
                className="h-9 flex-shrink-0 rounded-md px-4 text-sm font-medium text-white transition-opacity"
                style={{
                  background: "var(--color-danger-solid)",
                  opacity: portalLoading ? 0.7 : 1,
                }}
              >
                {portalLoading ? "Loading…" : "Update payment method"}
              </button>
            )}
          </div>
        </div>
      )}
      {children}
      {authUid && statusError ? (
        <StatusOverlay title="Could not load workspace status" message={statusError} />
      ) : null}
    </>
  );
}
