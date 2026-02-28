"use client";

import { DescriptionSection } from "./DescriptionSection";
import { Section } from "./Section";
import { ScreenshotBlock } from "./ScreenshotBlock";
import { SuggestionSection } from "./SuggestionSection";
import type { FeedbackItemShape } from "./types";

interface FeedbackContentProps {
  item: FeedbackItemShape & { index?: number; total?: number };
  isEditingDescription: boolean;
  descriptionDraft: string;
  setIsEditingDescription: (v: boolean) => void;
  setDescriptionDraft: (v: string) => void;
  saveDescription: () => void;
  onExpandImage: () => void;
}

export function FeedbackContent({
  item,
  isEditingDescription,
  descriptionDraft,
  setIsEditingDescription,
  setDescriptionDraft,
  saveDescription,
  onExpandImage,
}: FeedbackContentProps) {
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
    </>
  );
}
