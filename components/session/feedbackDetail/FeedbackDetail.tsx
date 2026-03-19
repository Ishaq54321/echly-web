"use client";

import React from "react";
import { FeedbackHeader } from "./FeedbackHeader";
import { FeedbackContent } from "./FeedbackContent";
import type { FeedbackItemShape } from "./types";

export interface FeedbackDetailProps {
  sessionId: string;
  selectedItem: (FeedbackItemShape & { index: number; total: number }) | null;
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
      <div className="flex flex-1 min-h-0 items-start py-12 font-sans">
        <p className="text-[15px] text-[hsl(var(--text-tertiary))]">
          Select a feedback item
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 font-sans px-6 pt-4">
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
        onSaveActionSteps={onSaveActionSteps}
        onSaveTags={onSaveTags}
        onExpandImage={() => setIsImageExpanded(true)}
      />
    </div>
  );
}

export default React.memo(FeedbackDetailInner);
