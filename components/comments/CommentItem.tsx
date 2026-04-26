"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, CheckCircle2, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import type { Comment } from "@/lib/domain/comment";
import { formatCommentDate } from "@/lib/utils/formatCommentDate";
import { CommentAttachmentCard } from "@/components/discussion/CommentAttachmentCard";
import { ImageViewer } from "@/components/ImageViewer";
import { Modal } from "@/components/ui/Modal";
import { toggleReaction } from "@/lib/comments";

export interface CommentItemProps {
  comment: Comment;
  currentUserId: string | null;
  currentUserName?: string;
  onUpdate?: (commentId: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  onReactionsChanged?: (commentId: string, reactions: Record<string, { userIds: string[]; userNames: string[] }>) => void;
  /** Optional extra menu items (e.g. for CommentPanel custom actions) */
  additionalMenuItems?: React.ReactNode;
  /** Direct resolve toggle handler — shown as a quick-action button in the hover bar */
  onResolveToggle?: () => void;
  /** Visual size variant */
  size?: "default" | "compact";
  className?: string;
  /** Ticket title badge (root comments only) */
  ticketTitle?: string;
  onNavigateToTicket?: () => void;
  isThreadResolved?: boolean;
}

function renderMessageWithMentions(message: string) {
  if (!message) return null;
  const parts = message.split(/(@\S+(?:\s\S+)?)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@") && part.length > 1) {
      return (
        <span key={i} className="mention-chip">
          {part}
        </span>
      );
    }
    return part;
  });
}

