"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { getInitials } from "@/lib/utils/getInitials";

export interface UserAvatarProps {
  /** Future: uploaded or API-provided profile image URL */
  image?: string | null;
  /** e.g. Firebase Auth `photoURL` */
  photoURL?: string | null;
  /** Used for initials fallback (display name or email local part) */
  name?: string | null;
  className?: string;
  alt?: string;
  /** Overrides default neutral initials chip (e.g. brand blue stack). */
  initialsClassName?: string;
}

function resolveImageSrc(image?: string | null, photoURL?: string | null): string {
  const a = image?.trim();
  const b = photoURL?.trim();
  return a || b || "";
}

/**
 * Safe profile avatar: shows `image` or `photoURL` when loadable, otherwise initials or user icon.
 */
export function UserAvatar({
  image,
  photoURL,
  name,
  className = "",
  alt = "User avatar",
  initialsClassName,
}: UserAvatarProps) {
  const src = resolveImageSrc(image, photoURL);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const showImage = Boolean(src) && !imgError;
  const label = name?.trim() ?? "";

  return (
    <span
      className={["relative inline-flex shrink-0 overflow-hidden rounded-full", className]
        .filter(Boolean)
        .join(" ")}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : label ? (
        <span
          className={
            initialsClassName ??
            "flex h-full w-full items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700"
          }
          aria-hidden
        >
          {getInitials(label)}
        </span>
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200">
          <User className="h-5 w-5 text-neutral-600" aria-hidden />
        </span>
      )}
    </span>
  );
}
