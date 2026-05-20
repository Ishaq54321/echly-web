"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { Modal } from "@/components/ui/Modal";
import type { WorkspaceRow } from "@/app/api/admin/workspaces/route";

const PLAN_OPTIONS = ["starter", "business", "enterprise"] as const;
const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

function stripeDashboardUrl(path: string): string {
  // Stripe uses /test/ prefix in test mode, no prefix in live mode.
  // We derive test vs live from the publishable key prefix (sk_test_* vs sk_live_*),
  // which is set on the server. Since this is a client component, we use a separate
  // public env var to communicate the mode.
  const isTestMode =
    process.env.NEXT_PUBLIC_STRIPE_MODE !== "live";
  const prefix = isTestMode ? "/test" : "";
  return `https://dashboard.stripe.com${prefix}${path}`;
}

export default function AdminCustomersPage() {
  const searchParams = useSearchParams();
  const planFilter = searchParams.get("plan") ?? null;
  const { showToast } = useToast();
  const [rows, setRows] = useState<WorkspaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WorkspaceRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [overrideFeedbackLimit, setOverrideFeedbackLimit] = useState<string>("");
  const [newPlan, setNewPlan] = useState<string>("");
  const [compPlan, setCompPlan] = useState<string>("business");
  const [compSeats, setCompSeats] = useState<string>("1");
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
  } | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelEffective, setCancelEffective] = useState<
    "immediately" | "next_billing_period"
  >("next_billing_period");

  useEffect(() => {
    if (!selected) return;
    const planDefault = selected.planLimitFeedback;
    const override = selected.overrideFeedbackLimit;
    if (override === undefined) {
      setOverrideFeedbackLimit(planDefault != null ? String(planDefault) : "");
    } else if (override === null) {
      setOverrideFeedbackLimit("");
    } else {
      setOverrideFeedbackLimit(String(override));
    }
  }, [selected?.id, selected?.overrideFeedbackLimit, selected?.planLimitFeedback]);

  const filteredRows = useMemo(() => {
    if (!planFilter) return rows;
    if (planFilter === "starter") return rows.filter((r) => r.plan === "starter");
    if (planFilter === "paid") return rows.filter((r) => r.plan !== "starter");
    return rows;
  }, [rows, planFilter]);

  const load = async (): Promise<WorkspaceRow[]> => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/workspaces");
      if (!res || !res.ok) throw new Error("Failed to load workspaces");
      const envelope = (await res.json()) as { data?: WorkspaceRow[] };
      const data = Array.isArray(envelope.data) ? envelope.data : [];
      setRows(data);
      return data;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runAction = async (
    workspaceId: string,
    action: string,
    body: Record<string, unknown>,
    successToast?: string
  ) => {
    setActionLoading(true);
    try {
      const res = await authFetch("/api/admin/workspaces/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, action, ...body }),
      });
      if (!res) throw new Error("Action failed");
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(err.error?.message ?? "Action failed");
      }
      if (successToast) showToast(successToast);
      const data = await load();
      const next = data.find((w) => w.id === workspaceId);
      if (next) setSelected(next);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void, confirmLabel?: string) => {
    setConfirm({ title, message, onConfirm, confirmLabel });
  };
  const closeConfirm = () => setConfirm(null);

  const handleSuspend = (row: WorkspaceRow) => {
    openConfirm("Suspend workspace?", "Users will not be able to use the app.", () => {
      runAction(row.id, "suspend", {}, "Workspace suspended");
      closeConfirm();
    });
  };

  const handleResume = (row: WorkspaceRow) => {
    openConfirm("Resume workspace?", "Are you sure you want to resume this workspace?", () => {
      runAction(row.id, "resume", {}, "Workspace resumed");
      closeConfirm();
    });
  };

  const handleChangePlan = (row: WorkspaceRow) => {
    const plan = (newPlan || row.plan) as string;
    openConfirm(
      "Change Workspace Plan",
      "This will update the workspace plan and adjust limits accordingly.",
      () => {
        runAction(row.id, "set_plan", { plan }, "Plan updated");
        closeConfirm();
      },
      "Confirm Change"
    );
  };

  const handleGrantComp = (row: WorkspaceRow) => {
    const seats = parseInt(compSeats, 10);
    if (Number.isNaN(seats) || seats < 1) {
      showToast("Seats must be a positive integer");
      return;
    }
    openConfirm(
      "Grant comp plan?",
      `This sets ${PLAN_LABELS[compPlan] ?? compPlan} (${seats} seat${seats === 1 ? "" : "s"}) as a manual override. Provider billing webhooks will no longer downgrade or suspend this workspace, and any existing subscription link is cleared.`,
      () => {
        runAction(row.id, "set_manual_override", { plan: compPlan, seats }, "Comp plan granted");
        closeConfirm();
      },
      "Grant comp"
    );
  };

  const handleRemoveComp = (row: WorkspaceRow) => {
    openConfirm(
      "Remove manual override?",
      "Billing webhooks will resume mutating this workspace. It stays on its current plan until a real billing event occurs.",
      () => {
        runAction(row.id, "remove_manual_override", {}, "Manual override removed");
        closeConfirm();
      },
      "Remove override"
    );
  };

  const suspended = selected?.billing?.suspended === true;
  const isManualOverride = selected?.billing?.manualOverride === true;

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-[var(--text-heading)] mb-8">Customers</h1>
        <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-[var(--text-heading)] mb-1">Customers</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">
        All workspaces. Click a row to open the detail panel.
        {planFilter && (
          <span className="ml-2 text-[var(--text-secondary)]">
            (filtered: {planFilter === "starter" ? "Starter" : "Paid"})
          </span>
        )}
      </p>
      <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Workspace</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Owner</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Plan</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Subscription</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Tickets (month)</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Seats</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelected(row)}
                className={`border-b border-[var(--border)] cursor-pointer transition ${
                  selected?.id === row.id ? "bg-[var(--brand-subtle)]" : "hover:bg-[var(--surface-hover)]"
                }`}
              >
                <td className="px-4 py-2.5 font-medium text-[var(--text-heading)]">{row.name}</td>
                <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                  {(row.ownerEmail ?? row.ownerName ?? row.ownerId) || "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-xs font-medium text-[var(--text-body)]">
                    {row.plan}
                  </span>
                  {row.billing?.manualOverride === true && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand)]">
                      Manual override
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {row.billing?.subscriptionId ? (
                    <span className="inline-flex items-center rounded-full bg-[var(--color-success-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-success)]">
                      Active
                    </span>
                  ) : row.plan === "business" ? (
                    <span className="text-xs text-amber-600">No sub</span>
                  ) : (
                    <span className="text-xs text-[var(--text-tertiary)]">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                  {row.usage.feedbackCreatedThisMonth}
                  {row.planLimitFeedback != null ? ` / ${row.planLimitFeedback}` : " / ∞"}
                </td>
                <td className="px-4 py-2.5 text-[var(--text-secondary)]">{row.seats}</td>
                <td className="px-4 py-2.5 text-[var(--text-secondary)] text-xs">
                  {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelected(null)} aria-hidden />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-[var(--border)] shadow-xl z-50 overflow-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-heading)]">{selected.name}</h2>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-body)]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Workspace Info */}
              <section>
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                  Workspace Info
                </h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-[var(--text-secondary)]">Owner email</dt>
                    <dd className="text-[var(--text-heading)]">{selected.ownerEmail ?? selected.ownerId ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-secondary)]">Plan</dt>
                    <dd className="flex items-center gap-2">
                      <span className="text-[var(--text-heading)]">{PLAN_LABELS[selected.plan] ?? selected.plan}</span>
                      {selected.plan === "business" && selected.billing?.subscriptionId && (
                        <span className="inline-flex items-center rounded-full bg-[var(--color-success-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-success)]">
                          Active
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-secondary)]">Tickets this month</dt>
                    <dd className="text-[var(--text-heading)]">
                      {selected.usage.feedbackCreatedThisMonth}
                      {selected.planLimitFeedback != null
                        ? ` / ${selected.planLimitFeedback}`
                        : " (unlimited)"}
                      {selected.overrideFeedbackLimit !== undefined && (
                        <span className="ml-1 text-xs text-[var(--brand)]">(override active)</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-secondary)]">Total tickets</dt>
                    <dd className="text-[var(--text-heading)]">{selected.usage.feedbackCreated}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-secondary)]">Seats purchased</dt>
                    <dd className="text-[var(--text-heading)]">{selected.seats}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-secondary)]">Active members</dt>
                    <dd className="text-[var(--text-heading)]">{selected.members}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-secondary)]">Created</dt>
                    <dd className="text-[var(--text-heading)]">
                      {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-secondary)]">Workspace ID</dt>
                    <dd className="font-mono text-[var(--text-secondary)] text-xs break-all">{selected.id}</dd>
                  </div>
                  {selected.billing?.customerId && (
                    <div>
                      <dt className="text-[var(--text-secondary)]">Customer</dt>
                      <dd className="font-mono text-xs break-all">
                        <a
                          href={stripeDashboardUrl(`/customers/${selected.billing.customerId}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--brand)] hover:underline"
                        >
                          {selected.billing.customerId}
                        </a>
                      </dd>
                    </div>
                  )}
                  {selected.billing?.subscriptionId && (
                    <div>
                      <dt className="text-[var(--text-secondary)]">Subscription</dt>
                      <dd className="font-mono text-xs break-all">
                        <a
                          href={stripeDashboardUrl(`/subscriptions/${selected.billing.subscriptionId}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--brand)] hover:underline"
                        >
                          {selected.billing.subscriptionId}
                        </a>
                      </dd>
                    </div>
                  )}
                  {selected.billing?.billingCycle && selected.plan === "business" && (
                    <div>
                      <dt className="text-[var(--text-secondary)]">Billing cycle</dt>
                      <dd className="text-[var(--text-heading)] capitalize">{selected.billing.billingCycle}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* Plan Controls */}
              <section>
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                  Plan Controls
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  Current: {PLAN_LABELS[(selected.billing?.plan ?? selected.plan) as string] ?? (selected.billing?.plan ?? selected.plan)}
                </p>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Select new plan</label>
                <select
                  value={newPlan || selected.plan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  disabled={actionLoading}
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm mb-2 disabled:opacity-50"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>{PLAN_LABELS[p] ?? p}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleChangePlan(selected)}
                  disabled={
                    actionLoading ||
                    (newPlan || selected.plan) === (selected.billing?.plan ?? selected.plan)
                  }
                  className="inline-flex h-[38px] items-center justify-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none w-full"
                >
                  {actionLoading ? "Updating…" : "Change Plan"}
                </button>
              </section>

              {/* Ticket Limit Controls */}
              <section>
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                  Ticket Limit
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  Plan default:{" "}
                  {selected.planLimitFeedback != null
                    ? `${selected.planLimitFeedback} tickets / month`
                    : "Unlimited"}
                </p>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Override monthly ticket limit (empty = plan default)
                </label>
                <input
                  type="text"
                  value={overrideFeedbackLimit}
                  onChange={(e) => setOverrideFeedbackLimit(e.target.value)}
                  placeholder={selected.planLimitFeedback != null ? `e.g. ${selected.planLimitFeedback}` : "Empty = unlimited"}
                  disabled={actionLoading}
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm mb-2 disabled:opacity-50"
                />
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  {selected.overrideFeedbackLimit !== undefined
                    ? selected.overrideFeedbackLimit === null
                      ? "Override: Unlimited"
                      : `Override: ${selected.overrideFeedbackLimit} tickets / month`
                    : "Using plan default"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (overrideFeedbackLimit.trim() === "") {
                        runAction(selected.id, "remove_feedback_override", {}, "Override removed");
                      } else {
                        const value = parseInt(overrideFeedbackLimit, 10);
                        if (!Number.isNaN(value) && value >= 0) {
                          runAction(selected.id, "override_feedback_limit", { feedbackLimit: value }, "Limit updated");
                        } else {
                          showToast("Enter a valid number");
                        }
                      }
                    }}
                    disabled={actionLoading}
                    className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {actionLoading ? "Updating…" : "Set limit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => runAction(selected.id, "grant_unlimited_feedback", {}, "Unlimited granted")}
                    disabled={actionLoading}
                    className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {actionLoading ? "Updating…" : "Grant unlimited"}
                  </button>
                  {selected.overrideFeedbackLimit !== undefined && (
                    <button
                      type="button"
                      onClick={() => runAction(selected.id, "remove_feedback_override", {}, "Override removed")}
                      disabled={actionLoading}
                      className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {actionLoading ? "Updating…" : "Remove override"}
                    </button>
                  )}
                </div>
              </section>

              {/* Comp / Manual Override */}
              <section>
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                  Comp Plan
                </h3>
                {isManualOverride ? (
                  <>
                    <p className="text-xs text-[var(--text-secondary)] mb-3">
                      <span className="inline-flex items-center rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand)] mr-1.5">
                        Manual override
                      </span>
                      Billing webhooks will not downgrade or suspend this workspace.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveComp(selected)}
                      disabled={actionLoading}
                      className="inline-flex h-[38px] items-center justify-center gap-2 w-full px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {actionLoading ? "Updating…" : "Remove manual override"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                      Grant a free plan that survives billing webhooks. Clears any existing subscription link.
                    </p>
                    <div className="flex gap-2 mb-2">
                      <select
                        value={compPlan}
                        onChange={(e) => setCompPlan(e.target.value)}
                        disabled={actionLoading}
                        className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-50"
                      >
                        {PLAN_OPTIONS.map((p) => (
                          <option key={p} value={p}>{PLAN_LABELS[p] ?? p}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={compSeats}
                        onChange={(e) => setCompSeats(e.target.value)}
                        disabled={actionLoading}
                        aria-label="Seats"
                        className="w-20 rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGrantComp(selected)}
                      disabled={actionLoading}
                      className="inline-flex h-[38px] items-center justify-center gap-2 w-full px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {actionLoading ? "Granting…" : "Grant comp plan"}
                    </button>
                  </>
                )}
              </section>

              {/* Danger Zone */}
              <section>
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                  Danger Zone
                </h3>
                <div className="space-y-2">
                  {suspended ? (
                    <button
                      type="button"
                      onClick={() => handleResume(selected)}
                      disabled={actionLoading}
                      className="inline-flex h-[38px] items-center justify-center gap-2 w-full px-4 rounded-[var(--radius-btn)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-solid)] text-[14px] font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {actionLoading ? "Updating…" : "Resume workspace"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSuspend(selected)}
                      disabled={actionLoading}
                      className="inline-flex h-[38px] items-center justify-center gap-2 w-full px-4 rounded-[var(--radius-btn)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-[14px] font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {actionLoading ? "Suspending…" : "Suspend workspace"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setCancelEffective("next_billing_period");
                      setCancelModalOpen(true);
                    }}
                    disabled={
                      actionLoading ||
                      selected.plan === "starter" ||
                      selected.billing?.manualOverride === true ||
                      !selected.billing?.subscriptionId
                    }
                    className="inline-flex h-[38px] items-center justify-center gap-2 w-full px-4 rounded-[var(--radius-btn)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-[14px] font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Cancel subscription
                  </button>
                </div>
              </section>
            </div>
          </div>
        </>
      )}

      <Modal open={!!confirm} onClose={closeConfirm} role="alertdialog" ariaLabelledBy="confirm-title">
        {confirm && (
          <div className="p-6">
            <h3 id="confirm-title" className="text-lg font-semibold text-[var(--text-heading)]">
              {confirm.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{confirm.message}</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeConfirm}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm.onConfirm}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer"
              >
                {confirm.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        role="alertdialog"
        ariaLabelledBy="cancel-sub-title"
      >
        {selected && (
          <div className="p-6">
            <h3
              id="cancel-sub-title"
              className="text-lg font-semibold text-[var(--text-heading)]"
            >
              Cancel subscription
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Cancel subscription for <strong>{selected.name}</strong>? The
              workspace will be downgraded to Starter.
            </p>

            <div className="mt-4 space-y-2">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="radio"
                  name="cancel-effective"
                  value="next_billing_period"
                  checked={cancelEffective === "next_billing_period"}
                  onChange={() => setCancelEffective("next_billing_period")}
                  className="mt-1"
                />
                <span>
                  <strong className="text-[14px] text-[var(--text-heading)]">
                    End of billing period
                  </strong>
                  <span className="block text-sm text-[var(--text-secondary)]">
                    Customer keeps access until their next billing date
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="radio"
                  name="cancel-effective"
                  value="immediately"
                  checked={cancelEffective === "immediately"}
                  onChange={() => setCancelEffective("immediately")}
                  className="mt-1"
                />
                <span>
                  <strong className="text-[14px] text-[var(--text-heading)]">
                    Immediately
                  </strong>
                  <span className="block text-sm text-[var(--text-secondary)]">
                    Customer loses access right away
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={async () => {
                  setCancelModalOpen(false);
                  await runAction(
                    selected.id,
                    "cancel_subscription",
                    { effective: cancelEffective },
                    "Subscription canceled"
                  );
                }}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--color-danger-solid)] text-white text-[14px] font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                Confirm cancellation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
