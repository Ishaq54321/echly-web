export const AVATAR_COLORS = [
  "var(--avatar-warm-orange)",
  "var(--avatar-blue)",
  "var(--avatar-purple)",
  "var(--avatar-green)",
  "var(--avatar-gold)",
  "var(--avatar-teal)",
];

export function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}
