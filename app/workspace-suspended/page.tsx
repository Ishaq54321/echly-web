"use client";

import { useState } from "react";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { authFetch } from "@/lib/authFetch";
import { CreditCard, AlertCircle } from "lucide-react";

export default function WorkspaceSuspendedPage() {
  const { isWorkspaceOwner } = useWorkspace();
  const [loading, setLoading] = useState(false);

  const handleUpdatePayment = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/billing/portal", { method: "POST" });
      const data = (await res?.json()) as { data?: { portalUrl?: string } } | null;
      if (data?.data?.portalUrl) {
        window.location.href = data.data.portalUrl;
        return;
      }
      console.error("[suspended page] portal returned no URL");
    } catch (err) {
      console.error("[suspended page] portal failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "var(--surface-subtle)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-10 text-center"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "var(--color-danger-bg)" }}
        >
          <AlertCircle className="h-8 w-8" style={{ color: "var(--color-danger)" }} aria-hidden />
        </div>

        <h1 className="mb-3 text-2xl font-semibold" style={{ color: "var(--text-heading)" }}>
          Workspace suspended
        </h1>

        <p
          className="mb-8 text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {isWorkspaceOwner
            ? "We couldn't process your latest payment. Update your payment method to restore access to your workspace."
            : "This workspace's billing needs attention. Ask your workspace owner to update the payment method to restore access."}
        </p>

        {isWorkspaceOwner && (
          <button
            type="button"
            onClick={handleUpdatePayment}
            disabled={loading}
            className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-base font-medium text-white transition-opacity"
            style={{ background: "var(--brand)", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              "Loading…"
            ) : (
              <>
                <CreditCard className="h-4 w-4" aria-hidden />
                Update payment method
              </>
            )}
          </button>
        )}

        <a
          href="mailto:ishaq@annote.ai"
          className="inline-flex items-center gap-1 text-sm transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          Contact support
        </a>
      </div>
    </div>
  );
}
