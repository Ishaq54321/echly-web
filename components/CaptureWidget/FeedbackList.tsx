"use client";

import FeedbackItem, { type FeedbackItemHandlers } from "./FeedbackItem";
import type { StructuredFeedback } from "./types";

type FeedbackListProps = {
  items: StructuredFeedback[];
  expandedId: string | null;
  editingId: string | null;
  editedTitle: string;
  editedDescription: string;
  getHandlers: (item: StructuredFeedback) => FeedbackItemHandlers;
};

export default function FeedbackList({
  items,
  expandedId,
  editingId,
  editedTitle,
  editedDescription,
  getHandlers,
}: FeedbackListProps) {
  return (
    <>
      {items.map((p) => (
        <FeedbackItem
          key={p.id}
          item={p}
          isExpanded={expandedId === p.id}
          isEditing={editingId === p.id}
          editedTitle={editedTitle}
          editedDescription={editedDescription}
          handlers={getHandlers(p)}
        />
      ))}
    </>
  );
}
