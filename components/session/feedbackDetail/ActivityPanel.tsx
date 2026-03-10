"use client";

import { useState } from "react";
import type { Comment } from "@/lib/comments";
import { ActivityComposer } from "./ActivityComposer";
import { ActivityThread } from "./ActivityThread";

interface ActivityPanelProps {
  comments: Comment[];
  loading: boolean;
  sendComment: (message: string) => void;
  currentUserId?: string | null;
  onUpdateComment?: (commentId: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
}

export function ActivityPanel({
  comments,
  loading,
  sendComment,
  currentUserId = null,
  onUpdateComment,
  onDeleteComment,
}: ActivityPanelProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendComment(trimmed);
    setNewMessage("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-6 pt-4 pb-4 border-b border-[var(--layer-2-border)]">
        <h2 className="text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--text-tertiary))]">Activity</h2>
      </div>

      <div className="shrink-0 px-6 py-4 border-b border-[var(--layer-2-border)]">
        <ActivityComposer
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={handleSend}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2">
        <div className="px-6 py-6">
          <ActivityThread
            comments={comments}
            loading={loading}
            currentUserId={currentUserId}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
          />
        </div>
      </div>
    </div>
  );
}