export function CommentItem({
  comment,
  currentUserId,
  currentUserName,
  onUpdate,
  onDelete,
  onReactionsChanged,
  additionalMenuItems,
  onResolveToggle,
  size = "default",
  className = "",
  ticketTitle,
  onNavigateToTicket,
  isThreadResolved,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.message);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; fileName: string } | null>(null);
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const [reactionAnchorRect, setReactionAnchorRect] = useState<DOMRect | null>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);

  const canEditDelete = comment.userId === currentUserId;
  const showActionBar = (canEditDelete && (onUpdate || onDelete)) || Boolean(additionalMenuItems) || Boolean(onResolveToggle) || Boolean(onReactionsChanged);

  useEffect(() => {
    setEditDraft(comment.message);
  }, [comment.message]);

  useEffect(() => {
    if (!reactionPickerOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        reactionPickerRef.current && !reactionPickerRef.current.contains(e.target as Node) &&
        reactionButtonRef.current && !reactionButtonRef.current.contains(e.target as Node)
      ) {
        setReactionPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [reactionPickerOpen]);

  const handleSaveEdit = useCallback(() => {
    const trimmed = editDraft.trim();
    if (trimmed === comment.message || !onUpdate) {
      setEditing(false);
      return;
    }
    setEditing(false);
    void onUpdate(comment.id, { message: trimmed });
  }, [comment.id, comment.message, editDraft, onUpdate]);

  const handleDelete = useCallback(() => {
    if (!onDelete) return;
    setDeleteModalOpen(false);
    void onDelete(comment.id);
  }, [comment.id, onDelete]);

  const handleToggleReaction = useCallback(async (emoji: string) => {
    if (!comment.id) return;
    const prevReactions = comment.reactions ?? {};
    const existing = prevReactions[emoji] ?? { userIds: [], userNames: [] };
    const isRemoving = currentUserId && existing.userIds.includes(currentUserId);

    const optimistic = { ...prevReactions };
    if (isRemoving && currentUserId) {
      const idx = existing.userIds.indexOf(currentUserId);
      const newUserIds = [...existing.userIds];
      const newUserNames = [...existing.userNames];
      newUserIds.splice(idx, 1);
      newUserNames.splice(idx, 1);
      if (newUserIds.length === 0) {
        delete optimistic[emoji];
      } else {
        optimistic[emoji] = { userIds: newUserIds, userNames: newUserNames };
      }
    } else if (currentUserId) {
      optimistic[emoji] = {
        userIds: [...existing.userIds, currentUserId],
        userNames: [...existing.userNames, currentUserName || "You"],
      };
    }

    onReactionsChanged?.(comment.id, optimistic);

    try {
      const serverReactions = await toggleReaction(comment.id, emoji);
      onReactionsChanged?.(comment.id, serverReactions);
    } catch {
      onReactionsChanged?.(comment.id, prevReactions);
    }
  }, [comment.id, comment.reactions, currentUserId, currentUserName, onReactionsChanged]);

  const avatarSize = size === "compact" ? "w-[28px] h-[28px]" : "w-[30px] h-[30px]";
  const textSize = "text-[14px]";
  const metaSize = "text-[12px]";

  return (
    <div className={`flex gap-2.5 group/item relative ${className} ${(comment.resolved || isThreadResolved) ? "opacity-60" : ""}`}>
      <div
        className={`${avatarSize} shrink-0 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-xs font-medium text-discussion-supporting overflow-hidden`}
      >
        {comment.userAvatar?.trim() ? (
          <img
            src={comment.userAvatar}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          comment.userName?.charAt(0) ?? "?"
        )}
      </div>

      <div className="flex-1 min-w-0">
        {!editing && (
          <div className="flex items-center flex-wrap gap-2">
            <span
              className={`font-semibold text-discussion-title text-[14px]`}
            >
              {comment.userName ?? "User"}
            </span>
            <span className={`text-meta ${metaSize}`}>
              {formatCommentDate(comment.createdAt)}
            </span>
            {showActionBar && (
              <div className="flex items-center gap-1 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity">
                {onReactionsChanged && (
                  <div className="relative">
                    <button
                      ref={reactionButtonRef}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (reactionButtonRef.current) {
                          setReactionAnchorRect(reactionButtonRef.current.getBoundingClientRect());
                        }
                        setReactionPickerOpen(v => !v);
                      }}
                      className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                      title="React"
                    >
                      <Smile className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                )}

                {onResolveToggle && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onResolveToggle(); }}
                    className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                    title={comment.resolved ? "Mark as unresolved" : "Mark as resolved"}
                  >
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                )}

                {canEditDelete && onUpdate && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                    className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                )}

                {canEditDelete && onDelete && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDeleteModalOpen(true); }}
                    className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!comment.threadId && ticketTitle && !editing && (
          <div className="max-h-0 overflow-hidden group-hover:max-h-[24px] transition-all duration-200 ease-out">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onNavigateToTicket?.(); }}
              className="text-[12px] font-medium text-[var(--brand)] hover:bg-[var(--surface-hover)] pl-0 pr-1.5 py-0.5 rounded-md transition-colors cursor-pointer truncate max-w-[180px]"
              title={ticketTitle}
            >
              {ticketTitle}
            </button>
          </div>
        )}

        {editing ? (
          <div className="flex-1 min-w-0">
            <div className="relative rounded-xl border border-[var(--border-strong)] bg-[var(--surface-input)] overflow-hidden focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20 transition">
              <textarea
                ref={editRef}
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setEditing(false); setEditDraft(comment.message); }
                  if (e.key === "Enter" && !e.shiftKey && editDraft.trim()) { e.preventDefault(); handleSaveEdit(); }
                }}
                className="block w-full min-h-[60px] px-3 pt-2.5 pb-10 text-[14px] leading-relaxed text-[var(--text-body)] placeholder:text-[var(--text-tertiary)] bg-transparent border-none outline-none resize-none"
                autoFocus
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setEditing(false); setEditDraft(comment.message); }}
                  className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-heading)] px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editDraft.trim() || editDraft.trim() === comment.message}
                  className="text-[12px] font-medium text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] px-3 py-1 rounded-md disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
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
            <p
              className={`mt-1.5 leading-relaxed text-discussion-body font-normal ${textSize}`}
            >
              {renderMessageWithMentions(comment.message)}
            </p>
            {/* Legacy single attachment */}
            {comment.attachment && !comment.attachments?.length && (
              <CommentAttachmentCard
                attachment={comment.attachment}
                onImageClick={(url, fileName) => setSelectedImage({ url, fileName })}
              />
            )}
            {/* New multi-attachment */}
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {comment.attachments.map((att, i) => (
                  <CommentAttachmentCard
                    key={i}
                    attachment={att}
                    onImageClick={(url, fileName) => setSelectedImage({ url, fileName })}
                  />
                ))}
              </div>
            )}
            {comment.reactions && Object.keys(comment.reactions).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(comment.reactions).map(([emoji, data]) => {
                  const isMine = currentUserId ? data.userIds.includes(currentUserId) : false;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => void handleToggleReaction(emoji)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] border transition-colors cursor-pointer ${
                        isMine
                          ? "bg-[var(--brand-subtle)] border-[var(--brand-muted)] text-[var(--brand)]"
                          : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-body)] hover:bg-[var(--surface-hover)]"
                      }`}
                      title={data.userNames.join("\n")}
                    >
                      <span className="text-[14px]">{emoji}</span>
                      {data.userIds.length > 1 && (
                        <span className="tabular-nums font-medium">{data.userIds.length}</span>
                      )}
                    </button>
                  );
                })}
              </div>
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
        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          role="alertdialog"
          ariaLabelledBy="delete-comment-title"
        >
          <div className="w-[420px] max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-xl p-6 cursor-default" onKeyDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <h2 id="delete-comment-title" className="text-lg font-semibold text-[var(--text-heading)]">
              Delete comment
            </h2>
            <p className="mt-2 text-sm text-secondary">
              Are you sure you want to delete this comment?
              This action cannot be undone.
            </p>
            <div className="mt-4 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]/80">
              <div className="flex gap-3">
                <div
                  className={`${avatarSize} shrink-0 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-xs font-medium text-discussion-supporting overflow-hidden`}
                >
                  {comment.userAvatar?.trim() ? (
                    <img
                      src={comment.userAvatar}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    comment.userName?.charAt(0) ?? "?"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[var(--text-heading)]">
                      {comment.userName ?? "User"}
                    </span>
                    <span className={`text-meta ${metaSize}`}>
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
                onClick={(e) => { e.stopPropagation(); setDeleteModalOpen(false); }}
                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-[var(--border)] text-neutral-700 hover:bg-[var(--surface-hover)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-[var(--color-danger)] text-white hover:opacity-95"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {reactionPickerOpen && createPortal(
        <div
          ref={reactionPickerRef}
          className="fixed z-[2147480001]"
          style={{
            top: (reactionAnchorRect?.bottom ?? 0) + 4,
            left: Math.min(reactionAnchorRect?.left ?? 0, window.innerWidth - 320),
          }}
        >
          <EmojiPicker
            onEmojiClick={async (emojiData) => {
              setReactionPickerOpen(false);
              await handleToggleReaction(emojiData.emoji);
            }}
            width={300}
            height={380}
            searchPlaceHolder="Search emoji..."
            previewConfig={{ showPreview: false }}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
