"use client";

import { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, CircleCheck, SmilePlus } from "lucide-react";
import dynamic from "next/dynamic";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import type { Comment } from "@/lib/domain/comment";
import { formatCommentDate } from "@/lib/utils/formatCommentDate";
import { NAME_FALLBACK } from "@/lib/utils/nameSplit";
import { CommentAttachmentCard } from "@/components/discussion/CommentAttachmentCard";
import { ImageViewer } from "@/components/ImageViewer";
import { Modal } from "@/components/ui/Modal";
import { Tooltip } from "@/components/ui/Tooltip";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useUserAvatar } from "@/lib/hooks/useUserAvatars";
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
  isThreadResolved?: boolean;
}

const MENTION_TOKEN_RE = /@\[([^\]]+)\]\(([^)]*)\)|@\S+/g;
const MENTION_MARKER_RE = /@\[([^\]]+)\]\(([^)]*)\)/g;

function flattenMentionsForEdit(message: string): { text: string; idByLabel: Map<string, string> } {
  const idByLabel = new Map<string, string>();
  const text = message.replace(MENTION_MARKER_RE, (_full, label: string, id: string) => {
    if (label && id && !idByLabel.has(label)) idByLabel.set(label, id);
    return `@${label}`;
  });
  return { text, idByLabel };
}

function restitchMentionsAfterEdit(text: string, idByLabel: Map<string, string>): string {
  if (idByLabel.size === 0) return text;
  const labels = [...idByLabel.keys()].sort((a, b) => b.length - a.length);
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "@") {
      let matched: string | null = null;
      for (const label of labels) {
        if (text.startsWith(label, i + 1)) {
          matched = label;
          break;
        }
      }
      if (matched) {
        out += `@[${matched}](${idByLabel.get(matched)})`;
        i += matched.length + 1;
        continue;
      }
    }
    out += text[i];
    i += 1;
  }
  return out;
}

const URL_TOKEN_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

