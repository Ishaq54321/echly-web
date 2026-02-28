/**
 * Cost protection: ensure Firestore queries never run unbounded.
 * In development, throws if limit is missing or invalid.
 */

const isDev =
  typeof process !== "undefined" &&
  process.env.NODE_ENV !== "production";

/**
 * Call at the start of any repo function that runs a getDocs/onSnapshot query.
 * In development, throws if limit is not a positive number.
 */
export function assertQueryLimit(
  limitValue: number,
  label: string
): void {
  if (!isDev) return;
  if (
    typeof limitValue !== "number" ||
    !Number.isFinite(limitValue) ||
    limitValue < 1
  ) {
    throw new Error(
      `[querySafety] ${label}: query limit is required and must be a positive number, got: ${limitValue}`
    );
  }
}
