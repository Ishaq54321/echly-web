"use client";

import React from "react";
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

function FeedbackList({
  items,
  expandedId,
  editingId,
  editedTitle,
  editedDescription,
  getHandlers,
}: FeedbackListProps) {
  return (
    <div className="capture-feedback-list flex flex-col space-y-2">
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
    </div>
  );
}

export default React.memo(FeedbackList);
