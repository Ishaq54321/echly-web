"use client";

import { useEffect, useRef } from "react";
import CommentItem from "./CommentItem";

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

export default function CommentThread({ comments }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, [comments]);

  return (
    <div ref={scrollContainerRef} className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          name={comment.name}
          avatar={comment.avatar}
          message={comment.message}
          time={comment.time}
        />
      ))}
    </div>
  );
}