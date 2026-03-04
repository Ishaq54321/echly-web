"use client";

import React, { useState } from "react";
import { ChevronRight, LayoutGrid, AlertTriangle, Link2, User, BarChart3, History } from "lucide-react";

const COLUMN_WIDTH = 280;

export interface ContextIntelligenceColumnProps {
  /** Whether the column is collapsed */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Related ticket IDs for "Related tickets" */
  relatedTicketIds?: string[];
  hasSession?: boolean;
}

export function ContextIntelligenceColumn({
  collapsed = false,
  onCollapsedChange,
  relatedTicketIds = [],
  hasSession = true,
}: ContextIntelligenceColumnProps) {
  const [isCollapsed, setCollapsed] = useState(collapsed);

  const handleToggle = () => {
    const next = !isCollapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  };

  if (isCollapsed) {
    return (
      <aside
        className="shrink-0 flex flex-col items-center bg-[var(--structural-gray-ticket)] border-l border-[var(--layer-1-border)] min-h-0 py-4"
        style={{ width: 48 }}
        aria-label="Context intelligence (collapsed)"
      >
        <button
          type="button"
          onClick={handleToggle}
          className="flex flex-col items-center gap-1 p-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:bg-black/[0.04] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-120 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)]"
          aria-label="Expand context panel"
        >
          <LayoutGrid className="h-5 w-5" strokeWidth={1.5} />
          <ChevronRight className="h-4 w-4 rotate-180" strokeWidth={1.5} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="shrink-0 flex flex-col bg-[var(--structural-gray-ticket)] border-l border-[var(--layer-1-border)] min-h-0"
      style={{ width: COLUMN_WIDTH }}
      aria-label="Context intelligence"
    >
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--layer-1-border)]">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
          Context
        </h2>
        <button
          type="button"
          onClick={handleToggle}
          className="p-1 rounded text-[hsl(var(--text-tertiary))] hover:bg-black/[0.04] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-120 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)]"
          aria-label="Collapse context panel"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-6">
        {/* Related patterns — contextual, no branding */}
        <section>
          <h3 className="text-[12px] font-medium text-[hsl(var(--text-primary-strong))] mb-2">
            Related patterns
          </h3>
          <ul className="space-y-1.5 text-[12px] text-[hsl(var(--text-secondary-soft))]">
            <li className="pl-3 border-l-2 border-[var(--layer-2-border)]">
              Similar items often resolved by adding a repro step.
            </li>
            <li className="pl-3 border-l-2 border-transparent">
              Tag for routing when applicable.
            </li>
          </ul>
        </section>

        {/* Risk signals */}
        <section>
          <h3 className="flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--text-primary-strong))] mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />
            Risk signals
          </h3>
          <p className="text-[12px] text-[hsl(var(--text-tertiary))]">
            No blockers detected.
          </p>
        </section>

        {/* Related tickets */}
        <section>
          <h3 className="flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--text-primary-strong))] mb-2">
            <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Related tickets
          </h3>
          {relatedTicketIds.length > 0 ? (
            <ul className="space-y-1 text-[12px] text-[hsl(var(--text-secondary-soft))]">
              {relatedTicketIds.slice(0, 5).map((id) => (
                <li key={id} className="truncate">
                  {id}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-[hsl(var(--text-tertiary))]">None linked.</p>
          )}
        </section>

        {/* Ownership */}
        <section>
          <h3 className="flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--text-primary-strong))] mb-2">
            <User className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ownership
          </h3>
          <p className="text-[12px] text-[hsl(var(--text-tertiary))]">Unassigned</p>
        </section>

        {/* Workload impact */}
        <section>
          <h3 className="flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--text-primary-strong))] mb-2">
            <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Workload impact
          </h3>
          <p className="text-[12px] text-[hsl(var(--text-tertiary))]">Low — 1 of 12 open this week.</p>
        </section>

        {/* Resolution history */}
        <section>
          <h3 className="flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--text-primary-strong))] mb-2">
            <History className="h-3.5 w-3.5" strokeWidth={1.5} />
            Resolution history
          </h3>
          <p className="text-[12px] text-[hsl(var(--text-tertiary))]">No prior resolutions.</p>
        </section>
      </div>
    </aside>
  );
}
