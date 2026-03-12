"use client";

import Image from "next/image";

/* Neutral avatar: no colored fills; design system token. */
const AVATAR_BG = "#F1F3F2";
const AVATAR_TEXT = "#111111";
const AVATAR_BORDER = "#E3E6E5";

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
    const w = size === "sm" ? 24 : size === "md" ? 32 : 40;
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={w}
        height={w}
        className={`rounded-full object-cover border border-[#E3E6E5] ${sizeClass} ${className}`}
        unoptimized
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium border border-[#E3E6E5] ${sizeClass} ${className}`}
      style={{ backgroundColor: AVATAR_BG, color: AVATAR_TEXT }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
