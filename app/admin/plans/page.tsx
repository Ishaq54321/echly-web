"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { Modal } from "@/components/ui/Modal";
import type { PlanWithId } from "@/app/api/admin/plans/route";

function formatPlanName(name: string, id: string): string {
  const raw = (name || id || "").trim();
  if (!raw) return id.charAt(0).toUpperCase() + id.slice(1);
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export default function AdminPlansPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<PlanWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<PlanWithId | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/admin/plans");
      if (!res || !res.ok) throw new Error("Failed to load plans");
      const envelope = (await res.json()) as { data?: PlanWithId[] };
      setPlans(Array.isArray(envelope.data) ? envelope.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateField = (id: string, field: keyof PlanWithId, value: string | number | boolean | null) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const save = async (plan: PlanWithId) => {
    setConfirmPlan(null);
    setSavingId(plan.id);
    setError(null);
    try {
      const res = await authFetch("/api/admin/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: plan.id,
          name: plan.name,
          pricePerSeat: plan.pricePerSeat,
          annualPricePerSeat: plan.annualPricePerSeat,
          maxFeedbackPerMonth: plan.maxFeedbackPerMonth,
          aiImprovementsPerMonth: plan.aiImprovementsPerMonth,
          maxMembers: plan.maxMembers,
          insightsEnabled: plan.insightsEnabled,
          customBranding: plan.customBranding,
          prioritySupport: plan.prioritySupport,
        }),
      });
      if (!res || !res.ok) throw new Error("Failed to save");
      showToast("Plan updated successfully");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-[var(--text-heading)] mb-8">Plans</h1>
        <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-[var(--text-heading)] mb-1">Plans</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">
        Edit plan definitions. Changes are saved to Firestore{" "}
        <code className="bg-[var(--surface-hover)] px-1 rounded text-xs">plans</code>.
      </p>
      {error && (
        <div className="mb-4 rounded-lg bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] px-4 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}
      <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Name</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">$/seat/mo</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">$/seat/yr</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Tickets/mo</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">AI/mo</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Max members</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Insights</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Branding</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)]">Priority</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-heading)] w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const isSaving = savingId === plan.id;
              return (
                <tr key={plan.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]/50">
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => updateField(plan.id, "name", e.target.value)}
                      placeholder={formatPlanName(plan.id, plan.id)}
                      disabled={isSaving}
                      className="w-full max-w-[100px] rounded-md border border-[var(--border)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      min={0}
                      value={plan.pricePerSeat ?? ""}
                      onChange={(e) => updateField(plan.id, "pricePerSeat", e.target.value === "" ? null : Number(e.target.value))}
                      disabled={isSaving}
                      placeholder="∞"
                      className="w-20 rounded-md border border-[var(--border)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      min={0}
                      value={plan.annualPricePerSeat ?? ""}
                      onChange={(e) => updateField(plan.id, "annualPricePerSeat", e.target.value === "" ? null : Number(e.target.value))}
                      disabled={isSaving}
                      placeholder="∞"
                      className="w-20 rounded-md border border-[var(--border)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      placeholder="∞"
                      value={plan.maxFeedbackPerMonth ?? ""}
                      onChange={(e) =>
                        updateField(plan.id, "maxFeedbackPerMonth", e.target.value === "" ? null : Number(e.target.value) || 0)
                      }
                      disabled={isSaving}
                      className="w-16 rounded-md border border-[var(--border)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      placeholder="∞"
                      value={plan.aiImprovementsPerMonth ?? ""}
                      onChange={(e) =>
                        updateField(plan.id, "aiImprovementsPerMonth", e.target.value === "" ? null : Number(e.target.value) || 0)
                      }
                      disabled={isSaving}
                      className="w-16 rounded-md border border-[var(--border)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      placeholder="∞"
                      value={plan.maxMembers ?? ""}
                      onChange={(e) =>
                        updateField(plan.id, "maxMembers", e.target.value === "" ? null : Number(e.target.value) || 0)
                      }
                      disabled={isSaving}
                      className="w-16 rounded-md border border-[var(--border)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={plan.insightsEnabled}
                        onChange={(e) => updateField(plan.id, "insightsEnabled", e.target.checked)}
                        disabled={isSaving}
                        className="rounded border-[var(--border)] text-[var(--brand)] focus:ring-[var(--brand)] disabled:opacity-50"
                      />
                      <span className="text-[var(--text-secondary)]">On</span>
                    </label>
                  </td>
                  <td className="px-4 py-2.5">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={plan.customBranding}
                        onChange={(e) => updateField(plan.id, "customBranding", e.target.checked)}
                        disabled={isSaving}
                        className="rounded border-[var(--border)] text-[var(--brand)] focus:ring-[var(--brand)] disabled:opacity-50"
                      />
                      <span className="text-[var(--text-secondary)]">On</span>
                    </label>
                  </td>
                  <td className="px-4 py-2.5">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={plan.prioritySupport}
                        onChange={(e) => updateField(plan.id, "prioritySupport", e.target.checked)}
                        disabled={isSaving}
                        className="rounded border-[var(--border)] text-[var(--brand)] focus:ring-[var(--brand)] disabled:opacity-50"
                      />
                      <span className="text-[var(--text-secondary)]">On</span>
                    </label>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setConfirmPlan(plan)}
                      disabled={isSaving}
                      className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isSaving ? "Saving…" : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!confirmPlan} onClose={() => setConfirmPlan(null)} role="alertdialog" ariaLabelledBy="confirm-plan-title">
        <div className="p-6">
          <h3 id="confirm-plan-title" className="text-lg font-semibold text-[var(--text-heading)]">
            Confirm plan changes?
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Updating plan limits affects all users on this plan immediately.
          </p>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setConfirmPlan(null)}
              className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmPlan && save(confirmPlan)}
              className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer"
            >
              Confirm Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
