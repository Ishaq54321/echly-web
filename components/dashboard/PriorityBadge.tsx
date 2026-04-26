export type PriorityLevel = "high" | "medium" | "low";

const STYLES: Record<PriorityLevel, string> = {
  high: "bg-[var(--surface-hover)] text-neutral-700",
  medium: "bg-[var(--surface-hover)] text-[var(--text-secondary)]",
  low: "bg-[var(--surface-subtle)] text-neutral-500",
};

const LABELS: Record<PriorityLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-[3px] text-xs font-medium ${STYLES[level]}`}
    >
      {LABELS[level]}
    </span>
  );
}
