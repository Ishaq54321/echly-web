import {
  resolveUserName,
  NAME_FALLBACK,
  type ResolvableUser,
} from "./nameSplit";

/**
 * Derives up to two initials from a display name for avatar fallbacks.
 * Overloads:
 *   getInitials("Mary Jane")              → "MJ"
 *   getInitials("Mary", "Jane")           → "MJ"
 *   getInitials("Mary", "")               → "M"
 *   getInitials({ firstName, lastName })  → resolves via resolveUserName first
 *   getInitials(null)                     → "U"
 */
export function getInitials(fullName: string | null | undefined): string;
export function getInitials(user: ResolvableUser): string;
export function getInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string;
export function getInitials(
  a?: string | ResolvableUser | null,
  b?: string | null
): string {
  // Two-arg (firstName, lastName) form.
  if (b !== undefined) {
    const f = (typeof a === "string" ? a : "").trim();
    const l = (b ?? "").trim();
    if (f && l) return `${f[0]!}${l[0]!}`.toUpperCase();
    if (f) return f[0]!.toUpperCase();
    if (l) return l[0]!.toUpperCase();
    return "U";
  }

  // Object form: resolve to a name via the shared resolver first.
  const name =
    typeof a === "string" || a == null ? a : resolveUserName(a);

  if (!name?.trim() || name === NAME_FALLBACK.UNKNOWN) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) {
    const first = parts[0]!;
    const ch = first[0];
    return ch ? ch.toUpperCase() : "U";
  }
  const aCh = parts[0]![0];
  const bCh = parts[parts.length - 1]![0];
  if (!aCh || !bCh) return (aCh || bCh || "U").toUpperCase();
  return (aCh + bCh).toUpperCase();
}
