"use client";

import React from "react";
import FeedbackItem from "./FeedbackItem";
import type { StructuredFeedback } from "./types";

type FeedbackListProps = {
  items: StructuredFeedback[];
  expandedId: string | null;
  editingId: string | null;
  editedTitle: string;
  editedDescription: string;
  onExpand: (id: string | null) => void;
  onStartEdit: (item: StructuredFeedback) => void;
  onSaveEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onEditedTitleChange: (value: string) => void;
  onEditedDescriptionChange: (value: string) => void;
  highlightTicketId?: string | null;
};

function FeedbackList({
  items,
  expandedId,
  editingId,
  editedTitle,
  editedDescription,
  onExpand,
  onStartEdit,
  onSaveEdit,
  onDelete,
  onEditedTitleChange,
  onEditedDescriptionChange,
  highlightTicketId = null,
}: FeedbackListProps) {
  return (
    <div className="capture-feedback-list echly-feedback-list flex flex-col gap-3">
      {items.map((p) => (
        <FeedbackItem
          key={p.id}
          item={p}
          expandedId={expandedId}
          editingId={editingId}
          editedTitle={editedTitle}
          editedDescription={editedDescription}
          onExpand={onExpand}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onDelete={onDelete}
          onEditedTitleChange={onEditedTitleChange}
          onEditedDescriptionChange={onEditedDescriptionChange}
          highlightTicketId={highlightTicketId}
        />
      ))}
    </div>
  );
}

export default React.memo(FeedbackList);
