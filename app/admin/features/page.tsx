"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import type { FeatureFlagWithId } from "@/app/api/admin/feature-flags/route";

export default function AdminFeaturesPage() {
  const [flags, setFlags] = useState<FeatureFlagWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newFlagName, setNewFlagName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/feature-flags");
      if (!res.ok) throw new Error("Failed to load flags");
      const data = await res.json();
      setFlags(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setGlobal = async (id: string, enabled: boolean) => {
    setSavingId(id);
    try {
      const res = await authFetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabledGlobally: enabled }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingId(null);
    }
  };

  const addFlag = async () => {
    const name = newFlagName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!name) return;
    setSavingId("new");
    try {
      const res = await authFetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: name,
          name: newFlagName.trim(),
          enabledGlobally: false,
          enabledForWorkspaces: [],
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      setNewFlagName("");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-8">Feature Flags</h1>
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Feature Flags</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Toggle flags globally or per workspace (Firestore <code className="bg-neutral-100 px-1 rounded text-xs">featureFlags</code>).
      </p>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newFlagName}
          onChange={(e) => setNewFlagName(e.target.value)}
          placeholder="New flag name"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm w-48"
        />
        <button
          type="button"
          onClick={addFlag}
          disabled={savingId === "new" || !newFlagName.trim()}
          className="rounded-lg px-4 py-2 text-sm font-medium bg-[#155DFC] text-white hover:bg-[#155DFC]/90 disabled:opacity-60"
        >
          {savingId === "new" ? "Adding…" : "Add flag"}
        </button>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-4 py-3 font-semibold text-neutral-900">Flag</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Enabled globally</th>
              <th className="px-4 py-3 font-semibold text-neutral-900">Enabled for workspaces</th>
            </tr>
          </thead>
          <tbody>
            {flags.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-500">
                  No feature flags. Add one above.
                </td>
              </tr>
            ) : (
              flags.map((flag) => (
                <tr key={flag.id} className="border-b border-neutral-100">
                  <td className="px-4 py-2.5 font-medium text-neutral-900">{flag.name || flag.id}</td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setGlobal(flag.id, !flag.enabledGlobally)}
                      disabled={savingId === flag.id}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        flag.enabledGlobally
                          ? "bg-[#155DFC] text-white hover:bg-[#155DFC]/90"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      } disabled:opacity-60`}
                    >
                      {savingId === flag.id ? "…" : flag.enabledGlobally ? "On" : "Off"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {Array.isArray(flag.enabledForWorkspaces) && flag.enabledForWorkspaces.length > 0
                      ? `${flag.enabledForWorkspaces.length} workspace(s)`
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
