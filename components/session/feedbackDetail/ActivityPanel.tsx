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
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b">
        <h2 className="text-sm font-semibold text-slate-900">Activity</h2>
      </div>

      <div className="px-6 py-4 border-b">
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
