"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { Modal } from "@/components/ui/Modal";
import type { WorkspaceRow } from "@/app/api/admin/workspaces/route";

const PLAN_OPTIONS = ["free", "starter", "business", "enterprise"] as const;
const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

export default function AdminCustomersPage() {
  const searchParams = useSearchParams();
  const planFilter = searchParams.get("plan") ?? null; // "free" | "paid" from dashboard links
  const { showToast } = useToast();
  const [rows, setRows] = useState<WorkspaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WorkspaceRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [overrideLimit, setOverrideLimit] = useState<string>("");
  const [newPlan, setNewPlan] = useState<string>("");
  /** Sync override input when selected workspace changes. Input = overrideLimit ?? planLimitSessions */
  useEffect(() => {
    if (!selected) return;
    const planDefault = selected.planLimitSessions;
    const override = selected.overrideLimit;
    if (override === undefined) {
      setOverrideLimit(planDefault != null ? String(planDefault) : "");
    } else if (override === null) {
      setOverrideLimit("");
    } else {
      setOverrideLimit(String(override));
    }
  }, [selected?.id, selected?.overrideLimit, selected?.planLimitSessions]);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
  } | null>(null);

  const filteredRows = useMemo(() => {
    if (!planFilter) return rows;
    if (planFilter === "free") return rows.filter((r) => r.plan === "free");
    if (planFilter === "paid") return rows.filter((r) => r.plan !== "free");
    return rows;
  }, [rows, planFilter]);

  const load = async (): Promise<WorkspaceRow[]> => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/workspaces");
      if (!res.ok) throw new Error("Failed to load workspaces");
      const data = await res.json();
      setRows(data);
      return data;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Action failed");
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

  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel?: string
  ) => {
    setConfirm({ title, message, onConfirm, confirmLabel });
  };

  const closeConfirm = () => setConfirm(null);

  const handleSuspend = (row: WorkspaceRow) => {
    openConfirm("Suspend workspace?", "Are you sure you want to suspend this workspace? Users will not be able to use the app.", () => {
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
        runAction(row.id, "set_plan", { plan }, "Workspace plan updated successfully.");
        closeConfirm();
      },
      "Confirm Change"
    );
  };

  const suspended = selected?.billing?.suspended === true;

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-8">Customers</h1>
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Customers</h1>
      <p className="text-sm text-neutral-600 mb-8">
        All workspaces. Click a row to open the detail panel.
        {planFilter && (
          <span className="ml-2 text-neutral-500">
            (filtered: {planFilter === "free" ? "Free" : "Paid"})
          </span>
        )}
      </p>
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-4 py-3 font-semibold text-neutral-900">Workspace</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Owner</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Plan</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Sessions</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Members</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelected(row)}
                className={`border-b border-neutral-100 cursor-pointer transition ${
                  selected?.id === row.id ? "bg-[#EAF1FF]" : "hover:bg-neutral-50"
                }`}
              >
                <td className="px-4 py-2.5 font-medium text-neutral-900">{row.name}</td>
                <td className="px-4 py-2.5 text-neutral-600">
                  {(row.ownerEmail ?? row.ownerName ?? row.ownerId) || "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                    {row.plan}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-neutral-600">{row.sessionsUsed}</td>
                <td className="px-4 py-2.5 text-neutral-600">{row.members}</td>
                <td className="px-4 py-2.5 text-neutral-500 text-xs">
                  {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelected(null)}
            aria-hidden
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-neutral-200 shadow-xl z-50 overflow-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">{selected.name}</h2>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Section 1 — Workspace Info */}
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                  Workspace Info
                </h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-neutral-500">Workspace name</dt>
                    <dd className="text-neutral-900 font-medium">{selected.name}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Owner email</dt>
                    <dd className="text-neutral-900">{selected.ownerEmail ?? selected.ownerId ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Plan</dt>
                    <dd className="text-neutral-900">{PLAN_LABELS[selected.plan] ?? selected.plan}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Sessions used</dt>
                    <dd className="text-neutral-900">{selected.sessionsUsed}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Members</dt>
                    <dd className="text-neutral-900">{selected.members}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Created date</dt>
                    <dd className="text-neutral-900">
                      {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Workspace ID</dt>
                    <dd className="font-mono text-neutral-500 text-xs break-all">{selected.id}</dd>
                  </div>
                </dl>
              </section>

              {/* Section 2 — Plan Controls */}
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                  Plan Controls
                </h3>
                <p className="text-xs text-neutral-500 mb-2">
                  Current plan:{" "}
                  {PLAN_LABELS[(selected.billing?.plan ?? selected.plan) as string] ??
                    (selected.billing?.plan ?? selected.plan)}
                </p>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Select new plan
                </label>
                <select
                  value={newPlan || selected.plan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  disabled={actionLoading}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm mb-2 disabled:opacity-60"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {PLAN_LABELS[p] ?? p}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleChangePlan(selected)}
                  disabled={
                    actionLoading ||
                    (newPlan || selected.plan) === (selected.billing?.plan ?? selected.plan)
                  }
                  className="rounded-lg px-3 py-2 text-sm font-medium bg-[#155DFC] text-white hover:bg-[#155DFC]/90 disabled:opacity-60 w-full"
                >
                  {actionLoading ? "Updating…" : "Change Plan"}
                </button>
              </section>

              {/* Section 3 — Limits */}
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                  Limits
                </h3>
                <p className="text-xs text-neutral-600 mb-2">
                  Plan default:{" "}
                  {selected.planLimitSessions != null
                    ? `${selected.planLimitSessions} sessions`
                    : "Unlimited"}
                </p>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Override session limit
                </label>
                <input
                  type="text"
                  value={overrideLimit}
                  onChange={(e) => setOverrideLimit(e.target.value)}
                  placeholder={
                    selected.planLimitSessions != null
                      ? `e.g. ${selected.planLimitSessions} or empty for plan default`
                      : "Empty = plan default (unlimited)"
                  }
                  disabled={actionLoading}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm mb-2 disabled:opacity-60"
                />
                {/* Status: Custom limit | Unlimited | Using plan default */}
                <p className="text-xs text-neutral-500 mb-2">
                  {selected.overrideLimit !== undefined ? (
                    selected.overrideLimit === null ? (
                      "Unlimited"
                    ) : (
                      "Custom limit"
                    )
                  ) : (
                    "Using plan default"
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (overrideLimit.trim() === "") {
                        runAction(selected.id, "remove_session_override", {}, "Override removed");
                      } else {
                        const value = parseInt(overrideLimit, 10);
                        if (!Number.isNaN(value) && value >= 0) {
                          runAction(
                            selected.id,
                            "override_session_limit",
                            { sessionLimit: value },
                            "Limit updated"
                          );
                        } else {
                          showToast("Enter a valid number");
                        }
                      }
                    }}
                    disabled={actionLoading}
                    className="rounded-lg px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200 disabled:opacity-60"
                  >
                    {actionLoading ? "Updating…" : "Set limit"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      runAction(selected.id, "grant_unlimited_sessions", {}, "Limit updated")
                    }
                    disabled={actionLoading}
                    className="rounded-lg px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200 disabled:opacity-60"
                  >
                    {actionLoading ? "Updating…" : "Grant unlimited"}
                  </button>
                  {selected.overrideLimit !== undefined && (
                    <button
                      type="button"
                      onClick={() =>
                        runAction(selected.id, "remove_session_override", {}, "Override removed")
                      }
                      disabled={actionLoading}
                      className="rounded-lg px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200 disabled:opacity-60"
                    >
                      {actionLoading ? "Updating…" : "Remove override"}
                    </button>
                  )}
                </div>
              </section>

              {/* Section 4 — Danger Zone */}
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                  Danger Zone
                </h3>
                <div className="space-y-2">
                  {suspended ? (
                    <button
                      type="button"
                      onClick={() => handleResume(selected)}
                      disabled={actionLoading}
                      className="w-full rounded-lg px-3 py-2 text-sm font-medium bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 disabled:opacity-60"
                    >
                      {actionLoading ? "Updating…" : "Resume workspace"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSuspend(selected)}
                      disabled={actionLoading}
                      className="w-full rounded-lg px-3 py-2 text-sm font-medium bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 disabled:opacity-60"
                    >
                      {actionLoading ? "Suspending…" : "Suspend workspace"}
                    </button>
                  )}
                </div>
              </section>
            </div>
          </div>
        </>
      )}

      <Modal
        open={!!confirm}
        onClose={closeConfirm}
        role="alertdialog"
        ariaLabelledBy="confirm-title"
      >
        {confirm && (
          <div className="p-6">
            <h3 id="confirm-title" className="text-lg font-semibold text-neutral-900">
              {confirm.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-600">{confirm.message}</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm.onConfirm}
                className="rounded-lg px-3 py-2 text-sm font-medium bg-[#155DFC] text-white hover:bg-[#155DFC]/90"
              >
                {confirm.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
