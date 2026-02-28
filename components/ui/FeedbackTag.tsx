"use client";

function getTagClass(type: string): string {
  const t = type.toLowerCase();
  const base = "text-[11px] px-2 py-0.5 rounded-full font-medium border";
  if (t.includes("bug"))
    return `${base} bg-red-50 text-red-600 border-red-100`;
  if (t.includes("ux"))
    return `${base} bg-indigo-50 text-indigo-600 border-indigo-100`;
  if (t.includes("ui"))
    return `${base} bg-blue-50 text-blue-600 border-blue-100`;
  return `${base} bg-gray-50 text-gray-600 border-gray-100`;
}

interface FeedbackTagProps {
  type: string;
}

export function FeedbackTag({ type }: FeedbackTagProps) {
  return <span className={getTagClass(type)}>{type}</span>;
}
