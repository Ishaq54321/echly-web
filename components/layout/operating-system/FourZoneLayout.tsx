"use client";

import React from "react";

export interface FourZoneLayoutProps {
  /** Zone 1: System Navigation Rail (far left). Omit when rail is rendered by app layout. */
  navigationRail?: React.ReactNode | null;
  /** Zone 2: Feedback Command Panel (issue queue) — optional for dashboard */
  commandPanel?: React.ReactNode;
  /** Zone 3: Execution Canvas (main working area) */
  children: React.ReactNode;
  /** Zone 4: Context Intelligence Column — optional, collapsible */
  contextColumn?: React.ReactNode;
  /** Show command panel (session view) vs hide (dashboard) */
  showCommandPanel?: boolean;
  /** Show context column */
  showContextColumn?: boolean;
}

/**
 * 4-Zone Architecture: Rail | Command Panel | Canvas | Context Column.
 * Operational, Linear-style layout. No chat, no floating panels.
 */
export function FourZoneLayout({
  navigationRail,
  commandPanel,
  children,
  contextColumn,
  showCommandPanel = false,
  showContextColumn = true,
}: FourZoneLayoutProps) {
  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden bg-[var(--canvas-base)]">
      {/* Zone 1: System Navigation Rail (optional when provided by app layout) */}
      {navigationRail != null && navigationRail}

      {/* Zone 2: Feedback Command Panel (issue queue) */}
      {showCommandPanel && commandPanel}

      {/* Zone 3: Execution Canvas */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
        {children}
      </div>

      {/* Zone 4: Context Intelligence Column */}
      {showContextColumn && contextColumn}
    </div>
  );
}
