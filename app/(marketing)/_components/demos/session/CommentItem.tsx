/**
 * CommentItem — marketing adaptation of components/comments/CommentItem.tsx
 *
 * Per SESSION_PAGE_DESIGN_SPEC §10, the comments thread is built around a
 * Firestore subscription, Tiptap, an emoji picker, file upload, ImageViewer,
 * a delete Modal, toggleReaction, and the live `useUserAvatar` resolver. The
 * marketing demo renders comments STATICALLY with no-op mutations, so all of
 * that machinery is unreachable. This file forklifts ONLY the display path:
 *   - UserAvatar (pure: getInitials + getAvatarColor), verbatim usage
 *   - name (`font-semibold text-discussion-title text-[14px] truncate`)
 *   - timestamp (`text-meta text-[12px]`)
 *   - body (`mt-1.5 leading-relaxed text-discussion-body font-normal text-[14px]`)
 *   - .mention-chip rendering (verbatim renderMessageWithMentions logic)
 *   - reaction pills (verbatim classes)
 * Stripped: edit/delete/resolve/react action bar (no callbacks → showActionBar
 * is false in source too), Tiptap, emoji picker, attachments, ImageViewer, Modal,
 * useUserAvatar (avatar comes in as a static color/initials seed).
 */
"use client";

import React from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";

const MENTION_TOKEN_RE = /@\[([^\]]+)\]\(([^)]*)\)|@\S+/g;

function renderMessageWithMentions(message: string) {
  if (!message) return null;
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  MENTION_TOKEN_RE.lastIndex = 0;
  while ((match = MENTION_TOKEN_RE.exec(message)) !== null) {
    if (match.index > cursor) {
      out.push(message.slice(cursor, match.index));
    }
    const label = match[1] ?? match[0].slice(1);
    out.push(
      <span key={`m-${key++}`} className="mention-chip">
        {`@${label}`}
      </span>
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < message.length) {
    out.push(message.slice(cursor));
  }
  return out;
}

export interface DemoComment {
  id: string;
  userName: string;
  userId: string;
  avatarColor?: string | null;
  avatarUrl?: string | null;
  message: string;
  timestampLabel: string;
  reactions: { emoji: string; count: number; mine: boolean }[];
  resolved?: boolean;
}

export function CommentItem({
  comment,
  size = "default",
  isThreadResolved,
}: {
  comment: DemoComment;
  size?: "default" | "compact";
  isThreadResolved?: boolean;
}) {
  const avatarSize = size === "compact" ? "w-[28px] h-[28px]" : "w-[30px] h-[30px]";
  const textSize = "text-[14px]";
  const metaSize = "text-[12px]";

  return (
    <div className={`flex gap-2.5 group/item relative ${(comment.resolved || isThreadResolved) ? "opacity-60" : ""}`}>
      <UserAvatar
        avatarUrl={comment.avatarUrl}
        name={comment.userName}
        colorSeed={comment.userId}
        className={`${avatarSize} text-xs`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-discussion-title text-[14px] truncate">
              {comment.userName}
            </span>
            <span className={`text-meta ${metaSize} whitespace-nowrap flex-shrink-0`}>
              {comment.timestampLabel}
            </span>
          </div>
        </div>

        <p className={`mt-1.5 leading-relaxed text-discussion-body font-normal ${textSize}`}>
          {renderMessageWithMentions(comment.message)}
        </p>

        {comment.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {comment.reactions.map((r) => (
              <span
                key={r.emoji}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] border ${
                  r.mine
                    ? "bg-[var(--brand-subtle)] border-[var(--brand-muted)] text-[var(--brand)]"
                    : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-body)]"
                }`}
              >
                <span className="text-[14px]">{r.emoji}</span>
                {r.count > 1 && <span className="tabular-nums font-medium">{r.count}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
