"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Comment } from "@/lib/comments";
import { CommentItem } from "@/components/comments/CommentItem";

export interface ActivityThreadProps {
  comments: Comment[];
  loading: boolean;
  currentUserId?: string | null;
  onUpdateComment?: (commentId: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
}

export function ActivityThread({
  comments,
  loading,
  currentUserId = null,
  onUpdateComment,
  onDeleteComment,
}: ActivityThreadProps) {
  if (loading) {
    return (
      <div className="text-sm text-slate-400 py-6">Loading…</div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-500">
          No comments yet. Start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <AnimatePresence initial={false}>
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="py-4 rounded-lg px-2 -mx-2 hover:bg-[#E9ECEB] transition-colors duration-150"
          >
            <CommentItem
              comment={comment}
              currentUserId={currentUserId}
              onUpdate={onUpdateComment}
              onDelete={onDeleteComment}
              size="compact"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
