"use client";

import { Tag } from "@/components/ui/Tag";

interface FeedbackTagProps {
  type: string;
}

/** @deprecated Use <Tag name={type} variant="sidebar" /> from @/components/ui/Tag */
export function FeedbackTag({ type }: FeedbackTagProps) {
  return <Tag name={type} variant="sidebar" />;
}
