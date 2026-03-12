"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { CheckSquare, Square } from "lucide-react";
import type { Signal, SignalStatus } from "@/lib/domain/signal";

export type SignalStreamSortBy = "impact" | "risk" | "velocity" | "recency";

export interface SignalStreamProps {
  signals: Signal[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  listRef?: React.RefObject<HTMLDivElement | null>;
  loadingMore?: boolean;
  hasMore?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  onBulkResolve?: () => Promise<void>;
}

const PANEL_WIDTH = 300;

function formatRelative(createdAt: { seconds: number } | null | undefined, clientTs?: number | null): string {
  const ms = createdAt?.seconds != null ? createdAt.seconds * 1000 : (clientTs ?? 0);
  if (!ms) return "—";
  const d = new Date(ms);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SignalStream({
  signals,
  selectedId,
  onSelect,
  listRef,
  loadingMore,
  hasMore,
  loadMoreRef,
  onBulkResolve,
}: SignalStreamProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SignalStatus | "">("");
  const [sortBy, setSortBy] = useState<SignalStreamSortBy>("impact");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = signals.filter((s) => {
      if (search.trim() && !s.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      return true;
    });
    const getTime = (s: Signal) =>
      s.createdAt?.seconds != null ? s.createdAt.seconds * 1000 : (s.clientTimestamp ?? 0);
    if (sortBy === "recency") list = [...list].sort((a, b) => getTime(b) - getTime(a));
    if (sortBy === "impact") list = [...list].sort((a, b) => b.impactScore - a.impactScore);
    if (sortBy === "risk") {
      const ra = (s: Signal) => (s.urgency === "critical" ? 4 : s.urgency === "high" ? 3 : s.urgency === "medium" ? 2 : 1);
      list = [...list].sort((a, b) => ra(b) - ra(a));
    }
    if (sortBy === "velocity") {
      const v = { fast: 3, normal: 2, slow: 1 };
      list = [...list].sort((a, b) => (v[b.resolutionVelocity ?? "normal"] ?? 0) - (v[a.resolutionVelocity ?? "normal"] ?? 0));
    }
    return list;
  }, [signals, search, statusFilter, sortBy]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "s" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setSelectionMode((m) => !m);
        if (selectionMode) setSelectedIds(new Set());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectionMode]);

  const bulkCount = selectedIds.size;

  return (
    <aside
      className="shrink-0 flex flex-col bg-[var(--structural-gray-ticket)] border-r border-[var(--layer-2-border)] min-h-0"
      style={{ width: PANEL_WIDTH }}
      aria-label="Signals"
    >
      <div className="shrink-0 px-3 pt-3 pb-2 space-y-2">
        <input
          type="search"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-8 px-3 text-[13px] rounded-md bg-white border border-[var(--layer-2-border)] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-1 focus:ring-gray-300"
          aria-label="Search"
        />
        <div className="flex items-center justify-between gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter((e.target.value || "") as SignalStatus | "")}
            className="h-7 px-2 text-[12px] text-[hsl(var(--text-secondary-soft))] bg-transparent border-0 rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
            aria-label="Status filter"
          >
            <option value="">All</option>
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SignalStreamSortBy)}
            className="h-7 px-2 text-[12px] text-[hsl(var(--text-secondary-soft))] bg-transparent border-0 rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
            aria-label="Sort by"
          >
            <option value="impact">Impact</option>
            <option value="risk">Risk</option>
            <option value="velocity">Velocity</option>
            <option value="recency">Recency</option>
          </select>
          <button
            type="button"
            onClick={() => { setSelectionMode((m) => !m); if (selectionMode) setSelectedIds(new Set()); }}
            className={`text-[12px] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))] ${selectionMode ? "text-[var(--accent-operational)]" : ""}`}
          >
            {selectionMode ? "Done" : "Select"}
          </button>
        </div>
      </div>

      {selectionMode && bulkCount > 0 && (
        <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-t border-[var(--layer-2-border)] bg-white/80">
          <span className="text-[12px] text-[hsl(var(--text-secondary-soft))]">{bulkCount} selected</span>
          <button type="button" className="text-[12px] text-[var(--accent-operational)] hover:underline" onClick={() => setSelectedIds(new Set())}>Clear</button>
          {onBulkResolve && <button type="button" className="text-[12px] text-[var(--accent-operational)] hover:underline" onClick={() => onBulkResolve()}>Resolve</button>}
        </div>
      )}

      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto focus:outline-none" tabIndex={0} role="listbox" aria-label="Signals">
        <div className="py-1 px-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[hsl(var(--text-tertiary))]">No signals</p>
          ) : (
            filtered.map((s) => {
              const isSelected = s.id === selectedId;
              const isChecked = selectedIds.has(s.id);
              const isUnread = !s.isResolved;
              return (
                <div
                  key={s.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => (selectionMode ? setSelectedIds((prev) => { const n = new Set(prev); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; }) : onSelect(s.id))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectionMode ? setSelectedIds((prev) => { const n = new Set(prev); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; }) : onSelect(s.id); }
                    if (e.key === "ArrowDown") (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
                    if (e.key === "ArrowUp") (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
                  }}
                  tabIndex={isSelected ? 0 : -1}
                  className={`group flex items-start gap-2 py-2.5 px-2 rounded-md cursor-pointer transition-colors duration-120 ${
                    isSelected ? "bg-white" : "hover:bg-black/[0.02]"
                  } ${selectionMode ? "pl-2" : ""}`}
                >
                  {selectionMode ? (
                    <button
                      type="button"
                      className="shrink-0 mt-0.5 p-0.5 rounded"
                      onClick={(e) => { e.stopPropagation(); setSelectedIds((prev) => { const n = new Set(prev); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; }); }}
                      aria-label={isChecked ? "Deselect" : "Select"}
                    >
                      {isChecked ? <CheckSquare className="h-4 w-4 text-[var(--accent-operational)]" strokeWidth={1.5} /> : <Square className="h-4 w-4 text-[hsl(var(--text-tertiary))]" strokeWidth={1.5} />}
                    </button>
                  ) : (
                    <span className="shrink-0 w-2 flex items-center justify-center mt-1.5" aria-hidden>
                      {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90" />}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className={`text-[13px] truncate leading-tight ${isUnread ? "font-semibold text-[hsl(var(--text-primary-strong))]" : "font-medium text-[hsl(var(--text-primary-strong))]"}`}>{s.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[hsl(var(--text-tertiary))] flex-wrap">
                      <span className="tabular-nums">{s.impactScore}</span>
                      <span className="truncate">{s.status}</span>
                      {s.ownerName && <span className="truncate">{s.ownerName}</span>}
                      <span className="tabular-nums shrink-0">{formatRelative(s.createdAt, s.clientTimestamp)}</span>
                    </div>
                    {/* Cluster only on hover */}
                    <div className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-120 text-[10px] text-[hsl(var(--text-tertiary))]">
                      {s.clusterLabel && <span>{s.clusterLabel}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {loadMoreRef && <div ref={loadMoreRef} />}
        {loadingMore && <p className="px-3 py-2 text-center text-[12px] text-[hsl(var(--text-tertiary))]">Loading…</p>}
      </div>
    </aside>
  );
}
