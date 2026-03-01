"use client";

import { DescriptionSection } from "./DescriptionSection";
import { Section } from "./Section";
import { ScreenshotBlock } from "./ScreenshotBlock";
import { SuggestionSection } from "./SuggestionSection";
import { ActionItemsSection } from "./ActionItemsSection";
import type { FeedbackItemShape } from "./types";

interface FeedbackContentProps {
  item: FeedbackItemShape & { index?: number; total?: number };
  isEditingDescription: boolean;
  descriptionDraft: string;
  setIsEditingDescription: (v: boolean) => void;
  setDescriptionDraft: (v: string) => void;
  saveDescription: () => void | Promise<void>;
  onSaveActionItems?: (actionItems: string[]) => Promise<void>;
  onExpandImage: () => void;
}

export function FeedbackContent({
  item,
  isEditingDescription,
  descriptionDraft,
  setIsEditingDescription,
  setDescriptionDraft,
  saveDescription,
  onSaveActionItems,
  onExpandImage,
}: FeedbackContentProps) {
  const actionItems = Array.isArray(item.actionItems) ? item.actionItems : [];

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
      {onSaveActionItems ? (
        <ActionItemsSection
          actionItems={actionItems}
          onSave={onSaveActionItems}
        />
      ) : (
        actionItems.length > 0 && (
          <Section title="Action items">
            <ul className="list-disc list-inside space-y-1">
              {actionItems.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </Section>
        )
      )}
      {item.impact && (
        <Section title="Impact">
          <p>{item.impact}</p>
        </Section>
      )}
      {Array.isArray(item.suggestedTags) && item.suggestedTags.length > 0 && (
        <Section title="Tags">
          <div className="flex flex-wrap gap-1.5">
            {item.suggestedTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md bg-[hsl(var(--surface-3))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--text-secondary))]"
              >
                {tag}
              </span>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
