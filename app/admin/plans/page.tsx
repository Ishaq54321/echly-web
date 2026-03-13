"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import type { PlanWithId } from "@/app/api/admin/plans/route";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/admin/plans");
      if (!res.ok) throw new Error("Failed to load plans");
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
    setSavingId(plan.id);
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
      if (!res.ok) throw new Error("Failed to save");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingId(null);
    }
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
              <th className="px-4 py-3 font-semibold text-neutral-900">Plan</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Name</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Price /mo</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Price /yr</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Max sessions</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Max members</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Insights</th>
              <th className="px-4 py-3 font-semibold text-neutral-900 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                <td className="px-4 py-2.5 font-medium text-neutral-900">{plan.id}</td>
                <td className="px-4 py-2.5">
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updateField(plan.id, "name", e.target.value)}
                    className="w-full max-w-[120px] rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    min={0}
                    value={plan.priceMonthly}
                    onChange={(e) => updateField(plan.id, "priceMonthly", Number(e.target.value) || 0)}
                    className="w-20 rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    min={0}
                    value={plan.priceYearly}
                    onChange={(e) => updateField(plan.id, "priceYearly", Number(e.target.value) || 0)}
                    className="w-20 rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
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
                    className="w-16 rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
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
                    className="w-16 rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={plan.insightsEnabled}
                      onChange={(e) => updateField(plan.id, "insightsEnabled", e.target.checked)}
                      className="rounded border-neutral-300 text-[#155DFC] focus:ring-[#155DFC]"
                    />
                    <span className="text-neutral-600">On</span>
                  </label>
                </td>
                <td className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => save(plan)}
                    disabled={savingId === plan.id}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium bg-[#155DFC] text-white hover:bg-[#155DFC]/90 disabled:opacity-60"
                  >
                    {savingId === plan.id ? "Saving…" : "Save"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
