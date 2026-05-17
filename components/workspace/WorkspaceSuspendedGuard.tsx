"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertCircle } from "lucide-react";

interface WorkspaceSuspendedGuardProps {
  children: React.ReactNode;
}

/**
 * Renders a non-dismissible suspended banner above the app (the owner can
 * self-recover via the billing portal) instead of hard-redirecting.
 *
 * The suspended state is read from the realtime workspace context — the SAME
 * Firestore-synced doc BillingTab uses — not a one-shot status fetch. This
 * keeps the banner in lock-step with the rest of the billing UI and makes it
 * react to state changes within ~1s without a page reload.
 *
 * Defense-in-depth: the banner only shows when the workspace is actually on a
 * paid plan. A canceled/starter workspace with a lingering `suspended: true`
 * must NOT show the banner (mirrors BillingTab's isMeaningfullySuspended).
 */
export function WorkspaceSuspendedGuard({ children }: WorkspaceSuspendedGuardProps) {
  const router = useRouter();
  const {
    authUid,
    isIdentityReady,
    workspaceId,
    isWorkspaceOwner,
    isWorkspaceSuspended,
    plan,
  } = useWorkspace();
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

  // Defense in depth: only show suspended UI when the workspace is actually on
  // a paid plan. A canceled/starter workspace with a lingering suspended: true
  // (e.g. mid-cascade, before the cancel write lands) must NOT show the banner.
  const isMeaningfullySuspended =
    isWorkspaceSuspended && (plan === "business" || plan === "enterprise");

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
      {isMeaningfullySuspended && (
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
    </>
  );
}
