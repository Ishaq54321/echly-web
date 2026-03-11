"use client";

import { useState, useRef, useEffect } from "react";
import { Section } from "./Section";
import { ScreenshotBlock } from "./ScreenshotBlock";
import { ScreenshotWithPins } from "./ScreenshotWithPins";
import { SuggestionSection } from "./SuggestionSection";
import { ActionItemsSection } from "./ActionItemsSection";
import { Tag } from "@/components/ui/Tag";
import { formatActionStep } from "@/lib/formatters/formatActionStep";
import { AVAILABLE_TAGS, getTagDotClass } from "@/lib/tagConfig";
import type { FeedbackItemShape } from "./types";
import type { Comment } from "@/lib/domain/comment";

interface FeedbackContentProps {
  item: FeedbackItemShape & { index?: number; total?: number };
  onSaveActionSteps?: (actionSteps: string[]) => Promise<void>;
  onSaveTags?: (suggestedTags: string[]) => Promise<void>;
  onExpandImage: () => void;
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
}

export function FeedbackContent({
  item,
  onSaveActionSteps,
  onSaveTags,
  onExpandImage,
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
}: FeedbackContentProps) {
  const actionSteps = Array.isArray(item.actionSteps) ? item.actionSteps : [];
  const tags = Array.isArray(item.suggestedTags) ? item.suggestedTags : [];
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [dropdownAnimate, setDropdownAnimate] = useState(false);
  const tagPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tagPopoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (tagPopoverRef.current && !tagPopoverRef.current.contains(e.target as Node)) {
        setTagPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tagPopoverOpen]);

  useEffect(() => {
    if (tagPopoverOpen) {
      const t = requestAnimationFrame(() => setDropdownAnimate(true));
      return () => cancelAnimationFrame(t);
    }
    const t = requestAnimationFrame(() => setDropdownAnimate(false));
    return () => cancelAnimationFrame(t);
  }, [tagPopoverOpen]);

  const handleRemoveTag = (tagToRemove: string) => {
    if (!onSaveTags) return;
    const next = tags.filter((t) => t !== tagToRemove);
    onSaveTags(next);
  };

  const handleAddTag = (tag: string) => {
    if (!onSaveTags || tags.includes(tag)) return;
    onSaveTags([...tags, tag]);
    setTagPopoverOpen(false);
  };

  const tagsToOffer = AVAILABLE_TAGS.filter((t) => !tags.includes(t));

  return (
    <>
      {item.screenshotUrl && (
        <Section title="Attachments">
          {sendPinComment != null ? (
            <ScreenshotWithPins
              screenshotUrl={item.screenshotUrl}
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
            />
          ) : (
            <ScreenshotBlock
              screenshotUrl={item.screenshotUrl}
              onExpand={onExpandImage}
            />
          )}
        </Section>
      )}
      {item.suggestion != null && item.suggestion !== "" && (
        <SuggestionSection suggestion={item.suggestion} />
      )}
      {onSaveActionSteps ? (
        <ActionItemsSection
          actionSteps={actionSteps}
          onSave={onSaveActionSteps}
          isResolved={item.isResolved ?? false}
        />
      ) : (
        actionSteps.length > 0 && (
          <Section title="ACTION STEPS" titleSemantic="attention">
            <ul className="list-none space-y-2 p-0 m-0">
              {actionSteps.map((action, i) => (
                <li key={i} className="font-mono text-[13px] text-[hsl(var(--text-primary-strong))] border border-[var(--layer-2-border)] bg-white px-2 py-1 rounded-lg inline-block">
                  {formatActionStep(action)}
                </li>
              ))}
            </ul>
          </Section>
        )
      )}
      {(onSaveTags != null || (Array.isArray(item.suggestedTags) && item.suggestedTags.length > 0)) && (
        <Section title="Tags" titleMuted>
          <div className="flex flex-wrap gap-2 mt-3 max-w-full">
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
              <div className="relative" ref={tagPopoverRef}>
                <button
                  type="button"
                  onClick={() => setTagPopoverOpen((o) => !o)}
                  className="text-[14px] font-medium px-3 py-1 rounded-full border border-dashed border-[var(--layer-2-border)] text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-120 ease-out cursor-pointer"
                >
                  + Add tag
                </button>
                {tagPopoverOpen && tagsToOffer.length > 0 && (
                  <div
                    className={`absolute left-0 top-full mt-1.5 z-20 min-w-[180px] bg-white border border-neutral-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2 transition-all duration-[120ms] ease-out ${
                      dropdownAnimate ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
                    }`}
                  >
                    {tagsToOffer.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--layer-2-hover-bg)] cursor-pointer transition-colors duration-120 text-left"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${getTagDotClass(tag)}`}
                          aria-hidden
                        />
                        <span className="text-[15px] text-neutral-800">{tag}</span>
                      </button>
                    ))}
                  </div>
                )}
                {tagPopoverOpen && tagsToOffer.length === 0 && (
                  <div
                    className={`absolute left-0 top-full mt-1.5 z-20 min-w-[180px] bg-white border border-neutral-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2 px-3 transition-all duration-[120ms] ease-out ${
                      dropdownAnimate ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
                    }`}
                  >
                    <p className="text-[14px] text-secondary">All tags added</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>
      )}
    </>
  );
}
