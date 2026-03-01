/**
 * Central semantic tag color mapping for the enterprise tag system.
 * Use with the shared <Tag /> component for consistent styling.
 */

export const TAG_COLOR_MAP: Record<
  string,
  { pill: string; dot: string }
> = {
  UX: { pill: "bg-indigo-50 text-indigo-600", dot: "bg-indigo-500" },
  Bug: { pill: "bg-neutral-100/70 text-neutral-700", dot: "bg-neutral-400" },
  Performance: { pill: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  Copy: { pill: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
  Interaction: { pill: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  Responsive: { pill: "bg-violet-50 text-violet-600", dot: "bg-violet-500" },
  Backend: { pill: "bg-slate-100 text-slate-700", dot: "bg-slate-500" },
  Data: { pill: "bg-cyan-50 text-cyan-600", dot: "bg-cyan-500" },
  Blocking: { pill: "bg-neutral-100/70 text-neutral-700", dot: "bg-neutral-400" },
  Accessibility: { pill: "bg-teal-50 text-teal-600", dot: "bg-teal-500" },
  "Visual Hierarchy": { pill: "bg-fuchsia-50 text-fuchsia-600", dot: "bg-fuchsia-500" },
};

const FALLBACK = { pill: "bg-neutral-100 text-neutral-700", dot: "bg-neutral-400" };

function normalizeKey(name: string): string {
  const trimmed = name.trim();
  const exact = TAG_COLOR_MAP[trimmed];
  if (exact) return trimmed;
  for (const key of Object.keys(TAG_COLOR_MAP)) {
    if (key.toLowerCase() === trimmed.toLowerCase()) return key;
  }
  return trimmed;
}

export function getTagPillClass(name: string): string {
  const key = normalizeKey(name);
  return TAG_COLOR_MAP[key]?.pill ?? FALLBACK.pill;
}

export function getTagDotClass(name: string): string {
  const key = normalizeKey(name);
  return TAG_COLOR_MAP[key]?.dot ?? FALLBACK.dot;
}

/** All available tags for the add-tag dropdown. Order defines display order. */
export const AVAILABLE_TAGS = [
  "UX",
  "Bug",
  "Performance",
  "Accessibility",
  "Copy",
  "Visual Hierarchy",
  "Interaction",
  "Responsive",
  "Backend",
  "Data",
  "Blocking",
] as const;