// Split a plain-text run into nodes, rendering any URLs as styled links.
function renderTextWithLinks(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  URL_TOKEN_RE.lastIndex = 0;
  while ((match = URL_TOKEN_RE.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    let url = match[0];
    // Trailing punctuation usually isn't part of the URL (e.g. "see https://x.com.").
    let trailing = "";
    while (/[.,!?;:)\]]$/.test(url)) {
      trailing = url.slice(-1) + trailing;
      url = url.slice(0, -1);
    }
    const href = url.startsWith("www.") ? `https://${url}` : url;
    nodes.push(
      <a
        key={`${keyPrefix}-l-${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="comment-link"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );
    if (trailing) nodes.push(trailing);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

// Position the emoji reaction picker so it always stays within the viewport:
// flip above the trigger when there's no room below, and clamp horizontally.
const REACTION_PICKER_W = 300;
const REACTION_PICKER_H = 380;
function getReactionPickerStyle(anchor: DOMRect | null): React.CSSProperties {
  const GAP = 4;
  const MARGIN = 8;
  if (!anchor || typeof window === "undefined") {
    return { top: (anchor?.bottom ?? 0) + GAP, left: anchor?.left ?? 0 };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Horizontal: prefer aligning to the trigger's left, then keep inside.
  const left = Math.max(MARGIN, Math.min(anchor.left, vw - REACTION_PICKER_W - MARGIN));

  // Vertical: open below if it fits, otherwise above, otherwise clamp on-screen.
  const fitsBelow = anchor.bottom + GAP + REACTION_PICKER_H <= vh - MARGIN;
  const fitsAbove = anchor.top - GAP - REACTION_PICKER_H >= MARGIN;
  let top: number;
  if (fitsBelow) {
    top = anchor.bottom + GAP;
  } else if (fitsAbove) {
    top = anchor.top - GAP - REACTION_PICKER_H;
  } else {
    top = Math.max(MARGIN, vh - REACTION_PICKER_H - MARGIN);
  }
  return { top, left };
}

function renderMessageWithMentions(message: string) {
  if (!message) return null;
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  MENTION_TOKEN_RE.lastIndex = 0;
  while ((match = MENTION_TOKEN_RE.exec(message)) !== null) {
    if (match.index > cursor) {
      out.push(...renderTextWithLinks(message.slice(cursor, match.index), `t-${key}`));
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
    out.push(...renderTextWithLinks(message.slice(cursor), `t-${key}`));
  }
  return out;
}

function CommentItemBase({
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
  isThreadResolved,
}: CommentItemProps) {
  const editFlattened = useMemo(() => flattenMentionsForEdit(comment.message), [comment.message]);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(editFlattened.text);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; fileName: string } | null>(null);
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const [reactionAnchorRect, setReactionAnchorRect] = useState<DOMRect | null>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);

  // Phase 25.3: the comments realtime listener only carries the stale
  // denormalized comment.userAvatar snapshot (frozen at write time). Resolve
  // the commenter's avatar LIVE from users/{uid} so it updates the instant
  // they change their photo. Falls back to the snapshot while the user doc
  // is still loading or if the read is denied, so we never flash to initials
  // for a user who does have a photo.
  const liveAvatar = useUserAvatar(comment.userId);
  const resolvedAvatar = liveAvatar ?? comment.userAvatar ?? null;

  const isPending = (comment as { isOptimistic?: boolean }).isOptimistic === true;
  const canEditDelete = comment.userId === currentUserId && !isPending;
  const showActionBar = (canEditDelete && (onUpdate || onDelete)) || Boolean(additionalMenuItems) || Boolean(onResolveToggle) || Boolean(onReactionsChanged);

  useEffect(() => {
    setEditDraft(editFlattened.text);
  }, [editFlattened]);

  const autosizeEdit = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, []);

  useEffect(() => {
    if (editing && editRef.current) {
      const el = editRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      autosizeEdit(el);
    }
  }, [editing, autosizeEdit]);

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
    const restitched = restitchMentionsAfterEdit(trimmed, editFlattened.idByLabel);
    if (restitched === comment.message || !onUpdate) {
      setEditing(false);
      return;
    }
    setEditing(false);
    void onUpdate(comment.id, { message: restitched });
  }, [comment.id, comment.message, editDraft, editFlattened, onUpdate]);

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
      <UserAvatar
        avatarUrl={resolvedAvatar}
        name={comment.userName}
        colorSeed={comment.userId}
        className={`${avatarSize} text-xs`}
      />

      <div className="flex-1 min-w-0">
        {!editing && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`font-semibold text-discussion-title text-[14px] truncate`}
              >
                {comment.userName ?? NAME_FALLBACK.UNKNOWN}
              </span>
              <span className={`text-meta ${metaSize} whitespace-nowrap flex-shrink-0`}>
                {formatCommentDate(comment.createdAt)}
              </span>
            </div>
            {showActionBar && (
              <div className="flex items-center gap-1 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0">
                {onReactionsChanged && (
                  <Tooltip content="React">
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
                      className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <SmilePlus className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </Tooltip>
                )}

                {onResolveToggle && (
                  <Tooltip content={comment.resolved ? "Mark as unresolved" : "Mark as resolved"}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onResolveToggle(); }}
                      className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <CircleCheck className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </Tooltip>
                )}

                {canEditDelete && onUpdate && (
                  <Tooltip content="Edit">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                      className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </Tooltip>
                )}

                {canEditDelete && onDelete && (
                  <Tooltip content="Delete">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDeleteModalOpen(true); }}
                      className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        )}

        {editing ? (
          <div className="flex-1 min-w-0">
            <div className="relative rounded-xl border border-[var(--border-strong)] bg-[var(--surface-input)] overflow-hidden focus-within:border-[var(--border-strong)] transition-colors duration-150">
              <textarea
                ref={editRef}
                value={editDraft}
                rows={1}
                onChange={(e) => { setEditDraft(e.target.value); autosizeEdit(e.currentTarget); }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Escape") { setEditing(false); setEditDraft(editFlattened.text); }
                  if (e.key === "Enter" && !e.shiftKey && editDraft.trim()) { e.preventDefault(); handleSaveEdit(); }
                }}
                className="block w-full min-h-[38px] max-h-[320px] overflow-y-auto px-3 pt-2.5 pb-10 text-[14px] leading-relaxed text-[var(--text-body)] placeholder:text-[var(--text-tertiary)] bg-transparent border-none outline-none resize-none"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setEditing(false); setEditDraft(editFlattened.text); }}
                  className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-heading)] px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editDraft.trim()}
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
              className={`mt-1.5 leading-relaxed text-discussion-body font-normal whitespace-pre-wrap break-words ${textSize}`}
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
                {Object.entries(comment.reactions)
                  .filter(([, data]) => Array.isArray(data?.userIds) && data.userIds.length > 0)
                  .map(([emoji, data]) => {
                  const isMine = currentUserId ? data.userIds.includes(currentUserId) : false;
                  return (
                    <Tooltip key={emoji} content={data.userNames.join(", ")}>
                      <button
                        type="button"
                        onClick={() => void handleToggleReaction(emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] border transition-colors cursor-pointer ${
                          isMine
                            ? "bg-[var(--brand-subtle)] border-[var(--brand-muted)] text-[var(--brand)]"
                            : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-body)] hover:bg-[var(--surface-hover)]"
                        }`}
                      >
                        <span className="text-[14px]">{emoji}</span>
                        {data.userIds.length > 1 && (
                          <span className="tabular-nums font-medium">{data.userIds.length}</span>
                        )}
                      </button>
                    </Tooltip>
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
                <UserAvatar
                  avatarUrl={resolvedAvatar}
                  name={comment.userName}
                  colorSeed={comment.userId}
                  className={`${avatarSize} text-xs`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[var(--text-heading)]">
                      {comment.userName ?? NAME_FALLBACK.UNKNOWN}
                    </span>
                    <span className={`text-meta ${metaSize}`}>
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-body)] line-clamp-2 break-words">
                    {comment.message.replace(/@\[([^\]]+)\]\([^)]*\)/g, "@$1")}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setDeleteModalOpen(false); }}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--color-danger)] text-white text-[14px] font-medium hover:opacity-95 transition-all cursor-pointer"
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
          style={getReactionPickerStyle(reactionAnchorRect)}
        >
          <EmojiPicker
            onEmojiClick={async (emojiData: { emoji: string }) => {
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

export const CommentItem = memo(CommentItemBase);
