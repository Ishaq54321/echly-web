/**
 * ActionItemsSection — marketing forklift of
 * components/session/feedbackDetail/ActionItemsSection.tsx (read-only path only).
 *
 * Modifications from source:
 * - The demo descriptions are plain text and the section is read-only (no onSave),
 *   so only the read-only display branch is forklifted. Stripped: edit state,
 *   DescriptionEditor (Tiptap), ColorPickerPopover, hex-swatch editing, the
 *   imperative canLeave/discardAndClose handle, and DescriptionMarkdown.
 * - The heading + card wrapper classes (`mt-12 mb-2`, the h2) are verbatim.
 * - Renders the description as a prose <p> using DescriptionMarkdown's read-only
 *   prose classes (`text-[15px] leading-[1.7]`) — faithful for plain text.
 * - Empty + read-only → "No description" exactly as source.
 */
"use client";

const cardClass = "mt-12 mb-2";

export function ActionItemsSection({
  description,
  isResolved = false,
}: {
  description: string;
  isResolved?: boolean;
}) {
  const heading = (
    <h2 className="text-[17px] font-semibold text-[var(--text-heading)] mb-3">
      Description
    </h2>
  );

  if (!description.trim()) {
    return (
      <div className={cardClass}>
        {heading}
        <p className="text-[15px] leading-[1.7] text-[var(--text-tertiary)]">
          No description
        </p>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      {heading}
      <div className="group relative flex items-start justify-between gap-2">
        <div
          className={`text-[15px] leading-[1.7] flex-1 pr-0 ${
            isResolved ? "text-[var(--text-tertiary)]" : "text-[var(--text-body)]"
          }`}
        >
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
