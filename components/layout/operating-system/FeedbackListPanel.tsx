"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { CheckSquare, Square, ChevronDown, ChevronRight, Check } from "lucide-react";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";

export interface FeedbackListPanelProps {
  items: Feedback[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  selectionMode?: boolean;
  onSelectionModeChange?: (on: boolean) => void;
  selectedIds?: Set<string>;
  onSelectedIdsChange?: (ids: Set<string>) => void;
  onBulkResolve?: () => Promise<void>;
  /** When true, list fades slightly so detail is visually dominant */
  dimmed?: boolean;
  listRef?: React.RefObject<HTMLDivElement | null>;
}

export function FeedbackListPanel({
  items,
  selectedId,
  onSelect,
  selectionMode = false,
  onSelectionModeChange,
  selectedIds = new Set(),
  onSelectedIdsChange,
  onBulkResolve,
  dimmed = false,
  listRef,
}: FeedbackListPanelProps) {
  const [openExpanded, setOpenExpanded] = useState(true);
  const [skippedExpanded, setSkippedExpanded] = useState(false);
  const [resolvedExpanded, setResolvedExpanded] = useState(false);

  const openItems = useMemo(() => items.filter((i) => getTicketStatus(i) === "open"), [items]);
  const skippedItems = useMemo(() => items.filter((i) => getTicketStatus(i) === "skipped"), [items]);
  const resolvedItems = useMemo(() => items.filter((i) => getTicketStatus(i) === "resolved"), [items]);

  const flatOrdered = useMemo(
    () => [...openItems, ...skippedItems, ...resolvedItems],
    [openItems, skippedItems, resolvedItems]
  );
  const selectedIndex = flatOrdered.findIndex((i) => i.id === selectedId);
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const focusable = Array.from(el.querySelectorAll<HTMLElement>("[data-ticket-row]"));
      const current = focusable.findIndex((node) => node === document.activeElement);
      if (e.key === "ArrowDown" && current < focusable.length - 1) {
        e.preventDefault();
        focusable[current + 1]?.focus();
      }
      if (e.key === "ArrowUp" && current > 0) {
        e.preventDefault();
        focusable[current - 1]?.focus();
      }
      if (e.key === "Enter" && current >= 0 && focusable[current]) {
        e.preventDefault();
        const id = focusable[current].getAttribute("data-ticket-id");
        if (id) onSelect(id);
      }
    };
    el.addEventListener("keydown", handleKey);
    return () => el.removeEventListener("keydown", handleKey);
  }, [onSelect, flatOrdered.length]);

  const bulkCount = selectedIds.size;

  const renderRow = (item: Feedback) => {
    const isSelected = item.id === selectedId;
    const isUnread = getTicketStatus(item) === "open" || getTicketStatus(item) === "skipped";
    const isChecked = selectedIds.has(item.id);
    return (
      <div
        key={item.id}
        role="button"
        tabIndex={isSelected ? 0 : -1}
        data-ticket-row
        data-ticket-id={item.id}
        onClick={() => {
          if (selectionMode && onSelectedIdsChange) {
            const next = new Set(selectedIds);
            if (next.has(item.id)) next.delete(item.id);
            else next.add(item.id);
            onSelectedIdsChange(next);
          } else {
            onSelect(item.id);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (selectionMode && onSelectedIdsChange) {
              const next = new Set(selectedIds);
              if (next.has(item.id)) next.delete(item.id);
              else next.add(item.id);
              onSelectedIdsChange(next);
            } else {
              onSelect(item.id);
            }
          }
        }}
        className={`ticket-item flex items-stretch gap-3 px-4 cursor-pointer transition-all ${
          isSelected ? "bg-[var(--accent-operational)]/10" : "hover:bg-black/[0.03]"
        }`}
        data-selected={isSelected}
      >
        <div className="ticket-rail" aria-hidden />
        {selectionMode && onSelectionModeChange ? (
          <button
            type="button"
            className="shrink-0 p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              if (!onSelectedIdsChange) return;
              const next = new Set(selectedIds);
              if (next.has(item.id)) next.delete(item.id);
              else next.add(item.id);
              onSelectedIdsChange(next);
            }}
            aria-label={isChecked ? "Deselect" : "Select"}
          >
            {isChecked ? <CheckSquare className="h-4 w-4 text-[var(--accent-operational)]" strokeWidth={1.5} /> : <Square className="h-4 w-4 text-[hsl(var(--text-tertiary))]" strokeWidth={1.5} />}
          </button>
        ) : (
          <span className="shrink-0 w-5 flex items-center justify-center" aria-hidden>
            {isUnread ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90" />
            ) : (
              <Check className="h-3.5 w-3.5 text-[hsl(var(--text-tertiary))]" strokeWidth={2} />
            )}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className={`text-[13px] truncate ${isUnread ? "font-semibold" : "font-normal"} text-[hsl(var(--text-primary-strong))]`}>
            {item.title || "Untitled"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={listRef}
      className={`flex-1 min-w-0 flex flex-col bg-white border-r border-[var(--layer-2-border)] min-h-0 transition-opacity duration-150 ${dimmed ? "opacity-85" : "opacity-100"}`}
      aria-label="Feedback"
    >
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-b border-[var(--layer-2-border)]">
        {onSelectionModeChange && (
          <button
            type="button"
            onClick={() => onSelectionModeChange(!selectionMode)}
            className={`text-[12px] ${selectionMode ? "text-[var(--accent-operational)]" : "text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))]"}`}
          >
            {selectionMode ? "Done" : "Select"}
          </button>
        )}
      </div>

      {selectionMode && bulkCount > 0 && onSelectedIdsChange && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-[var(--layer-2-border)] bg-[var(--structural-gray-ticket)]">
          <span className="text-[12px] text-[hsl(var(--text-tertiary))]">{bulkCount} selected</span>
          <button type="button" className="text-[12px] text-[var(--accent-operational)] hover:underline" onClick={() => onSelectedIdsChange(new Set())}>Clear</button>
          {onBulkResolve && <button type="button" className="text-[12px] text-[var(--accent-operational)] hover:underline" onClick={() => onBulkResolve()}>Resolve</button>}
        </div>
      )}

      <div ref={listContainerRef} className="flex-1 min-h-0 overflow-y-auto" tabIndex={-1}>
        {items.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[hsl(var(--text-tertiary))]">No items</p>
        ) : (
          <div className="py-1">
            <button
              type="button"
              onClick={() => setOpenExpanded((x) => !x)}
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] hover:bg-black/[0.02]"
            >
              {openExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              Open ({openItems.length})
            </button>
            {openExpanded && openItems.map((item) => renderRow(item))}

            {skippedItems.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setSkippedExpanded((x) => !x)}
                  className="flex items-center gap-2 w-full px-4 py-2 mt-1 text-left text-[11px] font-medium uppercase tracking-wider text-amber-800/90 hover:bg-amber-50/50"
                >
                  {skippedExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  Skipped ({skippedItems.length})
                </button>
                {skippedExpanded && skippedItems.map((item) => renderRow(item))}
              </>
            )}

            <button
              type="button"
              onClick={() => setResolvedExpanded((x) => !x)}
              className="flex items-center gap-2 w-full px-4 py-2 mt-1 text-left text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] hover:bg-black/[0.02]"
            >
              {resolvedExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              Resolved ({resolvedItems.length})
            </button>
            {resolvedExpanded && resolvedItems.map((item) => renderRow(item))}
          </div>
        )}
      </div>
    </div>
  );
}
