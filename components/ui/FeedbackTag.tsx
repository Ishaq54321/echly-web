"use client";

function getTagVars(type: string): { bg: string; text: string } {
  const t = type.toLowerCase();
  if (t.includes("bug")) return { bg: "var(--tag-bug-bg)", text: "var(--tag-bug-text)" };
  if (t.includes("ux")) return { bg: "var(--tag-ux-bg)", text: "var(--tag-ux-text)" };
  if (t.includes("ui")) return { bg: "var(--tag-ui-bg)", text: "var(--tag-ui-text)" };
  return { bg: "hsl(var(--surface-2))", text: "hsl(var(--text-muted))" };
}

interface FeedbackTagProps {
  type: string;
}

export function FeedbackTag({ type }: FeedbackTagProps) {
  const { bg, text } = getTagVars(type);
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide"
      style={{ backgroundColor: bg, color: text }}
    >
      {type}
    </span>
  );
}
