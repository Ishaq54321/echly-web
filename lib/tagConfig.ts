/**
 * Central semantic tag color mapping for the enterprise tag system.
 * Use with the shared <Tag /> component for consistent styling.
 */

export const TAG_COLOR_MAP: Record<
  string,
  { pill: string; dot: string }
> = {
  Product: { pill: "bg-semantic-system/10 text-semantic-system", dot: "bg-semantic-system" },
  UX: { pill: "bg-semantic-insight/10 text-semantic-insight", dot: "bg-semantic-insight" },
  Performance: { pill: "bg-semantic-success/10 text-semantic-success", dot: "bg-semantic-success" },
  Bug: { pill: "bg-semantic-danger/10 text-semantic-danger", dot: "bg-semantic-danger" },
  Copy: { pill: "bg-neutral-100 text-neutral-700", dot: "bg-neutral-400" },
  Interaction: { pill: "bg-neutral-100 text-neutral-700", dot: "bg-neutral-400" },
  Responsive: { pill: "bg-neutral-100 text-neutral-700", dot: "bg-neutral-400" },
  Backend: { pill: "bg-neutral-100 text-neutral-700", dot: "bg-neutral-400" },
  Data: { pill: "bg-neutral-100 text-neutral-700", dot: "bg-neutral-400" },
  Blocking: { pill: "bg-neutral-100 text-neutral-700", dot: "bg-neutral-400" },
  Accessibility: { pill: "bg-neutral-100 text-neutral-700", dot: "bg-neutral-400" },
  "Visual Hierarchy": { pill: "bg-neutral-100 text-neutral-700", dot: "bg-neutral-400" },
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
  "Product",
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
