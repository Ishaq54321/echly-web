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
}: FeedbackListProps) {
  return (
    <div className="capture-feedback-list flex flex-col space-y-2">
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
        />
      ))}
    </div>
  );
}

export default React.memo(FeedbackList);
