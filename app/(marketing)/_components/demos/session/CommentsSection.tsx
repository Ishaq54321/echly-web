/**
 * CommentsSection — marketing adaptation of
 * components/session/feedbackDetail/CommentsSection.tsx
 *
 * Forklifts the VISIBLE structure only (heading, composer, thread list with
 * reply indent). The production version is built around Tiptap, an emoji
 * picker, file upload, and Firestore mutations (binding decision #7). The
 * INTERACTIVITY PASS reproduces the production composer's collapsed→expanded
 * behaviour exactly (CommentsSection.tsx:829-1009), swapping only Tiptap for a
 * plain textarea:
 *   - DEFAULT (collapsed): the resting row — 26px avatar (Alex's initials),
 *     "Leave a comment...", and 3 muted, pointer-events:none decorative icons.
 *     Clicking the row (or Enter/Space) expands it, just like production.
 *   - EXPANDED: the production card — avatar + editor on top, the mention/emoji/
 *     attach IconToolbar bottom-left (decorative here, per the original forklift),
 *     and Cancel + Comment buttons bottom-right. Comment is disabled until there
 *     is content. Escape or Cancel collapses and clears. Enter (no Shift) submits;
 *     Shift+Enter inserts a newline.
 *   - On submit, onSendComment fires and the composer collapses + clears. The
 *     controller PREPENDS the new comment, so it appears at the TOP of the thread.
 *   - The freshly-added comment fades/slides in via .demo-comment-enter
 *     (defined in marketing.css).
 *   - Thread layout (roots in `flex flex-col gap-1`, reply indent, "Reply"
 *     no-op button) copied verbatim from source.
 * Stripped: TiptapCommentEditor, EmojiPicker, AttachmentChips, FileError,
 * upload, and all update/delete handlers + mention/emoji functionality.
 */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { AtSign, Smile, Paperclip } from "lucide-react";
import { CommentItem, type DemoComment } from "./CommentItem";

export interface DemoThread {
  root: DemoComment;
  replies: DemoComment[];
}

export function CommentsSection({
  threads,
  currentUserInitial = "Y",
  onSendComment,
}: {
  threads: DemoThread[];
  currentUserInitial?: string;
  onSendComment?: (body: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const canSend = draft.trim().length > 0;

  // New comments are prepended, so the newest demo root is the FIRST thread.
  const newestRootId =
    threads.length > 0 && threads[0].root.id.startsWith("demo-") ? threads[0].root.id : null;

  useEffect(() => {
    if (expanded) taRef.current?.focus();
  }, [expanded]);

  const reset = () => {
    setDraft("");
    setExpanded(false);
  };

  const submit = () => {
    if (!canSend) return;
    onSendComment?.(draft);
    reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      reset();
    }
  };

  const avatarChip = (
    <div className="w-[26px] h-[26px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold text-[10.5px] flex items-center justify-center shrink-0 overflow-hidden">
      {currentUserInitial || "?"}
    </div>
  );

  return (
    <section className="mt-12 min-w-0">
      <h2 className="text-[17px] font-semibold text-[var(--text-heading)] mb-3">
        Comments
      </h2>

      {/* Composer — collapsed by default, expands on click (matches production) */}
      <div className={`min-w-0 ${threads.length > 0 ? "pb-4 mb-4 border-b border-[var(--hair)]" : "mb-4"}`}>
        {!expanded ? (
          <div
            role="button"
            tabIndex={0}
            data-comment-composer
            className="flex items-center gap-3 border border-[var(--hair-strong)] rounded-[var(--radius-md)] px-4 bg-white transition-colors duration-150 cursor-text hover:border-[var(--border-strong)]"
            style={{ minHeight: 56 }}
            onClick={() => setExpanded(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpanded(true);
              }
            }}
          >
            {avatarChip}
            <span className="flex-1 min-w-0 truncate text-[13.5px] text-[var(--text-tertiary)]">
              Leave a comment...
            </span>
            {/* Decorative only while collapsed — pointer-events:none lets the
                click fall through to the row so the composer expands. */}
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
        ) : (
          <div
            data-comment-composer
            className="rounded-[var(--radius-md)] bg-white border border-[var(--hair-strong)] overflow-hidden focus-within:border-[var(--border-strong)] transition-colors duration-150"
          >
            <div className="flex items-start gap-3 px-4 pt-3">
              <div className="mt-0.5">{avatarChip}</div>
              <div className="flex-1 min-w-0 py-1">
                <textarea
                  ref={taRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Leave a comment..."
                  className="no-focus-ring w-full min-w-0 resize-none border-0 bg-transparent text-[13.5px] leading-[1.5] text-[var(--text-heading)] placeholder:text-[var(--text-tertiary)] outline-none"
                  style={{ minHeight: 22, maxHeight: 140, overflowY: "auto" }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2">
              {/* Decorative toolbar (mentions / emoji / attach are cosmetic) */}
              <span className="flex items-center gap-0.5" aria-hidden="true">
                <span className="w-[30px] h-[30px] rounded-md grid place-items-center text-[var(--text-tertiary)]">
                  <AtSign className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <span className="w-[30px] h-[30px] rounded-md grid place-items-center text-[var(--text-tertiary)]">
                  <Smile className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <span className="w-[30px] h-[30px] rounded-md grid place-items-center text-[var(--text-tertiary)]">
                  <Paperclip className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="text-[14px] font-semibold text-[var(--text-body)] hover:text-[var(--text-heading)] px-2 py-1 transition-colors cursor-pointer border-0 bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend}
                  className="inline-flex h-[34px] items-center gap-1.5 px-3.5 rounded-[var(--radius-btn)] border-none text-white text-[13px] font-medium transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  style={{ background: "var(--brand)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--brand-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--brand)";
                  }}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thread list */}
      {threads.length === 0 ? null : (
        <div className="flex flex-col gap-1 min-w-0">
          {threads.map(({ root, replies }) => (
            <div
              key={root.id}
              className={`comment-row rounded-xl px-3 py-2 min-w-0 ${
                root.id === newestRootId ? "demo-comment-enter" : ""
              }`}
            >
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
