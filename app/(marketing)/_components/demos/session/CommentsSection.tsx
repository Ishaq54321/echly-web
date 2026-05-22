/**
 * CommentsSection — marketing adaptation of
 * components/session/feedbackDetail/CommentsSection.tsx
 *
 * Forklifts the VISIBLE structure only (heading, collapsed composer, thread list
 * with reply indent). The production version is built around Tiptap, an emoji
 * picker, file upload, and Firestore mutations — none of which fire with static
 * data and no-op callbacks (binding decision #7). So those are stripped:
 *   - The collapsed composer row ("Leave a comment...", 26px avatar, 3 muted
 *     icons, min-height 56) is copied verbatim; clicking it is a silent no-op
 *     (no expand-to-Tiptap).
 *   - Thread layout: roots in `flex flex-col gap-1`, each in
 *     `comment-row rounded-xl px-3 py-2`; replies indented
 *     `ml-[19px] mt-1 pl-[21px] border-l border-[var(--text-tertiary)]/20`,
 *     rendered with size="compact" — all verbatim from source.
 *   - "Reply" button kept (static, no-op) to match the resting visual.
 * Stripped: TiptapCommentEditor, EmojiPicker, AttachmentChips, FileError,
 * IconToolbar interactivity, upload, and all send/update/delete handlers.
 */
"use client";

import React from "react";
import { AtSign, Smile, Paperclip } from "lucide-react";
import { CommentItem, type DemoComment } from "./CommentItem";

export interface DemoThread {
  root: DemoComment;
  replies: DemoComment[];
}

export function CommentsSection({
  threads,
  currentUserInitial = "Y",
}: {
  threads: DemoThread[];
  currentUserInitial?: string;
}) {
  return (
    <section className="mt-12 min-w-0">
      <h2 className="text-[17px] font-semibold text-[var(--text-heading)] mb-3">
        Comments
      </h2>

      {/* Composer (collapsed; no-op in the marketing demo) */}
      <div className={`min-w-0 ${threads.length > 0 ? "pb-4 mb-4 border-b border-[var(--hair)]" : "mb-4"}`}>
        <div
          role="button"
          tabIndex={0}
          data-comment-composer
          className="flex items-center gap-3 border border-[var(--hair-strong)] rounded-[var(--radius-md)] px-4 bg-white transition-colors duration-150 cursor-text hover:border-[var(--border-strong)]"
          style={{ minHeight: 56 }}
        >
          <div className="w-[26px] h-[26px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold text-[10.5px] flex items-center justify-center shrink-0 overflow-hidden">
            {currentUserInitial || "?"}
          </div>
          <span className="flex-1 min-w-0 truncate text-[13.5px] text-[var(--text-tertiary)]">
            Leave a comment...
          </span>
          <span
            className="flex items-center gap-0.5 shrink-0"
            style={{ pointerEvents: "none" }}
            aria-hidden="true"
          >
            <span className="w-[26px] h-[26px] rounded-md grid place-items-center text-[var(--text-tertiary)]">
              <AtSign className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
            <span className="w-[26px] h-[26px] rounded-md grid place-items-center text-[var(--text-tertiary)]">
              <Smile className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
            <span className="w-[26px] h-[26px] rounded-md grid place-items-center text-[var(--text-tertiary)]">
              <Paperclip className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </span>
        </div>
      </div>

      {/* Thread list */}
      {threads.length === 0 ? null : (
        <div className="flex flex-col gap-1 min-w-0">
          {threads.map(({ root, replies }) => (
            <div key={root.id} className="comment-row rounded-xl px-3 py-2 min-w-0">
              <CommentItem comment={root} size="default" />
              {replies.length > 0 && (
                <div className="ml-[19px] mt-1 pl-[21px] border-l border-[var(--text-tertiary)]/20 space-y-0.5">
                  {replies.map((r) => (
                    <div key={r.id} className="py-2">
                      <CommentItem comment={r} size="compact" isThreadResolved={root.resolved === true} />
                    </div>
                  ))}
                </div>
              )}
              <div className="ml-10 mt-1">
                <button
                  type="button"
                  className="text-[13px] font-semibold text-[var(--text-body)] hover:text-[var(--text-heading)] hover:underline cursor-pointer border-0 bg-transparent p-0"
                >
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
