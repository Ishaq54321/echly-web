"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface SessionsHeaderProps {
  activeTab: "all" | "archived";
  onTabChange: (tab: "all" | "archived") => void;
  sessionCount: number;
  onNewFolder: () => void;
  onNewSession: () => void;
  isCreating?: boolean;
}

export function SessionsHeader({
  activeTab,
  onTabChange,
  sessionCount,
  onNewFolder,
  onNewSession,
  isCreating = false,
}: SessionsHeaderProps) {
  return (
    <div>
      {/* Title + Actions */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-secondary font-medium">Library</div>
          <h1 className="text-4xl font-semibold">Sessions</h1>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onNewFolder}
            className="border border-neutral-300 rounded-full px-5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 transition"
          >
            New Folder
          </button>

          <Button
            variant="primary"
            type="button"
            onClick={onNewSession}
            disabled={isCreating}
            aria-busy={isCreating}
            className="rounded-full px-5 py-2 text-sm font-semibold"
          >
            {isCreating ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </span>
            ) : (
              "New Session"
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex items-end justify-between">
          <div className="flex gap-6">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "all"}
              onClick={() => onTabChange("all")}
              className={`relative pb-3 text-sm font-semibold ${
                activeTab === "all" ? "text-neutral-900" : "text-secondary"
              }`}
            >
              Sessions
              {activeTab === "all" && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[3px] bg-[#155DFC] rounded-full" />
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "archived"}
              onClick={() => onTabChange("archived")}
              className={`relative pb-3 text-sm font-semibold ${
                activeTab === "archived"
                  ? "text-neutral-900"
                  : "text-secondary"
              }`}
            >
              Archived
              {activeTab === "archived" && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[3px] bg-[#155DFC] rounded-full" />
              )}
            </button>
          </div>

          {/* Session Count — aligned with tabs */}
          <div className="text-sm text-meta">
            {sessionCount} sessions
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-neutral-200"></div>
      </div>
    </div>
  );
}