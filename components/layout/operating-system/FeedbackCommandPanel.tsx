"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Filter,
  Save,
  CheckSquare,
  Square,
  MoreHorizontal,
} from "lucide-react";
import {
  statusFromResolved,
  defaultPriority,
  type FeedbackStatus,
  type FeedbackPriority,
} from "@/lib/domain/feedback-display";

export interface CommandPanelItem {
  id: string;
  title: string;
  isResolved?: boolean;
  suggestedTags?: string[] | null;
  contextSummary?: string | null;
  createdAt?: { seconds: number } | null;
  clientTimestamp?: number | null;
  updatedAt?: string | null;
}

export interface FeedbackCommandPanelProps {
  items: CommandPanelItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** For keyboard nav: ref to attach to list container */
  listRef?: React.RefObject<HTMLDivElement | null>;
  loadingMore?: boolean;
  hasMore?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  onMarkAllResolved?: () => Promise<void>;
}

const STATUS_OPTIONS: FeedbackStatus[] = ["Open", "In Progress", "Blocked", "Resolved"];
const PRIORITY_OPTIONS: FeedbackPriority[] = ["Low", "Medium", "High", "Critical"];

function StatusDot({ status }: { status: FeedbackStatus }) {
  const colors: Record<FeedbackStatus, string> = {
    Open: "bg-amber-400",
    "In Progress": "bg-[var(--accent-operational)]",
    Blocked: "bg-red-500",
    Resolved: "bg-emerald-500",
  };
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${colors[status]}`}
      title={status}
      aria-hidden
    />
  );
}

function PriorityBadge({ priority }: { priority: FeedbackPriority }) {
  const styles: Record<FeedbackPriority, string> = {
    Low: "text-[10px] text-[hsl(var(--text-tertiary))]",
    Medium: "text-[10px] text-[hsl(var(--text-secondary-soft))]",
    High: "text-[10px] font-medium text-amber-700",
    Critical: "text-[10px] font-medium text-red-600",
  };
  return (
    <span className={`shrink-0 uppercase tracking-wide ${styles[priority]}`}>
      {priority.slice(0, 1)}
    </span>
  );
}

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

const PANEL_WIDTH = 320;

export function FeedbackCommandPanel({
  items,
  selectedId,
  onSelect,
  listRef,
  loadingMore,
  hasMore,
  loadMoreRef,
  onMarkAllResolved,
}: FeedbackCommandPanelProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<FeedbackPriority | "">("");
  const [sortBy, setSortBy] = useState<"updated" | "priority">("updated");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let list = items.filter((item) => {
      const status = statusFromResolved(item.isResolved);
      const priority = defaultPriority();
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!item.title.toLowerCase().includes(q)) return false;
      }
      if (statusFilter && status !== statusFilter) return false;
      if (priorityFilter && priority !== priorityFilter) return false;
      return true;
    });
    const getTime = (i: CommandPanelItem) =>
      i.createdAt?.seconds != null ? i.createdAt.seconds * 1000 : (i.clientTimestamp ?? 0);
    if (sortBy === "updated") {
      list = [...list].sort((a, b) => getTime(b) - getTime(a));
    }
    return list;
  }, [items, search, statusFilter, priorityFilter, sortBy]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current?.contains(e.target as Node)) return;
      if (sortRef.current?.contains(e.target as Node)) return;
      setFilterDropdownOpen(false);
      setSortDropdownOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.id)));
    }
  };

  const bulkCount = selectedIds.size;

  return (
    <aside
      className="shrink-0 flex flex-col bg-[var(--structural-gray-ticket)] border-r border-[var(--layer-1-border)] min-h-0"
      style={{ width: PANEL_WIDTH }}
      aria-label="Feedback issue queue"
    >
      {/* Filter bar */}
      <div className="shrink-0 p-2 border-b border-[var(--layer-1-border)] space-y-2">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--text-tertiary))]"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search issues…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-[13px] rounded-md bg-white border border-[var(--layer-2-border)] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-1 focus:ring-[var(--accent-operational)] transition-[box-shadow] duration-120"
            aria-label="Search issues"
          />
        </div>
        <div className="flex items-center gap-1">
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 h-7 px-2 rounded-md text-[12px] text-[hsl(var(--text-secondary-soft))] hover:bg-black/[0.04] border border-[var(--layer-2-border)]"
              aria-expanded={filterDropdownOpen}
              aria-haspopup="true"
            >
              <Filter className="h-3 w-3" strokeWidth={1.5} />
              Status
            </button>
            {filterDropdownOpen && (
              <div
                className="absolute left-0 top-full mt-1 w-40 py-1 rounded-md bg-white border border-[var(--layer-2-border)] shadow-[var(--elevation-2)] z-10"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--layer-2-hover-bg)]"
                  onClick={() => {
                    setStatusFilter("");
                    setFilterDropdownOpen(false);
                  }}
                >
                  All statuses
                </button>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--layer-2-hover-bg)]"
                    onClick={() => {
                      setStatusFilter(s);
                      setFilterDropdownOpen(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen((o) => !o)}
              className="flex items-center gap-1 h-7 px-2 rounded-md text-[12px] text-[hsl(var(--text-secondary-soft))] hover:bg-black/[0.04] border border-[var(--layer-2-border)]"
              aria-expanded={sortDropdownOpen}
            >
              Sort
              <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
            </button>
            {sortDropdownOpen && (
              <div
                className="absolute left-0 top-full mt-1 w-36 py-1 rounded-md bg-white border border-[var(--layer-2-border)] shadow-[var(--elevation-2)] z-10"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--layer-2-hover-bg)]"
                  onClick={() => {
                    setSortBy("updated");
                    setSortDropdownOpen(false);
                  }}
                >
                  Last updated
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--layer-2-hover-bg)]"
                  onClick={() => {
                    setSortBy("priority");
                    setSortDropdownOpen(false);
                  }}
                >
                  Priority
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className="ml-auto flex items-center gap-1 h-7 px-2 rounded-md text-[12px] text-[hsl(var(--text-tertiary))] hover:bg-black/[0.04]"
            title="Save view"
          >
            <Save className="h-3 w-3" strokeWidth={1.5} />
            Save View
          </button>
        </div>
      </div>

      {/* Bulk action toolbar */}
      {bulkCount > 0 && (
        <div className="shrink-0 flex items-center gap-2 px-2 py-1.5 border-b border-[var(--layer-1-border)] bg-[var(--accent-operational-muted)]">
          <span className="text-[12px] font-medium text-[hsl(var(--text-primary-strong))]">
            {bulkCount} selected
          </span>
          <button
            type="button"
            className="text-[12px] text-[var(--accent-operational)] hover:underline"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </button>
          {onMarkAllResolved && (
            <button
              type="button"
              className="text-[12px] text-[var(--accent-operational)] hover:underline"
              onClick={() => onMarkAllResolved()}
            >
              Mark resolved
            </button>
          )}
        </div>
      )}

      {/* Issue list */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto focus:outline-none"
        tabIndex={0}
        role="listbox"
        aria-label="Feedback issues"
      >
        <div className="py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] text-[hsl(var(--text-tertiary))]">
              No issues match filters.
            </div>
          ) : (
            filtered.map((item, index) => {
              const status = statusFromResolved(item.isResolved);
              const priority = defaultPriority();
              const isSelected = item.id === selectedId;
              const isChecked = selectedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelect(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(item.id);
                    }
                    if (e.key === "ArrowDown" && index < filtered.length - 1) {
                      e.preventDefault();
                      (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
                    }
                    if (e.key === "ArrowUp" && index > 0) {
                      e.preventDefault();
                      (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
                    }
                  }}
                  tabIndex={isSelected ? 0 : -1}
                  className={`group flex items-start gap-2 px-2 py-2 cursor-pointer border-l-2 transition-colors duration-120 ${
                    isSelected
                      ? "border-l-[var(--accent-operational)] bg-white shadow-[var(--elevation-1)]"
                      : "border-l-transparent hover:bg-black/[0.02]"
                  }`}
                >
                  <button
                    type="button"
                    className="shrink-0 mt-0.5 p-0.5 rounded text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))] hover:bg-black/[0.04] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
                    }}
                    aria-label={isChecked ? "Deselect" : "Select"}
                  >
                    {isChecked ? (
                      <CheckSquare className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Square className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                  <StatusDot status={status} />
                  <PriorityBadge priority={priority} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-[hsl(var(--text-primary-strong))] truncate leading-tight">
                      {item.title}
                    </div>
                    {item.contextSummary && (
                      <div className="text-[11px] text-[hsl(var(--text-tertiary))] truncate mt-0.5 leading-tight">
                        {item.contextSummary}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {(item.suggestedTags ?? []).slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[var(--layer-2-bg)] text-[hsl(var(--text-tertiary))]"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))] tabular-nums">
                        {formatRelative(item.createdAt, item.clientTimestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {loadMoreRef && <div ref={loadMoreRef} />}
        {loadingMore && (
          <div className="px-3 py-2 text-center text-[12px] text-[hsl(var(--text-tertiary))]">
            Loading…
          </div>
        )}
      </div>
    </aside>
  );
}
