"use client";

function getTagClass(type: string): string {
  const t = type.toLowerCase();
  const base = "text-[11px] px-2 py-0.5 rounded-full font-medium border";
  if (t.includes("bug"))
    return `${base} bg-red-50 text-red-600 border-red-100`;
  if (t.includes("ux"))
    return `${base} bg-neutral-100 text-neutral-600 border-neutral-200`;
  if (t.includes("ui"))
    return `${base} bg-neutral-100 text-neutral-600 border-neutral-200`;
  return `${base} bg-gray-50 text-active border-gray-100`;
}

interface FeedbackTagProps {
  type: string;
}

export function FeedbackTag({ type }: FeedbackTagProps) {
  return <span className={`${getTagClass(type)} transition-all duration-150 ease-out`}>{type}</span>;
}
