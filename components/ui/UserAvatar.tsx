"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { getInitials } from "@/lib/utils/getInitials";

export interface UserAvatarProps {
  /** Highest priority: uploaded avatar URL stored in Firestore. */
  avatarUrl?: string | null;
  /** Legacy/alias: same as avatarUrl, checked second. */
  image?: string | null;
  /** e.g. Firebase Auth `photoURL`, checked third. */
  photoURL?: string | null;
  /** Used for initials fallback (display name or email local part) */
  name?: string | null;
  /** Pixel size. When provided, sets width/height/font inline. Omit to size via className. */
  size?: number;
  className?: string;
  alt?: string;
  /** Renders a neutral grey "A" circle for anonymous viewers. */
  isAnonymous?: boolean;
  /** Optional override for the initials chip styling. */
  initialsClassName?: string;
}

function resolveImageSrc(
  avatarUrl?: string | null,
  image?: string | null,
  photoURL?: string | null
): string {
  const a = avatarUrl?.trim();
  const b = image?.trim();
  const c = photoURL?.trim();
  return a || b || c || "";
}

/**
 * Canonical avatar: photo if available, else 2-char initials on brand blue,
 * else "?" on brand blue. Anonymous viewers get a neutral grey "A".
 */
export function UserAvatar({
  avatarUrl,
  image,
  photoURL,
  name,
  size,
  className = "",
  alt = "User avatar",
  isAnonymous = false,
  initialsClassName,
}: UserAvatarProps) {
  const src = resolveImageSrc(avatarUrl, image, photoURL);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const showImage = Boolean(src) && !imgError && !isAnonymous;
  const label = name?.trim() ?? "";

  const sizeStyle: CSSProperties | undefined =
    typeof size === "number"
      ? {
          width: size,
          height: size,
          minWidth: size,
          fontSize: Math.max(Math.round(size * 0.38), 10),
          lineHeight: 1,
        }
      : undefined;

  const wrapperClass = [
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (showImage) {
    return (
      <span className={wrapperClass} style={sizeStyle}>
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  if (isAnonymous) {
    return (
      <span
        className={[
          wrapperClass,
          "bg-[var(--surface-hover)] text-[var(--text-secondary)] font-semibold",
        ].join(" ")}
        style={sizeStyle}
        aria-hidden
      >
        A
      </span>
    );
  }

  const initials = label ? getInitials(label) : "U";
  const initialsCls =
    initialsClassName ??
    "bg-[var(--brand)] text-white font-semibold";

  return (
    <span
      className={[wrapperClass, initialsCls].join(" ")}
      style={sizeStyle}
      aria-hidden
    >
      {initials}
    </span>
  );
}
