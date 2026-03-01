"use client";

/**
 * Deterministic background color from a string (e.g. user id).
 * Same input always yields the same hue. Returns HSL string for background.
 */
function backgroundColorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 55%, 42%)`;
}

export interface AvatarProps {
  /** If set, show image. Otherwise show initials on colored background. */
  avatarUrl?: string | null;
  firstName: string;
  lastName: string;
  /** Used for deterministic background when no avatarUrl (e.g. user id). */
  id: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

export function Avatar({
  avatarUrl,
  firstName,
  lastName,
  id,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials =
    `${(firstName || " ").trim().charAt(0)}${(lastName || " ").trim().charAt(0)}`.toUpperCase() ||
    "?";
  const sizeClass = sizeClasses[size];

  if (avatarUrl?.trim()) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`rounded-full object-cover ${sizeClass} ${className}`}
        width={size === "sm" ? 24 : size === "md" ? 32 : 40}
        height={size === "sm" ? 24 : size === "md" ? 32 : 40}
      />
    );
  }

  const bg = backgroundColorFromId(id);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium text-white ${sizeClass} ${className}`}
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
