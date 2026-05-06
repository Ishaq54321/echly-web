/**
 * Slug rules: lowercase, alphanumeric + hyphens only, 3-60 chars,
 * no leading/trailing hyphens, no consecutive hyphens.
 */
export const SLUG_MIN_LEN = 3;
export const SLUG_MAX_LEN = 60;
export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/** Normalize an arbitrary string into a candidate slug. */
export function generateSlug(name: string): string {
  if (typeof name !== "string") return "";
  const lowered = name.toLowerCase().trim();
  // Replace anything that is not [a-z0-9] with a hyphen, then collapse and trim hyphens.
  const replaced = lowered.replace(/[^a-z0-9]+/g, "-");
  const collapsed = replaced.replace(/-+/g, "-");
  const trimmed = collapsed.replace(/^-+/, "").replace(/-+$/, "");
  return trimmed.slice(0, SLUG_MAX_LEN);
}

/** Returns true if `slug` matches all slug rules. */
export function isValidSlug(slug: string): boolean {
  if (typeof slug !== "string") return false;
  if (slug.length < SLUG_MIN_LEN || slug.length > SLUG_MAX_LEN) return false;
  if (slug.includes("--")) return false;
  return SLUG_RE.test(slug);
}

/** Append a random 3-digit suffix to suggest an alternative slug when a slug is taken. */
export function suggestSlug(base: string): string {
  const cleanBase = generateSlug(base) || "workspace";
  const suffix = Math.floor(100 + Math.random() * 900);
  const trimmed = cleanBase.slice(0, SLUG_MAX_LEN - 4); // reserve `-NNN`
  return `${trimmed}-${suffix}`;
}
