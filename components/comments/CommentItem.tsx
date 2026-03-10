"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Comment } from "@/lib/domain/comment";
import { formatCommentDate } from "@/lib/utils/formatCommentDate";
import { CommentAttachmentCard } from "@/components/discussion/CommentAttachmentCard";
import { ImageViewer } from "@/components/ImageViewer";
export interface CommentItemProps {
  comment: Comment;
  currentUserId: string | null;
  onUpdate?: (commentId: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  /** Optional extra menu items (e.g. Resolve/Unresolve for CommentPanel) */
  additionalMenuItems?: React.ReactNode;
  /** Visual size variant */
  size?: "default" | "compact";
  className?: string;
}

export function CommentItem({
  comment,
  currentUserId,
  onUpdate,
  onDelete,
  additionalMenuItems,
  size = "default",
  className = "",
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.message);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; fileName: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const canEditDelete = currentUserId != null && comment.userId === currentUserId;
  const showMenu = (canEditDelete && (onUpdate || onDelete)) || Boolean(additionalMenuItems);

  useEffect(() => {
    setEditDraft(comment.message);
  }, [comment.message]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  useEffect(() => {
    if (!deleteModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setDeleteModalOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [deleteModalOpen]);

  const handleSaveEdit = useCallback(async () => {
    const trimmed = editDraft.trim();
    if (trimmed === comment.message || !onUpdate) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onUpdate(comment.id, { message: trimmed });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [comment.id, comment.message, editDraft, onUpdate]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    setSaving(true);
    try {
      await onDelete(comment.id);
      setDeleteModalOpen(false);
      setMenuOpen(false);
    } finally {
      setSaving(false);
    }
  }, [comment.id, onDelete]);

  const avatarSize = size === "compact" ? "w-6 h-6" : "w-8 h-8";
  const textSize = size === "compact" ? "text-[13px]" : "text-[15px]";
  const metaSize = size === "compact" ? "text-[11px]" : "text-[12px]";

  return (
    <div className={`flex gap-3 group relative font-sans ${className}`}>
      <div
        className={`${avatarSize} shrink-0 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600 overflow-hidden`}
      >
        {comment.userAvatar?.trim() ? (
          <img
            src={comment.userAvatar}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          comment.userName?.charAt(0) ?? "?"
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2">
          <span className={`font-medium text-neutral-900 ${size === "compact" ? "text-[13px]" : "text-[14px]"}`}>
            {comment.userName ?? "User"}
          </span>
          <span className={`text-neutral-400 ${metaSize}`}>
            {formatCommentDate(comment.createdAt)}
          </span>
          {showMenu && (
            <div className="relative ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1 rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                aria-label="Comment actions"
              >
                <MoreVertical className={size === "compact" ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.5} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-lg bg-white border border-neutral-200 shadow-lg z-[200]">
                  {canEditDelete && onUpdate && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(true);
                        setEditDraft(comment.message);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                  {canEditDelete && onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteModalOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                  {additionalMenuItems}
                </div>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              className="w-full min-h-[80px] rounded-xl border border-neutral-200 px-4 py-3 text-[14px] font-normal text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC] transition resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditDraft(comment.message);
                }}
                className="px-3 py-2 text-sm font-medium text-neutral-700 rounded-xl border border-neutral-200 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEdit()}
                disabled={saving || editDraft.trim() === comment.message}
                className="px-3 py-2 text-sm font-medium rounded-xl bg-[#155DFC] text-white hover:bg-[#0F4EDC] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
            {comment.attachment && (
              <CommentAttachmentCard
                attachment={comment.attachment}
                onImageClick={(url, fileName) => setSelectedImage({ url, fileName })}
              />
            )}
          </div>
        ) : (
          <>
            <p className={`mt-1 leading-relaxed text-neutral-700 ${textSize} ${comment.resolved ? "opacity-75 line-through" : ""}`}>
              {comment.message}
            </p>
            {comment.attachment && (
              <CommentAttachmentCard
                attachment={comment.attachment}
                onImageClick={(url, fileName) => setSelectedImage({ url, fileName })}
              />
            )}
          </>
        )}
      </div>

      {selectedImage && (
        <ImageViewer
          imageUrl={selectedImage.url}
          fileName={selectedImage.fileName}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {deleteModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 font-sans"
          onClick={(e) => e.target === e.currentTarget && setDeleteModalOpen(false)}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-comment-title"
        >
          <div
            className="w-[420px] rounded-xl bg-white shadow-xl p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-comment-title" className="text-lg font-semibold text-neutral-900">
              Delete comment
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Are you sure you want to delete this comment?
              This action cannot be undone.
            </p>
            <div className="mt-4 p-3 rounded-lg border border-neutral-200 bg-neutral-50/80">
              <div className="flex gap-3">
                <div
                  className={`${avatarSize} shrink-0 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600 overflow-hidden`}
                >
                  {comment.userAvatar?.trim() ? (
                    <img
                      src={comment.userAvatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    comment.userName?.charAt(0) ?? "?"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-neutral-900">
                      {comment.userName ?? "User"}
                    </span>
                    <span className={`text-neutral-400 ${metaSize}`}>
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-700 line-clamp-2 break-words">
                    {comment.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
              >
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
