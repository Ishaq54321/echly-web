/**
 * Derives up to two initials from a display name for avatar fallbacks.
 * Two overloads:
 *   getInitials("Mary Jane")           → "MJ"
 *   getInitials("Mary", "Jane")        → "MJ"
 *   getInitials("Mary", "")            → "M"
 *   getInitials(null)                  → "U"
 */
export function getInitials(fullName: string | null | undefined): string;
export function getInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string;
export function getInitials(a?: string | null, b?: string | null): string {
  if (b !== undefined) {
    const f = (a ?? "").trim();
    const l = (b ?? "").trim();
    if (f && l) return `${f[0]!}${l[0]!}`.toUpperCase();
    if (f) return f[0]!.toUpperCase();
    if (l) return l[0]!.toUpperCase();
    return "U";
  }
  const name = a;
  if (!name?.trim()) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) {
    const first = parts[0]!;
    const ch = first[0];
    return ch ? ch.toUpperCase() : "U";
  }
  const aCh = parts[0]![0];
  const bCh = parts[1]![0];
  if (!aCh || !bCh) return (aCh || bCh || "U").toUpperCase();
  return (aCh + bCh).toUpperCase();
}
