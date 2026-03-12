"use client";

export interface SessionsHeaderProps {
  activeTab: "all" | "archived";
  onTabChange: (tab: "all" | "archived") => void;
  sessionCount: number;
  onNewFolder: () => void;
  onNewSession: () => void;
}

export function SessionsHeader({
  activeTab,
  onTabChange,
  sessionCount,
  onNewFolder,
  onNewSession,
}: SessionsHeaderProps) {
  return (
    <div>
      {/* Title + Actions */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-meta text-[#111111] font-medium">Library</div>
          <h1 className="text-h1 font-semibold text-[#111111]">Sessions</h1>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onNewFolder}
            className="border border-[#E3E6E5] rounded-full px-5 py-2 text-meta font-medium text-[#111111] hover:bg-[#E9ECEB] transition-colors"
          >
            New Folder
          </button>

          <button
            type="button"
            onClick={onNewSession}
            className="primary-cta rounded-full px-5 py-2 text-meta transition-colors"
          >
            New Session
          </button>
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
              className={`relative pb-3 text-meta font-semibold transition-colors ${
                activeTab === "all"
                  ? "text-[#111111] font-semibold"
                  : "text-[#6B7280] hover:text-[#4B5563]"
              }`}
            >
              Sessions
              {activeTab === "all" && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[3px] bg-[#D1D5DB] rounded-full" />
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "archived"}
              onClick={() => onTabChange("archived")}
              className={`relative pb-3 text-meta font-semibold transition-colors ${
                activeTab === "archived"
                  ? "text-[#111111] font-semibold"
                  : "text-[#6B7280] hover:text-[#4B5563]"
              }`}
            >
              Archived
              {activeTab === "archived" && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[3px] bg-[#D1D5DB] rounded-full" />
              )}
            </button>
          </div>

          <div className="text-meta text-[#6B7280]">
            {sessionCount} sessions
          </div>
        </div>

        <div className="border-b border-[#E3E6E5]"></div>
      </div>
    </div>
  );
}