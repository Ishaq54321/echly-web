"use client";

import { memo, useMemo, type ComponentType } from "react";
import { Search, Reply } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/time";
import {
  EmptyAssignedIllustration,
  EmptyInboxIllustration,
  EmptyMentionsIllustration,
  EmptySearchIllustration,
  EmptySessionFilterIllustration,
} from "@/components/discussion/EmptyStateIllustrations";

export interface ThreadListItem {
  id: string;
  title: string;
  sessionId: string;
  sessionName?: string;
  authorName?: string;
  authorAvatarUrl?: string | null;
  commentCount?: number;
  lastCommentPreview?: string;
  status: "open" | "resolved";
  updatedAt?: string;
  createdAt?: { seconds?: number } | string;
  lastCommentAt?: { seconds?: number } | string;
  isUnread?: boolean;
  isMentionedYou?: boolean;
}

export type ThreadListEmptyContext =
  | "inbox"
  | "mentions"
  | "assigned"
  | "session"
  | "saved";

export interface DiscussionThreadListProps {
  title: string;
  totalCount: number;
  items: ThreadListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  emptyContext?: ThreadListEmptyContext;
}

interface EmptyState {
  Illustration: ComponentType;
  heading: string;
  subtext: string;
}

function getEmptyState(ctx: ThreadListEmptyContext | undefined): EmptyState {
  switch (ctx) {
    case "mentions":
      return {
        Illustration: EmptyMentionsIllustration,
        heading: "No mentions yet",
        subtext: "When someone @mentions you in a conversation, it shows up here.",
      };
    case "assigned":
      return {
        Illustration: EmptyAssignedIllustration,
        heading: "Nothing assigned to you",
        subtext: "Tickets assigned to you will appear here.",
      };
    case "session":
      return {
        Illustration: EmptySessionFilterIllustration,
        heading: "No discussions yet",
        subtext: "Start a conversation on any ticket in this session.",
      };
    case "saved":
      return {
        Illustration: EmptyInboxIllustration,
        heading: "Nothing saved yet",
        subtext: "Saved threads will appear here for quick access.",
      };
    case "inbox":
    default:
      return {
        Illustration: EmptyInboxIllustration,
        heading: "All caught up",
        subtext: "When teammates comment on tickets, their conversations appear here.",
      };
  }
}

const AVATAR_BG_PALETTE = [
  "#5B7BD3",
  "#4A8B6F",
  "#B47BC7",
  "#E8835D",
  "#D1A845",
  "#6E8FB5",
];

function getAvatarBg(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_BG_PALETTE[Math.abs(hash) % AVATAR_BG_PALETTE.length];
}

function parseUpdatedAt(item: ThreadListItem): number {
  const la = item.lastCommentAt;
  if (la && typeof la === "object" && typeof (la as { seconds?: number }).seconds === "number") {
    return (la as { seconds: number }).seconds * 1000;
  }
  if (typeof la === "string") return new Date(la).getTime();
  if (typeof item.updatedAt === "string") return new Date(item.updatedAt).getTime();
  const c = item.createdAt;
  if (c && typeof c === "object" && typeof (c as { seconds?: number }).seconds === "number") {
    return (c as { seconds: number }).seconds * 1000;
  }
  if (typeof c === "string") return new Date(c).getTime();
  return 0;
}

