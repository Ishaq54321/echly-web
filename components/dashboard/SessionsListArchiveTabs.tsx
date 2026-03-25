"use client";

import type { ReactNode } from "react";

export type SessionsListArchiveTab = "sessions" | "archived";

const TABS: { id: SessionsListArchiveTab; label: string }[] = [
  { id: "sessions", label: "Sessions" },
  { id: "archived", label: "Archived" },
];

/** Matches Settings page tab nav: text-sm, blue + underline when active. */
export function SessionsListArchiveTabs({
  value,
  onChange,
  actions,
}: {
  value: SessionsListArchiveTab;
  onChange: (next: SessionsListArchiveTab) => void;
  /** When set, tabs and actions share one row (tabs left, actions right). */
  actions?: ReactNode;
}) {
  const tabButtons = TABS.map(({ id, label }) => {
    const isActive = value === id;
    return (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => onChange(id)}
        className={`
              relative border-0 bg-transparent p-0 pb-3 text-[16px] transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]/30 focus-visible:ring-offset-2 rounded-sm
              ${isActive ? "z-10 font-semibold text-[#155DFC]" : "font-medium text-neutral-500 hover:text-neutral-800"}
            `}
      >
        {label}
        {isActive ? (
          <span
            className="absolute -bottom-px left-0 right-0 z-10 h-[3px] rounded-full bg-[#155DFC]"
            aria-hidden
          />
        ) : null}
      </button>
    );
  });

  if (actions != null) {
    return (
      <div className="mb-6 w-full min-w-0">
        <div className="relative flex w-full min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-[#E6EAF0]">
          <nav
            className="flex min-w-0 items-center gap-10"
            role="tablist"
            aria-label="Sessions and archived"
          >
            {tabButtons}
          </nav>
          <div className="flex shrink-0 items-center gap-3 pb-3">{actions}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 w-full">
      <nav
        className="relative flex w-full items-center gap-10 border-b border-[#E6EAF0]"
        role="tablist"
        aria-label="Sessions and archived"
      >
        {tabButtons}
      </nav>
    </div>
  );
}
