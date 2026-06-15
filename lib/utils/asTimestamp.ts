import { Timestamp } from "firebase/firestore";
import { toMillis } from "@/lib/utils/timestamp";

/**
 * Re-hydrate ANY timestamp shape into a real CLIENT `firebase/firestore`
 * Timestamp (or null). Use when storing a value back into the in-memory model so
 * downstream readers can safely call `.toMillis()` / `.toDate()`.
 *
 * CLIENT-ONLY — constructs a firebase/firestore Timestamp. This lives in its own
 * module (separate from the SDK-agnostic {@link toMillis} / `toDate`) so that
 * server code importing the coercion helpers never drags the firebase/firestore
 * client SDK into a server bundle. Server code that needs millis should import
 * {@link toMillis} instead.
 *
 * A value that is already a Timestamp passes through unchanged.
 */
export function asTimestamp(value: unknown): Timestamp | null {
  if (value == null) return null;
  if (value instanceof Timestamp) return value;
  const ms = toMillis(value);
  return ms == null ? null : Timestamp.fromMillis(ms);
}
