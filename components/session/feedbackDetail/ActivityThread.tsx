"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Comment } from "@/lib/comments";

interface ActivityThreadProps {
  comments: Comment[];
  loading: boolean;
}

export function ActivityThread({ comments, loading }: ActivityThreadProps) {
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
    <div className="space-y-5">
      <AnimatePresence initial={false}>
        {comments.map((comment) => {
          let timestamp: Date | null = null;
          if (comment.createdAt?.seconds) {
            timestamp = new Date(comment.createdAt.seconds * 1000);
          }
          return (
            <motion.div
              key={comment.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex gap-3"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                {comment.userAvatar ? (
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-medium text-slate-600">
                    {comment.userName?.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-slate-900">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {timestamp
                      ? timestamp.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now"}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {comment.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
