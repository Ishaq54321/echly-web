"use client";

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
  saveDescription: () => void;
  setIsImageExpanded: (v: boolean) => void;
  isCommentsOpen: boolean;
  onToggleActivity: () => void;
}

export default function FeedbackDetail({
  selectedItem,
  isEditingDescription,
  descriptionDraft,
  setIsEditingDescription,
  setDescriptionDraft,
  saveDescription,
  setIsImageExpanded,
  isCommentsOpen,
  onToggleActivity,
}: FeedbackDetailProps) {
  if (!selectedItem) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 flex items-center justify-center py-16">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Select a feedback item
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      <FeedbackHeader
        item={selectedItem}
        isActivityOpen={isCommentsOpen}
        onToggleActivity={onToggleActivity}
      />
      <FeedbackContent
        item={selectedItem}
        isEditingDescription={isEditingDescription}
        descriptionDraft={descriptionDraft}
        setIsEditingDescription={setIsEditingDescription}
        setDescriptionDraft={setDescriptionDraft}
        saveDescription={saveDescription}
        onExpandImage={() => setIsImageExpanded(true)}
      />
    </div>
  );
}
