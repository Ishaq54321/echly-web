/**
 * The single avatar fallback palette for the whole app. Every avatar
 * renderer resolves its no-image background through {@link getAvatarColor}
 * so the same user is the same color on every screen.
 *
 * Values are CSS custom properties defined in styles/tokens.css.
 */
export const AVATAR_COLORS = [
  "var(--avatar-warm-orange)",
  "var(--avatar-blue)",
  "var(--avatar-purple)",
  "var(--avatar-green)",
  "var(--avatar-pink)",
  "var(--avatar-gold)",
  "var(--avatar-teal)",
];

/**
 * Returns a stable color for a given seed. Same seed → same color, always.
 *
 * Pass the user's uid as the seed so a person's fallback color is
 * consistent across the entire app (inbox, activity feed, members
 * table, comments, mentions, recent viewers, …).
 */
export function getAvatarColor(seed: string): string {
  if (!seed) return AVATAR_COLORS[0]!;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}
