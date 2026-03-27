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
      const data = await res.json();
      setPlans(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (id: string, field: keyof PlanWithId, value: string | number | boolean | null) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
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
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          maxSessions: plan.maxSessions,
          maxMembers: plan.maxMembers,
          insightsEnabled: plan.insightsEnabled,
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

  const handleSaveClick = (plan: PlanWithId) => {
    setConfirmPlan(plan);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-8">Plans</h1>
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Plans</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Edit plan definitions. Changes are saved to Firestore <code className="bg-neutral-100 px-1 rounded text-xs">plans</code>.
      </p>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-4 py-3 font-semibold text-neutral-900">Name</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Price/mo</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Price/yr</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Max sessions</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Max members</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Insights</th>
              <th className="px-4 py-3 font-semibold text-neutral-900 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const isSaving = savingId === plan.id;
              return (
                <tr key={plan.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => updateField(plan.id, "name", e.target.value)}
                      placeholder={formatPlanName(plan.id, plan.id)}
                      disabled={isSaving}
                      className="w-full max-w-[120px] rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 disabled:opacity-60 disabled:bg-neutral-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      min={0}
                      value={plan.priceMonthly}
                      onChange={(e) => updateField(plan.id, "priceMonthly", Number(e.target.value) || 0)}
                      disabled={isSaving}
                      className="w-20 rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 disabled:opacity-60 disabled:bg-neutral-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      min={0}
                      value={plan.priceYearly}
                      onChange={(e) => updateField(plan.id, "priceYearly", Number(e.target.value) || 0)}
                      disabled={isSaving}
                      className="w-20 rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 disabled:opacity-60 disabled:bg-neutral-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      placeholder="∞"
                      value={plan.maxSessions ?? ""}
                      onChange={(e) =>
                        updateField(
                          plan.id,
                          "maxSessions",
                          e.target.value === "" ? null : Number(e.target.value) || 0
                        )
                      }
                      disabled={isSaving}
                      className="w-16 rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 disabled:opacity-60 disabled:bg-neutral-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      placeholder="∞"
                      value={plan.maxMembers ?? ""}
                      onChange={(e) =>
                        updateField(
                          plan.id,
                          "maxMembers",
                          e.target.value === "" ? null : Number(e.target.value) || 0
                        )
                      }
                      disabled={isSaving}
                      className="w-16 rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 disabled:opacity-60 disabled:bg-neutral-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={plan.insightsEnabled}
                        onChange={(e) => updateField(plan.id, "insightsEnabled", e.target.checked)}
                        disabled={isSaving}
                        className="rounded border-neutral-300 text-[#155DFC] focus:ring-[#155DFC] disabled:opacity-60"
                      />
                      <span className="text-neutral-600">On</span>
                    </label>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleSaveClick(plan)}
                      disabled={isSaving}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium bg-[#155DFC] text-white hover:bg-[#155DFC]/90 disabled:opacity-60"
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

      <Modal
        open={!!confirmPlan}
        onClose={() => setConfirmPlan(null)}
        role="alertdialog"
        ariaLabelledBy="confirm-plan-title"
      >
        <div className="p-6">
          <h3 id="confirm-plan-title" className="text-lg font-semibold text-neutral-900">
            Confirm plan changes?
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            Updating plan limits affects all users on this plan.
          </p>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setConfirmPlan(null)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmPlan && save(confirmPlan)}
              className="rounded-lg px-3 py-2 text-sm font-medium bg-[#155DFC] text-white hover:bg-[#155DFC]/90"
            >
              Confirm Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
