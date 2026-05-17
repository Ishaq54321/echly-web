"use client";

import type { Workspace } from "@/lib/domain/workspace";

/**
 * Non-owner view, any plan state. A single read-only card naming the current
 * plan — no CTAs. Owner handles billing.
 */
export function ReadOnlyBillingState({
  workspace,
}: {
  workspace: Workspace;
}) {
  const plan = workspace.billing?.plan;
  const planLabel =
    plan === "business"
      ? "Business"
      : plan === "enterprise"
      ? "Enterprise"
      : "Starter";

  return (
    <div
      className="rounded-[var(--radius-lg)] p-8 text-center"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Current plan
      </div>
      <div
        className="mt-2 text-2xl font-semibold"
        style={{ color: "var(--text-heading)" }}
      >
        {planLabel}
      </div>
      <div
        className="mt-4 text-sm"
        style={{ color: "var(--text-tertiary)" }}
      >
        Your workspace owner manages billing for this workspace.
      </div>
    </div>
  );
}
