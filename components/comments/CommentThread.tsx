"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { getInitials } from "@/lib/utils/getInitials";

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

function buildThreadSummary(comments: CommentDisplay[]): string {
  const count = comments.length;
  const first = comments[0]?.name?.trim() || "Anonymous";
  const last = comments[count - 1]?.name?.trim() || "Anonymous";
  const samePerson = first === last;
  const participantLabel = samePerson ? first : `${first} and ${last}`;
  const timeNote =
    comments[0]?.time && comments[count - 1]?.time
      ? ` First and last activity: ${comments[0].time} — ${comments[count - 1].time}.`
      : " Discussion in this thread.";
  return `${count} comment${count === 1 ? "" : "s"} exchanged between ${participantLabel}.${timeNote}`;
}

export default function CommentThread({ comments }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const threadSummary = useMemo(
    () => (comments.length > 3 ? buildThreadSummary(comments) : null),
    [comments]
  );

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, [comments]);

  return (
    <div className="flex flex-col h-full bg-[var(--surface-1)] border-l">
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-8 py-10 space-y-8"
      >
        {threadSummary && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-6 py-4 mb-6">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-2">
              Thread Summary
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {threadSummary}
            </p>
          </div>
        )}
        {comments.map((comment, index) => (
          <div key={comment.id} className="flex flex-col gap-0">
            {index > 0 && index % 4 === 0 && (
              <div
                className="border-t border-[var(--border)] opacity-40 pt-6"
                aria-hidden
              />
            )}
            <div className="flex gap-4">
              {comment.avatar ? (
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={comment.avatar}
                    alt={comment.name}
                    width={36}
                    height={36}
                    sizes="36px"
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="w-9 h-9 rounded-full bg-[var(--surface-2)] flex flex-shrink-0 items-center justify-center text-xs font-medium text-[var(--text-secondary)]"
                  aria-hidden
                >
                  {getInitials(comment.name)}
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {comment.name}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]/70">
                    {comment.time}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] mt-1">
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
