"use client";

import { useState, useRef, useEffect } from "react";
import { DescriptionSection } from "./DescriptionSection";
import { Section } from "./Section";
import { ScreenshotBlock } from "./ScreenshotBlock";
import { SuggestionSection } from "./SuggestionSection";
import { ActionItemsSection } from "./ActionItemsSection";
import { Tag } from "@/components/ui/Tag";
import { AVAILABLE_TAGS, getTagDotClass } from "@/lib/tagConfig";
import type { FeedbackItemShape } from "./types";

interface FeedbackContentProps {
  item: FeedbackItemShape & { index?: number; total?: number };
  isEditingDescription: boolean;
  descriptionDraft: string;
  setIsEditingDescription: (v: boolean) => void;
  setDescriptionDraft: (v: string) => void;
  saveDescription: () => void | Promise<void>;
  isSavingDescription?: boolean;
  saveDescriptionSuccess?: boolean;
  onSaveActionSteps?: (actionSteps: string[]) => Promise<void>;
  onSaveTags?: (suggestedTags: string[]) => Promise<void>;
  onExpandImage: () => void;
}

export function FeedbackContent({
  item,
  isEditingDescription,
  descriptionDraft,
  setIsEditingDescription,
  setDescriptionDraft,
  saveDescription,
  isSavingDescription,
  saveDescriptionSuccess,
  onSaveActionSteps,
  onSaveTags,
  onExpandImage,
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
      <DescriptionSection
        description={item.description}
        isEditing={isEditingDescription}
        draft={descriptionDraft}
        onEdit={() => setIsEditingDescription(true)}
        onDraftChange={setDescriptionDraft}
        onSave={saveDescription}
        onCancel={() => {
          setDescriptionDraft(item.description);
          setIsEditingDescription(false);
        }}
        isSaving={isSavingDescription}
        saveSuccess={saveDescriptionSuccess}
      />
      {item.screenshotUrl && (
        <Section title="Attachments">
          <ScreenshotBlock
            screenshotUrl={item.screenshotUrl}
            onExpand={onExpandImage}
          />
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
                  {action}
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
                    <p className="text-[14px] text-neutral-500">All tags added</p>
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
