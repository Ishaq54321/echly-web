/**
 * Canonical timestamp coercion. ONE place that understands every timestamp shape
 * this codebase produces, so readers never have to guess whether a value is a
 * real Firestore Timestamp or a serialized plain object.
 *
 * Shapes handled:
 *  - Firestore client Timestamp (firebase/firestore) — has .toMillis()/.toDate()/.seconds
 *  - Firestore Admin Timestamp (firebase-admin/firestore) — same duck-typed surface
 *  - Serialized API shape: { seconds } | { seconds, nanoseconds } | { _seconds, _nanoseconds }
 *  - ISO / parseable date string (serializeTicket emits createdAt this way)
 *  - Date
 *  - number (already epoch millis)
 *  - null / undefined / anything unparseable → null
 *
 * This module has ZERO SDK dependencies (pure duck-typing, no `instanceof`,
 * never constructs a Timestamp), so it is safe to import from BOTH client and
 * server code. Client and Admin Timestamp are different classes but share the
 * `.toMillis()` / `.seconds` surface.
 *
 * To re-hydrate a value back into a real CLIENT Firestore Timestamp, use
 * {@link import("@/lib/utils/asTimestamp").asTimestamp} — kept in a separate,
 * client-only module so importing the coercion helpers here never pulls the
 * firebase/firestore client SDK into a server bundle.
 *
 * Nothing throws — unparseable input returns null.
 */

type DuckTimestamp = {
  toMillis?: () => number;
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
  _seconds?: number;
  _nanoseconds?: number;
};

/**
 * Epoch milliseconds for any timestamp shape, or null if null/undefined/unparseable.
 * Use for sorting and comparison. SDK-agnostic — safe on client and server.
 */
export function toMillis(value: unknown): number | null {
  if (value == null) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : ms;
  }

  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? null : ms;
  }

  if (typeof value === "object") {
    const v = value as DuckTimestamp;
    // Real Timestamp (client or Admin) — preferred, exact.
    if (typeof v.toMillis === "function") {
      const ms = v.toMillis();
      return Number.isFinite(ms) ? ms : null;
    }
    if (typeof v.toDate === "function") {
      const ms = v.toDate().getTime();
      return Number.isNaN(ms) ? null : ms;
    }
    // Serialized shapes. Support both { seconds } (our serializer / client SDK
    // JSON) and { _seconds } (Admin SDK JSON.stringify form).
    const seconds =
      typeof v.seconds === "number"
        ? v.seconds
        : typeof v._seconds === "number"
          ? v._seconds
          : null;
    if (seconds !== null) {
      const nanos =
        typeof v.nanoseconds === "number"
          ? v.nanoseconds
          : typeof v._nanoseconds === "number"
            ? v._nanoseconds
            : 0;
      return seconds * 1000 + Math.floor(nanos / 1e6);
    }
  }

  return null;
}

/**
 * A Date for any timestamp shape, or null. Use for formatting (date-fns etc.).
 * SDK-agnostic — safe on client and server.
 */
export function toDate(value: unknown): Date | null {
  const ms = toMillis(value);
  return ms == null ? null : new Date(ms);
}
