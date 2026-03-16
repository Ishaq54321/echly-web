"use client";

import React from "react";
import FeedbackItem from "@/lib/capture-engine/core/FeedbackItem";
import type { StructuredFeedback } from "@/lib/capture-engine/core/types";

type FeedbackListProps = {
  items: StructuredFeedback[];
  onUpdate: (id: string, payload: { title: string; actionSteps: string[] }) => Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  highlightTicketId?: string | null;
};

function FeedbackList({
  items,
  onUpdate,
  onDelete,
  highlightTicketId = null,
}: FeedbackListProps) {
  return (
    <div className="capture-feedback-list echly-feedback-list flex flex-col gap-3">
      {items.map((p) => (
        <FeedbackItem
          key={p.id}
          item={p}
          onUpdate={onUpdate}
          onDelete={onDelete}
          highlightTicketId={highlightTicketId}
        />
      ))}
    </div>
  );
}

export default React.memo(FeedbackList);
