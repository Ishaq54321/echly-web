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
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex-1 flex items-center justify-center p-10">
          <p className="text-sm text-slate-500">Select a feedback item</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm">
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <FeedbackHeader
            title={selectedItem.title}
            index={selectedItem.index}
            total={selectedItem.total}
            isActivityOpen={isCommentsOpen}
            onToggleActivity={onToggleActivity}
          />
        </div>
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
    </div>
  );
}
