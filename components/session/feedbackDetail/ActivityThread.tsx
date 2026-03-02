"use client";

import Image from "next/image";
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
    <div className="space-y-0">
      <AnimatePresence initial={false}>
        {comments.map((comment) => {
          let timestamp: Date | null = null;
          if (comment.createdAt?.seconds) {
            timestamp = new Date(comment.createdAt.seconds * 1000);
          }
          const formattedDate =
            timestamp
              ? timestamp.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now";

          return (
            <motion.div
              key={comment.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex gap-3 py-4 rounded-lg px-2 -mx-2 hover:bg-neutral-50 transition-colors duration-150"
            >
              <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-neutral-200">
                {comment.userAvatar ? (
                  <Image
                    src={comment.userAvatar}
                    alt={comment.userName ?? ""}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-medium text-neutral-600">
                    {comment.userName?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate text-neutral-900">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-neutral-500 whitespace-nowrap">
                    {formattedDate}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-700 leading-relaxed">
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
