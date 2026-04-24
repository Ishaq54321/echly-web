"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { Section } from "./Section";
import { ScreenshotBlock } from "./ScreenshotBlock";
import { ScreenshotWithPins } from "./ScreenshotWithPins";
import { SuggestionSection } from "./SuggestionSection";
import { DescriptionSection } from "./DescriptionSection";
import { ActionItemsSection } from "./ActionItemsSection";
import { Tag } from "@/components/ui/Tag";
import type { FeedbackItemShape } from "./types";
import type { Comment } from "@/lib/domain/comment";

interface FeedbackContentProps {
  item: FeedbackItemShape & { index?: number; total?: number };
  /** Parent resolves once via `useScreenshotUrl(selectedScreenshotId, …)`. */
  screenshotUrl: string | null;
  screenshotUrlLoading: boolean;
  screenshotUrlError: string | null;
  /** Read-only body text from public share / sanitized description (not editable). */
  readOnlyDescription?: string | null;
  onSaveActionSteps?: (actionSteps: string[]) => Promise<void>;
  onSaveTags?: (suggestedTags: string[]) => Promise<void>;
  onExpandImage: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
  isCommentMode?: boolean;
  comments?: Comment[];
  pinComments?: (Comment & { position: { xPercent: number; yPercent: number } })[];
  activePinId?: string;
  activeThreadId?: string | null;
  onPinClick?: (commentId: string) => void;
  onOpenThreadPanel?: (commentId: string) => void;
  onCloseInlinePopover?: () => void;
  sendPinComment?: (position: { xPercent: number; yPercent: number }, message: string) => Promise<string | null>;
  updateComment?: (commentId: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  sendTextComment?: (textRange: { startOffset: number; endOffset: number; containerId: string }, message: string) => Promise<string | null>;
  onCommentPlaced?: () => void;
  updatePinPosition?: (commentId: string, position: { xPercent: number; yPercent: number }) => Promise<void>;
  animatingPinId?: string | null;
}

export function FeedbackContent({
  item,
  screenshotUrl,
  screenshotUrlLoading,
  screenshotUrlError,
  readOnlyDescription = null,
  onSaveActionSteps,
  onSaveTags,
  onExpandImage,
  onEdit,
  canEdit,
  isCommentMode,
  comments = [],
  pinComments,
  activePinId,
  activeThreadId,
  onPinClick,
  onOpenThreadPanel,
  onCloseInlinePopover,
  sendPinComment,
  updateComment,
  sendTextComment,
  onCommentPlaced,
  updatePinPosition,
  animatingPinId,
}: FeedbackContentProps) {
  const actionSteps = Array.isArray(item.actionSteps) ? item.actionSteps : [];
  const tags = Array.isArray(item.suggestedTags) ? item.suggestedTags : [];
  const fileAttachments =
    item.publicAttachments?.filter((a): a is { kind: "file"; url: string; name?: string; size?: number } => a.kind === "file") ??
    [];
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");

  const handleRemoveTag = (tagToRemove: string) => {
    if (!onSaveTags) return;
    const next = tags.filter((t) => t !== tagToRemove);
    onSaveTags(next);
  };

  const roDesc = typeof readOnlyDescription === "string" ? readOnlyDescription.trim() : "";
  const hasAttachmentContent =
    Boolean(item.screenshotId?.trim()) || fileAttachments.length > 0;

  return (
    <div className="content-wrapper flex flex-col gap-4 min-w-0">
      {roDesc ? (
        <DescriptionSection description={roDesc} />
      ) : null}
      {hasAttachmentContent ? (
        <section className="min-w-0">
          <div className="section-header text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] flex items-center gap-1.5 mb-2">
            <Paperclip size={16} strokeWidth={1.8} className="shrink-0 text-[#6B7280]" aria-hidden />
            Attachments
          </div>
          <div className="attachments rounded-xl border border-[#E5E7EB] bg-white p-[14px] space-y-3">
            {item.screenshotId ? (
              sendPinComment != null ? (
                <ScreenshotWithPins
                  screenshotId={item.screenshotId}
                  screenshotUrl={screenshotUrl}
                  screenshotUrlLoading={screenshotUrlLoading}
                  screenshotUrlError={screenshotUrlError}
                  onExpand={onExpandImage}
                  isCommentMode={isCommentMode}
                  pins={pinComments ?? []}
                  comments={comments}
                  activePinId={activePinId}
                  activeThreadId={activeThreadId}
                  onPinClick={onPinClick}
                  onOpenThreadPanel={onOpenThreadPanel}
                  onCloseInlinePopover={onCloseInlinePopover}
                  onAddPinComment={sendPinComment}
                  updateComment={updateComment}
                  onCommentPlaced={onCommentPlaced}
                  onPinPositionChange={updatePinPosition}
                  onEdit={onEdit}
                  canEdit={canEdit}
                  embeddedInCard
                  animatingPinId={animatingPinId}
                />
              ) : (
                <ScreenshotBlock
                  screenshotId={item.screenshotId}
                  screenshotUrl={screenshotUrl}
                  screenshotUrlLoading={screenshotUrlLoading}
                  screenshotUrlError={screenshotUrlError}
                  onExpand={onExpandImage}
                  onEdit={onEdit}
                  canEdit={canEdit}
                  embeddedInCard
                />
              )
            ) : null}
            {fileAttachments.length > 0 ? (
              <ul className="list-none m-0 p-0 space-y-2">
                {fileAttachments.map((f, i) => (
                  <li key={`${f.url}-${i}`}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] font-medium text-[#1775E0] hover:underline break-all"
                    >
                      {f.name?.trim() ? f.name : f.url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}
      {item.suggestion != null && item.suggestion !== "" && (
        <SuggestionSection suggestion={item.suggestion} />
      )}
      <ActionItemsSection
        actionSteps={actionSteps}
        onSave={onSaveActionSteps}
        isResolved={item.isResolved ?? false}
      />
      {(onSaveTags != null || (Array.isArray(item.suggestedTags) && item.suggestedTags.length > 0)) && (
        <Section title="Tags" titleMuted>
          <div className="flex flex-wrap justify-start gap-2 mt-3 max-w-full min-w-0">
            {tags.map((tag, i) => (
              <Tag key={`${tag}-${i}`} name={tag} variant="default">
                {onSaveTags && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveTag(tag);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-colors duration-120 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] cursor-pointer"
                    aria-label={`Remove ${tag}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                      <path d="M2 2l8 8M10 2L2 10" />
                    </svg>
                  </button>
                )}
              </Tag>
            ))}
            {onSaveTags && (
              isAddingTag ? (
                <input
                  type="text"
                  value={newTagValue}
                  onChange={(e) => {
                    if (e.target.value.length <= 25) setNewTagValue(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTagValue.trim()) {
                      const trimmed = newTagValue.trim();
                      onSaveTags([...tags, trimmed]);
                      setNewTagValue("");
                      setIsAddingTag(false);
                    }
                    if (e.key === "Escape") {
                      setNewTagValue("");
                      setIsAddingTag(false);
                    }
                  }}
                  onBlur={() => {
                    if (newTagValue.trim()) {
                      onSaveTags([...tags, newTagValue.trim()]);
                    }
                    setNewTagValue("");
                    setIsAddingTag(false);
                  }}
                  maxLength={25}
                  placeholder="Type tag..."
                  autoFocus
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] text-xs font-medium text-[var(--text-body)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]/20 w-[120px] transition-colors"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-dashed text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] transition-all duration-150 text-xs font-medium cursor-pointer"
                >
                  + Add tag
                </button>
              )
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
