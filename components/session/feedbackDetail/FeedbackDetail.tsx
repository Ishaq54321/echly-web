"use client";

import React from "react";
import { FeedbackHeader } from "./FeedbackHeader";
import { FeedbackContent } from "./FeedbackContent";
import type { FeedbackItemShape } from "./types";

export interface FeedbackDetailProps {
  sessionId: string;
  selectedItem: (FeedbackItemShape & { index: number; total: number }) | null;
  isEditingDescription: boolean;
  descriptionDraft: string;
  setIsEditingDescription: (v: boolean) => void;
  setDescriptionDraft: (v: string) => void;
  saveDescription: () => void | Promise<void>;
  isSavingDescription?: boolean;
  saveDescriptionSuccess?: boolean;
  onSaveTitle?: (newTitle: string) => Promise<void>;
  onRequestDelete?: () => void;
  onSaveActionSteps?: (actionSteps: string[]) => Promise<void>;
  onSaveTags?: (suggestedTags: string[]) => Promise<void>;
  onResolvedChange?: (isResolved: boolean) => void;
  setIsImageExpanded: (v: boolean) => void;
  isCommentsOpen: boolean;
  onToggleActivity: () => void;
}

function FeedbackDetailInner({
  selectedItem,
  isEditingDescription,
  descriptionDraft,
  setIsEditingDescription,
  setDescriptionDraft,
  saveDescription,
  isSavingDescription,
  saveDescriptionSuccess,
  onSaveTitle,
  onRequestDelete,
  onSaveActionSteps,
  onSaveTags,
  onResolvedChange,
  setIsImageExpanded,
  isCommentsOpen,
  onToggleActivity,
}: FeedbackDetailProps) {
  if (!selectedItem) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center py-16">
        <p className="text-[15px] text-neutral-500">
          Select a feedback item
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      <FeedbackHeader
        item={selectedItem}
        isActivityOpen={isCommentsOpen}
        onToggleActivity={onToggleActivity}
        onSaveTitle={onSaveTitle}
        onRequestDelete={onRequestDelete}
        onResolvedChange={onResolvedChange}
      />
      <FeedbackContent
        item={selectedItem}
        isEditingDescription={isEditingDescription}
        descriptionDraft={descriptionDraft}
        setIsEditingDescription={setIsEditingDescription}
        setDescriptionDraft={setDescriptionDraft}
        saveDescription={saveDescription}
        isSavingDescription={isSavingDescription}
        saveDescriptionSuccess={saveDescriptionSuccess}
        onSaveActionSteps={onSaveActionSteps}
        onSaveTags={onSaveTags}
        onExpandImage={() => setIsImageExpanded(true)}
      />
    </div>
  );
}

export default React.memo(FeedbackDetailInner);
