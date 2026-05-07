"use client";

import type { LucideIcon } from "lucide-react";
import {
  Inbox,
  AtSign,
  UserRound,
  PenLine,
} from "lucide-react";

export type FolderKey =
  | "inbox"
  | "mentions"
  | "assigned"
  | "saved";

export interface FolderSession {
  id: string;
  name: string;
  count: number;
}

export interface FolderCounts {
  inbox: number;
  mentions: number;
  assigned: number;
  saved: number;
}

export interface DiscussionFoldersProps {
  selectedFolder: FolderKey;
  selectedSessionId: string | null;
  counts: FolderCounts;
  sessions: FolderSession[];
  onFolderChange: (key: FolderKey) => void;
  onSessionChange: (sessionId: string | null) => void;
  onCompose?: () => void;
  loading?: boolean;
}

interface MainFolderItem {
  key: FolderKey;
  label: string;
  Icon: LucideIcon;
  countKey: keyof FolderCounts;
  alwaysShowCount?: boolean;
  iconColor: string;
}

const MAIN_FOLDERS: MainFolderItem[] = [
  { key: "inbox", label: "Inbox", Icon: Inbox, countKey: "inbox", alwaysShowCount: true, iconColor: "text-[#1775E0]" },
  { key: "mentions", label: "Mentions", Icon: AtSign, countKey: "mentions", iconColor: "text-[#6049E7]" },
  { key: "assigned", label: "Assigned to me", Icon: UserRound, countKey: "assigned", iconColor: "text-[#E5484D]" },
];

export function DiscussionFolders({
  selectedFolder,
  selectedSessionId,
  counts,
  sessions,
  onFolderChange,
  onSessionChange,
  onCompose,
  loading = false,
}: DiscussionFoldersProps) {
  if (loading) {
    return (
      <aside className="flex flex-col h-full w-full bg-[var(--surface-card)] overflow-y-auto px-3 py-4 shadow-[var(--shadow-panel)]">
        <div className="flex items-center justify-between px-1.5 mb-3.5">
          <h2 className="text-[15px] font-semibold text-[var(--text-heading)]">Discussion</h2>
        </div>
        <div className="px-3 py-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-[7px] mb-1">
              <div className="w-[18px] h-[18px] rounded-md skel-block" />
              <div className="h-3 skel-block rounded-md flex-1" style={{ width: `${60 - i * 8}%` }} />
            </div>
          ))}
          <div className="h-2.5 w-20 skel-block rounded-md mt-5 mb-2 mx-2" />
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-1.5 mb-1">
              <div className="h-3 skel-block rounded-md flex-1" style={{ width: `${55 - i * 10}%` }} />
              <div className="h-2.5 w-5 skel-block rounded-md" />
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col h-full w-full bg-[var(--surface-card)] overflow-y-auto px-3 py-4 shadow-[var(--shadow-panel)]">
      {/* Heading */}
      <div className="flex items-center justify-between px-1.5 mb-3.5">
        <h2 className="text-[15px] font-semibold text-[var(--text-heading)]">Discussion</h2>
        {onCompose ? (
          <button
            type="button"
            onClick={onCompose}
            className="w-6 h-6 rounded-md bg-[var(--text-heading)] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Compose"
          >
            <PenLine className="w-3 h-3" strokeWidth={2} />
          </button>
        ) : null}
      </div>

      {/* Main folders */}
      <div className="mb-4">
        {MAIN_FOLDERS.map((item) => {
          const isActive = selectedFolder === item.key && selectedSessionId === null;
          const count = counts[item.countKey] ?? 0;
          const isUnread = item.key === "inbox" && count > 0;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onFolderChange(item.key);
                onSessionChange(null);
              }}
              className={`group w-full flex items-center gap-3 px-2 py-[7px] rounded-lg text-[14px] text-left transition-colors ${
                isActive
                  ? "bg-[var(--brand-subtle)] text-[var(--brand-text)] font-medium"
                  : isUnread
                    ? "text-[var(--text-heading)] font-medium hover:bg-[var(--surface-hover)]"
                    : "text-[var(--text-body)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <item.Icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive ? "text-[var(--brand)]" : item.iconColor
                }`}
                strokeWidth={2}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {(count > 0 || item.alwaysShowCount) && (
                <span
                  className={`text-[12px] tabular-nums font-medium ${
                    isActive
                      ? "text-[var(--brand)] opacity-70"
                      : isUnread
                        ? "text-[var(--brand)] font-semibold"
                        : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* By session */}
      {sessions.length > 0 && (
        <div className="mb-4">
          <div className="px-2 mb-1.5 text-[11px] uppercase tracking-[0.06em] text-[var(--text-tertiary)] font-medium">
            By session
          </div>
          {sessions.map((s) => {
            const isActive = selectedSessionId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSessionChange(s.id)}
                className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-[14px] text-left transition-colors ${
                  isActive
                    ? "bg-[var(--brand-subtle)] text-[var(--brand-text)] font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)]"
                }`}
              >
                <span className="flex-1 truncate">{s.name || "Untitled"}</span>
                {s.count > 0 && (
                  <span
                    className={`text-[12px] tabular-nums ${
                      isActive ? "text-[var(--brand)]" : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {s.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

    </aside>
  );
}
