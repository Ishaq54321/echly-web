"use client";

import { ListChecks, FileText, MessageSquare } from "lucide-react";

export type SessionMobileTabId = "captures" | "session" | "activity";

interface SessionMobileTabsProps {
  active: SessionMobileTabId;
  onChange: (tab: SessionMobileTabId) => void;
  /** Hide the Activity tab when the viewer has no access to comments/activity. */
  showActivity?: boolean;
}

/**
 * Bottom tab bar shown only below md: that swaps between the three primary
 * panes of the session detail screen: Captures (ticket list), Session (main
 * canvas), and Activity (timeline / comments side panel).
 *
 * The actual pane content is rendered by SessionPageClient — this component
 * is purely the tab affordance.
 */
export function SessionMobileTabs({
  active,
  onChange,
  showActivity = true,
}: SessionMobileTabsProps) {
  const tabs: { id: SessionMobileTabId; label: string; icon: React.ReactNode }[] = [
    { id: "captures", label: "Captures", icon: <ListChecks className="h-[18px] w-[18px]" strokeWidth={1.75} /> },
    { id: "session", label: "Session", icon: <FileText className="h-[18px] w-[18px]" strokeWidth={1.75} /> },
  ];
  if (showActivity) {
    tabs.push({
      id: "activity",
      label: "Activity",
      icon: <MessageSquare className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    });
  }

  return (
    <nav
      role="tablist"
      aria-label="Session navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t border-[var(--layer-2-border)] bg-[var(--surface)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
              isActive
                ? "text-[var(--text-primary-strong)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary-soft)]"
            }`}
          >
            <span
              className={`inline-flex items-center justify-center ${
                isActive ? "text-[var(--brand)]" : ""
              }`}
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default SessionMobileTabs;
