import type { PortableTextBlock } from "sanity";

/**
 * Small formatting helpers shared by the blog index and article pages.
 * Dates format with a FIXED locale so server and client render identically
 * (no hydration mismatch from the visitor's locale).
 */

export function formatDate(
  iso: string | null | undefined,
  style: "short" | "long" = "short",
): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  });
}

/** ~220 wpm over the Portable Text spans; always at least 1 minute. */
export function readingTimeMinutes(body: PortableTextBlock[] | null): number {
  if (!body) return 1;
  let words = 0;
  for (const block of body) {
    const children = (block as { children?: { text?: string }[] }).children;
    if (!Array.isArray(children)) continue;
    for (const child of children) {
      if (typeof child.text === "string") {
        words += child.text.split(/\s+/).filter(Boolean).length;
      }
    }
  }
  return Math.max(1, Math.round(words / 220));
}

/** "The Annote Team" → "AT" (first + last word initials). */
export function authorInitials(name: string | null | undefined): string {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "A";
}
