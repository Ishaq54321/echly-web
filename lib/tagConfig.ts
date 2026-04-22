/**
 * Central semantic tag colors — deterministic: same label (case-insensitive) → same styles.
 * Use with <Tag /> and chip UIs for a consistent premium tag system.
 */

const SEMANTIC = {
  layout: {
    pill: "bg-[var(--brand-subtle)] text-[var(--brand-text)] border-[var(--brand-muted)]",
    dot: "bg-[#1775E0]",
  },
  ux: {
    pill: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  bug: {
    pill: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  content: {
    pill: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  performance: {
    pill: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  default: {
    pill: "bg-gray-50 text-gray-700 border-[#EBEBEB]",
    dot: "bg-gray-400",
  },
} as const;

type SemanticKey = keyof typeof SEMANTIC;

/** Primary semantic palette (export for consumers that need the map object). */
export const TAG_COLOR_MAP: Record<SemanticKey, string> = {
  layout: SEMANTIC.layout.pill,
  ux: SEMANTIC.ux.pill,
  bug: SEMANTIC.bug.pill,
  content: SEMANTIC.content.pill,
  performance: SEMANTIC.performance.pill,
  default: SEMANTIC.default.pill,
};

/** Maps normalized (lowercase) labels to a semantic bucket. Extends core keys with app vocabulary. */
const CANONICAL_TAG: Record<string, SemanticKey> = {
  layout: "layout",
  product: "layout",
  "visual hierarchy": "layout",
  responsive: "layout",
  ux: "ux",
  interaction: "ux",
  accessibility: "ux",
  bug: "bug",
  blocking: "bug",
  content: "content",
  copy: "content",
  data: "content",
  performance: "performance",
  backend: "default",
};

function resolveSemanticKey(tag: string): SemanticKey {
  const key = tag.toLowerCase().trim();
  if (CANONICAL_TAG[key]) return CANONICAL_TAG[key];
  if (key in SEMANTIC) return key as SemanticKey;
  return "default";
}

export function getTagColor(tag: string): string {
  return SEMANTIC[resolveSemanticKey(tag)].pill;
}

/** @deprecated Prefer getTagColor — same behavior. */
export function getTagPillClass(name: string): string {
  return getTagColor(name);
}

export function getTagDotClass(name: string): string {
  return SEMANTIC[resolveSemanticKey(name)].dot;
}

/** Shared interactive chip shell (premium pills + hover). */
export const TAG_CHIP_BASE_CLASS =
  "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border";

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
