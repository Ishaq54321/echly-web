/**
 * FeedbackContent — marketing forklift of
 * components/session/feedbackDetail/FeedbackContent.tsx
 *
 * Modifications from source:
 * - Forklifts the read-only render path: attachment card (screenshot) →
 *   Description → Tags → Comments, in that order, with the same wrapper classes.
 * - The attachment card wrapper (`attachments rounded-[14px] overflow-hidden
 *   space-y-3 border border-[var(--hair)] shadow-[…]`) and the Tags section
 *   (`mt-12`, h2, `flex flex-wrap justify-start gap-3`) are verbatim.
 * - ScreenshotWithPins vs ScreenshotBlock branch → always DemoScreenshotBlock
 *   (read-only variant + static pin), per the build prompt.
 * - File-attachment list dropped (demo tickets have no files).
 * - Add-tag input/button dropped (read-only; onSaveTags is null in the demo).
 * - All data arrives from useStaticFeedbackController instead of the controller.
 */
"use client";

import { ActionItemsSection } from "./ActionItemsSection";
import { CommentsSection } from "./CommentsSection";
import { Tag } from "./Tag";
import { DemoScreenshotBlock } from "./DemoScreenshotBlock";
import type { MockTicket } from "./sessionMockData";
import type { StaticFeedbackController } from "./useStaticFeedbackController";

export function FeedbackContent({
  ticket,
  controller,
  onExpandImage,
}: {
  ticket: MockTicket;
  controller: StaticFeedbackController;
  onExpandImage?: () => void;
}) {
  const infoTooltip = [
    "Pricing Page → Hero Section",
    `${ticket.pageMetadata.browser} · ${ticket.pageMetadata.os}`,
    "May 18, 2025, 2:32 PM",
  ].join("\n");

  return (
    <div className="content-wrapper flex flex-col min-w-0">
      <section className="min-w-0">
        <div className="attachments rounded-[14px] overflow-hidden space-y-3 border border-[var(--hair)] shadow-[0_10px_30px_-16px_rgba(28,25,23,0.18)]">
          <DemoScreenshotBlock
            screenshot={ticket.screenshot}
            alt={ticket.title}
            infoTooltip={infoTooltip}
            pinTooltip={ticket.comments[0]?.body}
            onExpand={onExpandImage}
            onEdit={() => { /* no-op in the marketing demo */ }}
            canEdit
          />
        </div>
      </section>

      <ActionItemsSection
        description={controller.description}
        isResolved={ticket.status === "resolved"}
      />

      {controller.tags.length > 0 && (
        <section className="mt-12 min-w-0">
          <h2 className="text-[17px] font-semibold text-[var(--text-heading)] mb-3">Tags</h2>
          <div className="flex flex-wrap justify-start gap-3 max-w-full min-w-0">
            {controller.tags.map((tag, i) => (
              <Tag key={`${tag}-${i}`} name={tag} variant="default" />
            ))}
          </div>
        </section>
      )}

      <CommentsSection
        threads={controller.threads}
        currentUserInitial="AN"
        onSendComment={controller.sendComment}
      />
    </div>
  );
}
