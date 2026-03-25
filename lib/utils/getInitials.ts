/**
 * Derives up to two initials from a display name for avatar fallbacks.
 */
export function getInitials(name?: string): string {
  if (!name?.trim()) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) {
    const first = parts[0];
    const ch = first[0];
    return ch ? ch.toUpperCase() : "U";
  }
  const a = parts[0][0];
  const b = parts[1][0];
  if (!a || !b) return (a || b || "U").toUpperCase();
  return (a + b).toUpperCase();
}
