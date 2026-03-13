"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import type { WorkspaceRow } from "@/app/api/admin/workspaces/route";

const PLAN_OPTIONS = ["free", "starter", "business", "enterprise"] as const;

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<WorkspaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WorkspaceRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [overrideLimit, setOverrideLimit] = useState<string>("");
  const [newPlan, setNewPlan] = useState<string>("");

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
    body: Record<string, unknown>
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
      const data = await load();
      const next = data.find((w) => w.id === workspaceId);
      if (next) setSelected(next);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

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
            {rows.map((row) => (
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

      {/* Detail drawer */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelected(null)}
            aria-hidden
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-neutral-200 shadow-xl z-50 overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
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
              <dl className="space-y-2 text-sm mb-6">
                <div>
                  <dt className="text-neutral-500">Workspace ID</dt>
                  <dd className="font-mono text-neutral-900 break-all">{selected.id}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Owner</dt>
                  <dd className="text-neutral-900">{selected.ownerEmail ?? selected.ownerId}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Plan</dt>
                  <dd className="text-neutral-900">{selected.plan}</dd>
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
                  <dt className="text-neutral-500">Max sessions (entitlement)</dt>
                  <dd className="text-neutral-900">
                    {selected.entitlements?.maxSessions ?? "—"} (null = unlimited)
                  </dd>
                </div>
              </dl>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    New plan (upgrade/downgrade)
                  </label>
                  <select
                    value={newPlan || selected.plan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  >
                    {PLAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        runAction(selected.id, "upgrade", {
                          newPlan: (newPlan || selected.plan) as string,
                        })
                      }
                      disabled={actionLoading}
                      className="rounded-lg px-3 py-2 text-sm font-medium bg-[#155DFC] text-white hover:bg-[#155DFC]/90 disabled:opacity-60"
                    >
                      Upgrade
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runAction(selected.id, "downgrade", {
                          newPlan: (newPlan || selected.plan) as string,
                        })
                      }
                      disabled={actionLoading}
                      className="rounded-lg px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200 disabled:opacity-60"
                    >
                      Downgrade
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Override session limit (number or leave empty for unlimited)
                  </label>
                  <input
                    type="text"
                    value={overrideLimit}
                    onChange={(e) => setOverrideLimit(e.target.value)}
                    placeholder="e.g. 100 or empty"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        runAction(selected.id, "override_session_limit", {
                          sessionLimit:
                            overrideLimit === "" ? null : parseInt(overrideLimit, 10),
                        })
                      }
                      disabled={actionLoading}
                      className="rounded-lg px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200 disabled:opacity-60"
                    >
                      Set limit
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction(selected.id, "grant_unlimited_sessions", {})}
                      disabled={actionLoading}
                      className="rounded-lg px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200 disabled:opacity-60"
                    >
                      Grant unlimited
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => runAction(selected.id, "reset_usage", {})}
                  disabled={actionLoading}
                  className="w-full rounded-lg px-3 py-2 text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 disabled:opacity-60"
                >
                  Reset usage
                </button>
                <button
                  type="button"
                  onClick={() => runAction(selected.id, "suspend", {})}
                  disabled={actionLoading}
                  className="w-full rounded-lg px-3 py-2 text-sm font-medium bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 disabled:opacity-60"
                >
                  Suspend workspace
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
