"use client";

import React from "react";
import { FeedbackHeader } from "./FeedbackHeader";
import { FeedbackContent } from "./FeedbackContent";
import type { FeedbackItemShape } from "./types";
import { useScreenshotUrl } from "@/lib/client/useScreenshotUrl";

export interface FeedbackDetailProps {
  sessionId: string;
  selectedItem: (FeedbackItemShape & { index: number; total: number }) | null;
  onSaveTitle?: (newTitle: string) => Promise<void>;
  onRequestDelete?: () => void;
  onSaveActionSteps?: (actionSteps: string[]) => Promise<void>;
  onSaveTags?: (suggestedTags: string[]) => Promise<void>;
  onResolvedChange?: (isResolved: boolean) => void;
  setIsImageExpanded: (v: boolean) => void;
  onEdit?: () => void;
  canEdit?: boolean;
  isCommentsOpen: boolean;
  onToggleActivity: () => void;
}

function FeedbackDetailInner({
  sessionId,
  selectedItem,
  onSaveTitle,
  onRequestDelete,
  onSaveActionSteps,
  onSaveTags,
  onResolvedChange,
  setIsImageExpanded,
  onEdit,
  canEdit,
  isCommentsOpen,
  onToggleActivity,
}: FeedbackDetailProps) {
  const {
    url: screenshotUrl,
    loading: screenshotUrlLoading,
    error: screenshotUrlError,
  } = useScreenshotUrl(selectedItem?.screenshotId, {
    sessionId: sessionId.trim(),
  });

  if (!selectedItem) {
    return (
      <div className="flex flex-1 min-h-0 items-start py-12 font-sans">
        <p className="text-[15px] text-[var(--text-tertiary)]">
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
        screenshotUrl={screenshotUrl}
        screenshotUrlLoading={screenshotUrlLoading}
        screenshotUrlError={screenshotUrlError}
        onSaveActionSteps={onSaveActionSteps}
        onSaveTags={onSaveTags}
        onExpandImage={() => setIsImageExpanded(true)}
        onEdit={onEdit}
        canEdit={canEdit}
      />
    </div>
  );
}

export default React.memo(FeedbackDetailInner);