function getInitials(name: string | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface ThreadCardProps {
  item: ThreadListItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ThreadCard = memo(function ThreadCard({ item, isSelected, onSelect }: ThreadCardProps) {
  const isUnread = item.isUnread === true;
  const ts = parseUpdatedAt(item);
  const timeLabel = ts > 0 ? formatRelativeTime(new Date(ts)) : "Just now";
  const author = item.authorName || "Anonymous";
  const avatarBg = getAvatarBg(item.id || author);
  const replyCount = item.commentCount ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item.id);
        }
      }}
      className={`relative px-[18px] py-3.5 border-b border-[var(--border)] cursor-pointer transition-colors outline-none focus-visible:bg-[var(--surface-subtle)] ${
        isSelected
          ? "bg-[var(--brand-subtle)] shadow-[inset_3px_0_0_var(--brand)]"
          : "hover:bg-[var(--surface-subtle)]"
      }`}
    >
      {isUnread && !isSelected && (
        <span
          className="absolute left-2 top-[22px] w-1.5 h-1.5 rounded-full bg-[var(--brand)]"
          aria-hidden
        />
      )}

      <div className="flex items-center gap-2 mb-3">
        {item.authorAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.authorAvatarUrl}
            alt=""
            className="w-[22px] h-[22px] rounded-full object-cover shrink-0"
            aria-hidden
          />
        ) : (
          <div
            className="w-[22px] h-[22px] rounded-full text-white text-[9px] font-semibold flex items-center justify-center shrink-0"
            style={{ background: avatarBg }}
            aria-hidden
          >
            {getInitials(author)}
          </div>
        )}
        <span
          className={`flex-1 min-w-0 text-[14px] truncate ${
            isUnread ? "font-semibold text-[var(--text-heading)]" : "font-medium text-[var(--text-heading)]"
          }`}
        >
          {author}
        </span>
        {item.isMentionedYou && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF0CD] text-[#9B6B1F] shrink-0">
            @you
          </span>
        )}
        <span
          className={`text-[12px] tabular-nums shrink-0 ${
            isUnread ? "text-[var(--brand)] font-medium" : "text-[var(--text-tertiary)]"
          }`}
        >
          {timeLabel}
        </span>
      </div>

      <h3 className="text-[14px] font-medium text-[var(--text-heading)] mb-0.5 leading-[1.4] truncate">
        {item.title || "Untitled"}
      </h3>

      {item.sessionName ? (
        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.45] truncate">
          {item.sessionName}
        </p>
      ) : null}

      {replyCount > 0 ? (
        <div className="flex items-center gap-1.5 mt-2">
          <span className="ml-auto inline-flex items-center gap-0.5 text-[12px] text-[var(--text-tertiary)]">
            <Reply className="w-3 h-3" strokeWidth={2} />
            {replyCount}
          </span>
        </div>
      ) : null}
    </div>
  );
});

export function DiscussionThreadList({
  title,
  totalCount,
  items,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  loading,
  error,
  emptyContext,
}: DiscussionThreadListProps) {
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.sessionName ?? "").toLowerCase().includes(q) ||
        (i.lastCommentPreview ?? "").toLowerCase().includes(q) ||
        (i.authorName ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div className="flex flex-col h-full bg-[var(--surface-card)] min-h-0 shadow-[var(--shadow-panel)]">
      {/* Header */}
      <div className="shrink-0 px-[18px] pt-[14px] pb-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[var(--text-heading)]">
            {title}
            <span className="ml-1.5 text-[var(--text-tertiary)] font-normal">· {totalCount}</span>
          </h2>
        </div>
        <div className="h-8 bg-white border border-[var(--border)] rounded-full flex items-center px-3 gap-2 transition-all focus-within:border-[var(--brand)]">
          <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" strokeWidth={2} />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search threads…"
            className="flex-1 bg-transparent border-0 outline-0 text-[12.5px] text-[var(--text-heading)] placeholder:text-[var(--text-tertiary)]"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex flex-col" aria-busy="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`px-[18px] py-3.5 border-b border-[var(--border)] ${i === 0 ? "bg-[var(--brand-subtle)]/30" : ""}`}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className={`w-[22px] h-[22px] rounded-full ${i === 0 ? "skel-blue-strong" : "skel-block"}`} />
                  <div className={`h-3 rounded-md ${i === 0 ? "skel-blue" : "skel-block"}`} style={{ width: "30%" }} />
                  <div className="flex-1" />
                  <div className={`h-2.5 rounded-md ${i === 0 ? "skel-blue" : "skel-block"}`} style={{ width: "12%" }} />
                </div>
                <div className={`h-3.5 rounded-md mb-1.5 ${i === 0 ? "skel-blue" : "skel-block"}`} style={{ width: `${70 - i * 5}%` }} />
                <div className={`h-3 rounded-md ${i === 0 ? "skel-blue" : "skel-block"}`} style={{ width: `${45 - i * 3}%` }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-[14px] text-[var(--text-secondary)]">{error}</p>
          </div>
        ) : items.length === 0 ? (
          (() => {
            const { Illustration, heading, subtext } = getEmptyState(emptyContext);
            return (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="mb-4">
                  <Illustration />
                </div>
                <h3 className="text-[15px] font-semibold text-[var(--text-heading)]">{heading}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-[260px] leading-relaxed">
                  {subtext}
                </p>
              </div>
            );
          })()
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="mb-4">
              <EmptySearchIllustration />
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--text-heading)]">No threads found</h3>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-[260px] leading-relaxed">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div>
            {filteredItems.map((item) => (
              <ThreadCard
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
