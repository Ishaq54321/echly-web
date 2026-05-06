export interface SplitName {
  firstName: string;
  lastName: string;
}

/**
 * Splits a full name on the FIRST space.
 * "Mary Jane Watson" → { firstName: "Mary", lastName: "Jane Watson" }
 * "Cher" → { firstName: "Cher", lastName: "" }
 * "" → { firstName: "", lastName: "" }
 * "  Bob  " → { firstName: "Bob", lastName: "" }
 */
export function splitFullName(fullName: string | null | undefined): SplitName {
  const trimmed = (fullName ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) return { firstName: trimmed, lastName: "" };
  return {
    firstName: trimmed.substring(0, firstSpace),
    lastName: trimmed.substring(firstSpace + 1).trim(),
  };
}

/**
 * Composes firstName + lastName into a display string.
 * Empty lastName: returns just firstName.
 * Empty firstName + non-empty lastName: returns just lastName (defensive).
 * Both empty: returns empty string.
 */
export function composeFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const f = (firstName ?? "").trim();
  const l = (lastName ?? "").trim();
  if (f && l) return `${f} ${l}`;
  return f || l || "";
}
