"use client";

import { useEffect, useRef } from "react";

export interface CommentDisplay {
  id: string;
  name: string;
  avatar: string;
  message: string;
  time: string;
}

interface Props {
  comments: CommentDisplay[];
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CommentThread({ comments }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, [comments]);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--surface-1))] border-l">
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-8 py-10 space-y-8"
      >
        {comments.map((comment, index) => (
          <div key={comment.id} className="flex flex-col gap-0">
            {index > 0 && index % 4 === 0 && (
              <div
                className="border-t border-[hsl(var(--border))] opacity-40 pt-6"
                aria-hidden
              />
            )}
            <div className="flex gap-4">
              {comment.avatar ? (
                <img
                  src={comment.avatar}
                  alt={comment.name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full bg-[hsl(var(--surface-2))] flex flex-shrink-0 items-center justify-center text-xs font-medium text-[hsl(var(--text-secondary))]"
                  aria-hidden
                >
                  {getInitials(comment.name)}
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[hsl(var(--text-primary))]">
                    {comment.name}
                  </span>
                  <span className="text-xs text-[hsl(var(--text-muted))]/70">
                    {comment.time}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[hsl(var(--text-secondary))] mt-1">
                  {comment.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
