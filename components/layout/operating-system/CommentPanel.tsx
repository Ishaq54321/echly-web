"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { X, MoreHorizontal, Pencil, Trash2, CheckCircle2, RotateCcw } from "lucide-react";
import Image from "next/image";
import type { Comment } from "@/lib/domain/comment";
import { formatCommentDate } from "@/lib/utils/formatCommentDate";

const PANEL_WIDTH = 380;

export type CommentFilterTab = "all" | "unresolved" | "resolved";

export interface CommentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  loading: boolean;
  sendReply: (threadId: string, message: string) => Promise<void>;
  activeThreadId?: string | null;
  onSelectThread?: (threadId: string) => void;
  variant?: "overlay" | "sidebar";
  currentUserId?: string | null;
  updateComment?: (commentId: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  deleteComment?: (commentId: string) => Promise<void>;
}

const CommentRow = memo(function CommentRow({
  comment,
  size,
  currentUserId,
  updateComment,
  deleteComment,
  onDeleted,
  showResolve,
}: {
  comment: Comment;
  size: "root" | "reply";
  currentUserId: string | null;
  updateComment?: (id: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  deleteComment?: (id: string) => Promise<void>;
  onDeleted?: () => void;
  showResolve?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.message);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = currentUserId != null && comment.userId === currentUserId;

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const handleSaveEdit = useCallback(async () => {
    const trimmed = editDraft.trim();
    if (trimmed === comment.message || !updateComment) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateComment(comment.id, { message: trimmed });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [comment.id, comment.message, editDraft, updateComment]);

  const handleDelete = useCallback(async () => {
    if (!deleteComment) return;
    setSaving(true);
    try {
      await deleteComment(comment.id);
      setDeleteConfirm(false);
      setMenuOpen(false);
      onDeleted?.();
    } finally {
      setSaving(false);
    }
  }, [comment.id, deleteComment, onDeleted]);

  const handleResolve = useCallback(async () => {
    if (!updateComment) return;
    await updateComment(comment.id, { resolved: true });
    setMenuOpen(false);
  }, [comment.id, updateComment]);

  const handleUnresolve = useCallback(async () => {
    if (!updateComment) return;
    await updateComment(comment.id, { resolved: false });
    setMenuOpen(false);
  }, [comment.id, updateComment]);

  const avatarSize = size === "root" ? "h-8 w-8" : "h-6 w-6";
  const textSize = size === "root" ? "text-[13px]" : "text-[12px]";

  return (
    <div className="flex gap-2 py-2 group relative">
      <div className={`${avatarSize} shrink-0 rounded-full overflow-hidden bg-[var(--layer-2-border)]`}>
        {comment.userAvatar ? (
          <Image src={comment.userAvatar} alt="" width={size === "root" ? 32 : 24} height={size === "root" ? 32 : 24} className="w-full h-full object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-[hsl(var(--text-tertiary))]">
            {comment.userName?.charAt(0) ?? "?"}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap gap-y-0">
          <span className="text-[12px] font-medium text-[hsl(var(--text-primary-strong))]">{comment.userName}</span>
          <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{formatCommentDate(comment.createdAt)}</span>
          {size === "root" && (isAuthor || showResolve) && (updateComment || deleteComment) && (
            <div className="relative ml-auto shrink-0 overflow-visible" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1 rounded hover:bg-[var(--layer-2-hover-bg)] text-[hsl(var(--text-tertiary))] cursor-pointer"
                aria-label="Actions"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 py-1.5 min-w-[160px] rounded-xl bg-[var(--layer-1-bg)] border border-[var(--layer-1-border)] shadow-[var(--shadow-level-4)] z-[200]">
                  {isAuthor && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setEditing(true); setEditDraft(comment.message); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration)] cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeleteConfirm(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </>
                  )}
                  {showResolve && updateComment && !comment.resolved && (
                    <button
                      type="button"
                      onClick={handleResolve}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] text-emerald-700 hover:bg-emerald-50 transition-colors duration-150 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Mark as resolved
                    </button>
                  )}
                  {showResolve && updateComment && comment.resolved && (
                    <button
                      type="button"
                      onClick={handleUnresolve}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration)] cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Mark as unresolved
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {editing ? (
          <div className="mt-1 space-y-2">
            <textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              className="box-border w-full min-h-[60px] rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-2-bg)] px-3 py-2.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-all duration-[var(--motion-duration)] resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => { setEditing(false); setEditDraft(comment.message); }} className="text-[11px] font-medium px-2 py-1 rounded border border-[var(--layer-2-border)] cursor-pointer">Cancel</button>
              <button type="button" onClick={() => void handleSaveEdit()} disabled={saving || editDraft.trim() === comment.message} className="text-[11px] font-medium px-2 py-1 rounded bg-[var(--accent-operational)] text-white disabled:opacity-50 cursor-pointer">Save</button>
            </div>
          </div>
        ) : (
          <p className={`mt-0.5 ${textSize} text-[hsl(var(--text-secondary-soft))] leading-relaxed ${comment.resolved ? "opacity-75 line-through" : ""}`}>{comment.message}</p>
        )}
      </div>
      {deleteConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4 cursor-pointer" onClick={() => setDeleteConfirm(false)} aria-hidden>
          <div className="bg-white rounded-xl shadow-xl p-4 max-w-sm w-full border border-[var(--layer-2-border)]" onClick={(e) => e.stopPropagation()}>
            <p className="text-[13px] text-[hsl(var(--text-primary-strong))]">Delete this comment? This cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setDeleteConfirm(false)} className="text-[12px] font-medium px-3 py-1.5 rounded border cursor-pointer">Cancel</button>
              <button type="button" onClick={() => void handleDelete()} disabled={saving} className="text-[12px] font-medium px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50 cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const ThreadBlock = memo(function ThreadBlock({
  root,
  replies,
  isActive,
  isHighlighted,
  threadRef,
  currentUserId,
  updateComment,
  deleteComment,
  sendReply,
  onSelectThread,
}: {
  root: Comment;
  replies: Comment[];
  isActive: boolean;
  isHighlighted: boolean;
  threadRef: (el: HTMLDivElement | null) => void;
  currentUserId: string | null;
  updateComment?: (id: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  deleteComment?: (id: string) => Promise<void>;
  sendReply?: (threadId: string, message: string) => Promise<void>;
  onSelectThread?: (threadId: string) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");

  const handleSubmitReply = useCallback(async () => {
    const trimmed = replyDraft.trim();
    if (!trimmed || !sendReply) return;
    await sendReply(root.id, trimmed);
    setReplyDraft("");
    setReplyOpen(false);
  }, [root.id, replyDraft, sendReply]);

  return (
    <div
      ref={threadRef}
      data-thread-id={root.id}
      role="button"
      tabIndex={0}
      onClick={() => onSelectThread?.(root.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectThread?.(root.id); } }}
      className={`relative w-full box-border rounded-xl px-3 py-3 min-w-0 overflow-visible transition-colors duration-[var(--motion-duration)] cursor-pointer ${isActive ? "bg-[var(--layer-2-hover-bg)]" : "hover:bg-[var(--layer-2-hover-bg)]"} ${root.resolved ? "opacity-90" : ""} ${isHighlighted ? "bg-[var(--color-primary-soft)]" : ""}`}
      style={{ boxSizing: "border-box" }}
    >
      <CommentRow
        comment={root}
        size="root"
        currentUserId={currentUserId}
        updateComment={updateComment}
        deleteComment={deleteComment}
        showResolve
      />
      {replies.length > 0 && (
        <div className="ml-10 mt-1 space-y-0.5">
          {replies.map((r) => (
            <CommentRow
              key={r.id}
              comment={r}
              size="reply"
              currentUserId={currentUserId}
              updateComment={updateComment}
              deleteComment={deleteComment}
            />
          ))}
        </div>
      )}
      {sendReply && (
        <>
          {!replyOpen ? (
            <div className="ml-10 mt-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setReplyOpen(true); }}
                className="text-[11px] font-medium text-[hsl(var(--accent-operational))] hover:underline cursor-pointer"
              >
                Reply
              </button>
            </div>
          ) : (
            <div
              className="mt-2 w-full max-w-full min-w-0 box-border overflow-hidden animate-in fade-in ease-out"
              onClick={(e) => e.stopPropagation()}
              style={{ animationDuration: "120ms", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
            >
              <div className="flex flex-col w-full max-w-full min-w-0 box-border" style={{ boxSizing: "border-box" }}>
                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="Write a reply..."
                  className="block box-border w-full max-w-full min-h-[44px] rounded-xl bg-[var(--layer-2-bg)] border border-[var(--layer-2-border)] px-3 py-2.5 text-[13px] leading-relaxed text-[hsl(var(--text-primary-strong))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none transition-all duration-[var(--motion-duration)]"
                  style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setReplyOpen(false);
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSubmitReply(); }
                  }}
                />
                <div className="flex justify-between items-center flex-shrink-0 flex-nowrap gap-3 mt-2">
                  <button type="button" onClick={() => setReplyOpen(false)} className="text-[12px] font-medium text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))] px-2.5 py-2 rounded-md transition-colors duration-150 shrink-0 whitespace-nowrap cursor-pointer">Cancel</button>
                  <button type="button" onClick={() => void handleSubmitReply()} disabled={!replyDraft.trim()} className="text-[12px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md px-3 py-2 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-150 shrink-0 whitespace-nowrap cursor-pointer">Done</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

const CommentThreadList = memo(function CommentThreadList({
  comments,
  loading,
  activeThreadId,
  highlightThreadId,
  threadRefs,
  filterTab,
  onFilterTabChange,
  currentUserId,
  updateComment,
  deleteComment,
  sendReply,
  onSelectThread,
}: {
  comments: Comment[];
  loading: boolean;
  activeThreadId?: string | null;
  highlightThreadId?: string | null;
  threadRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
  filterTab: CommentFilterTab;
  onFilterTabChange: (tab: CommentFilterTab) => void;
  currentUserId: string | null;
  updateComment?: (id: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  deleteComment?: (id: string) => Promise<void>;
  sendReply?: (threadId: string, message: string) => Promise<void>;
  onSelectThread?: (threadId: string) => void;
}) {
  const roots = comments.filter((c) => !c.threadId);
  const byThreadId = new Map<string, Comment[]>();
  comments.forEach((c) => {
    if (c.threadId) {
      const list = byThreadId.get(c.threadId) ?? [];
      list.push(c);
      byThreadId.set(c.threadId, list);
    }
  });

  const unresolvedRoots = roots.filter((r) => !r.resolved);
  const resolvedRoots = roots.filter((r) => r.resolved);
  const [resolvedCollapsed, setResolvedCollapsed] = useState(true);

  if (loading) {
    return (
      <div className="py-6 text-[13px] text-[hsl(var(--text-tertiary))]">Loading…</div>
    );
  }

  if (roots.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-[13px] text-[hsl(var(--text-tertiary))]">No comments yet. Add a pin or select text to comment.</p>
      </div>
    );
  }

  const tabs = ["all", "unresolved", "resolved"] as const;

  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-center gap-0 border-b border-[var(--layer-2-border)] min-w-0">
        {tabs.map((tab) => {
          const isActive = filterTab === tab;
          const activeBorder =
            tab === "all"
              ? "border-[hsl(var(--text-primary-strong))]"
              : tab === "unresolved"
                ? "border-amber-500"
                : "border-emerald-500";
          const activeBg =
            tab === "all"
              ? "bg-[var(--layer-2-hover-bg)]"
              : tab === "unresolved"
                ? "bg-amber-50/80"
                : "bg-emerald-50/80";
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onFilterTabChange(tab)}
              className={`px-3 py-2.5 text-[12px] font-medium capitalize transition-colors duration-150 ease-out border-b-2 -mb-px shrink-0 cursor-pointer ${
                isActive
                  ? `text-[hsl(var(--text-primary-strong))] ${activeBorder} ${activeBg}`
                  : "text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))] border-transparent hover:bg-[var(--layer-2-hover-bg)]"
              }`}
            >
              {tab === "all" ? "All" : tab === "unresolved" ? "Unresolved" : "Resolved"}
            </button>
          );
        })}
      </div>
      <div className="space-y-1 min-w-0">
        {(filterTab === "unresolved" || filterTab === "all") && unresolvedRoots.map((root) => (
          <ThreadBlock
            key={root.id}
            root={root}
            replies={byThreadId.get(root.id) ?? []}
            isActive={activeThreadId === root.id}
            isHighlighted={activeThreadId === root.id && highlightThreadId === root.id}
            threadRef={(el) => { threadRefs.current.set(root.id, el); }}
            currentUserId={currentUserId}
            updateComment={updateComment}
            deleteComment={deleteComment}
            sendReply={sendReply}
            onSelectThread={onSelectThread}
          />
        ))}
        {filterTab === "all" && resolvedRoots.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--layer-2-border)]">
            <button
              type="button"
              onClick={() => setResolvedCollapsed((c) => !c)}
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary-soft))] cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Resolved ({resolvedRoots.length})
            </button>
            {!resolvedCollapsed && (
              <div className="mt-2 space-y-1">
                {resolvedRoots.map((root) => (
                  <ThreadBlock
                    key={root.id}
                    root={root}
                    replies={byThreadId.get(root.id) ?? []}
                    isActive={activeThreadId === root.id}
                    isHighlighted={activeThreadId === root.id && highlightThreadId === root.id}
                    threadRef={(el) => { threadRefs.current.set(root.id, el); }}
                    currentUserId={currentUserId}
                    updateComment={updateComment}
                    deleteComment={deleteComment}
                    sendReply={sendReply}
                    onSelectThread={onSelectThread}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {filterTab === "resolved" && resolvedRoots.map((root) => (
          <ThreadBlock
            key={root.id}
            root={root}
            replies={byThreadId.get(root.id) ?? []}
            isActive={activeThreadId === root.id}
            isHighlighted={activeThreadId === root.id && highlightThreadId === root.id}
            threadRef={(el) => { threadRefs.current.set(root.id, el); }}
            currentUserId={currentUserId}
            updateComment={updateComment}
            deleteComment={deleteComment}
            sendReply={sendReply}
            onSelectThread={onSelectThread}
          />
        ))}
      </div>
    </div>
  );
});

export function CommentPanel({
  isOpen,
  onClose,
  comments,
  loading,
  sendReply,
  activeThreadId,
  onSelectThread,
  variant = "sidebar",
  currentUserId = null,
  updateComment,
  deleteComment,
}: CommentPanelProps) {
  const [filterTab, setFilterTab] = useState<CommentFilterTab>("unresolved");
  const [highlightThreadId, setHighlightThreadId] = useState<string | null>(null);
  const threadRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !activeThreadId) return;
    setHighlightThreadId(activeThreadId);
    const el = threadRefs.current.get(activeThreadId);
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    const t = setTimeout(() => setHighlightThreadId(null), 2000);
    return () => clearTimeout(t);
  }, [isOpen, activeThreadId]);

  if (!isOpen) return null;

  const panelContent = (
    <>
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--layer-2-border)]">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--text-tertiary))]">Comment</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-[var(--motion-duration)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] cursor-pointer"
          aria-label="Close comment panel"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden box-border">
        <div className="px-4 py-4 min-w-0 box-border">
          <CommentThreadList
            comments={comments}
            loading={loading}
            activeThreadId={activeThreadId}
            highlightThreadId={highlightThreadId}
            threadRefs={threadRefs}
            filterTab={filterTab}
            onFilterTabChange={setFilterTab}
            currentUserId={currentUserId}
            updateComment={updateComment}
            deleteComment={deleteComment}
            sendReply={sendReply}
            onSelectThread={onSelectThread}
          />
        </div>
      </div>
    </>
  );

  if (variant === "sidebar") {
    return (
      <aside
        role="complementary"
        aria-label="Comment"
        className="h-full min-w-0 flex flex-col bg-[var(--canvas-base)] border-l border-[var(--layer-2-border)] box-border overflow-x-hidden"
      >
        {panelContent}
      </aside>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-150 cursor-pointer" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-label="Comment"
        style={{ width: PANEL_WIDTH }}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-[var(--canvas-base)] border-l border-[var(--layer-2-border)] shadow-[var(--elevation-2)] box-border overflow-x-hidden min-w-0"
      >
        {panelContent}
      </aside>
    </>
  );
}
