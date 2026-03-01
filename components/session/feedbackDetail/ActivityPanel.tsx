"use client";

import { useState } from "react";
import type { Comment } from "@/lib/comments";
import { ActivityComposer } from "./ActivityComposer";
import { ActivityThread } from "./ActivityThread";

interface ActivityPanelProps {
  comments: Comment[];
  loading: boolean;
  sendComment: (message: string) => void;
}

export function ActivityPanel({
  comments,
  loading,
  sendComment,
}: ActivityPanelProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendComment(trimmed);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-6 pt-4 pb-4 border-b border-neutral-200">
        <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Activity</h2>
      </div>

      <div className="shrink-0 px-6 py-4 border-b border-neutral-100">
        <ActivityComposer
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={handleSend}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        <ActivityThread comments={comments} loading={loading} />
      </div>
    </div>
  );
}
