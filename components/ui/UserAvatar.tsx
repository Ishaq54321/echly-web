"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { getInitials } from "@/lib/utils/getInitials";
import { getAvatarColor } from "@/lib/utils/getAvatarColor";

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
  /**
   * Seed for the per-user fallback color (typically the user's uid).
   * When set, the no-image branch paints `getAvatarColor(colorSeed)`
   * INSIDE this component — callers must never wrap a background-colored
   * div around <UserAvatar/> (that caused the SessionsWorkspace color
   * bleed: the wrapper bg showed through the rounded image edges and
   * flashed before the image loaded).
   */
  colorSeed?: string | null;
  className?: string;
  /** Extra inline styles merged onto the wrapper (e.g. zIndex for stacks). Never set `background` here — use colorSeed. */
  style?: CSSProperties;
  alt?: string;
  /** Renders a neutral grey "A" circle for anonymous viewers (never a hash color). */
  isAnonymous?: boolean;
  /** Optional override for the initials chip styling. Overrides colorSeed bg. */
  initialsClassName?: string;
  /**
   * Set for above-the-fold avatars (e.g. the viewer's own avatar in the top
   * bar) to load eagerly. Defaults to lazy loading, which suits avatars inside
   * lists/stacks/feeds. (Fix 4 — image sizing / decode-swap.)
   */
  eager?: boolean;
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
 * Canonical avatar — the ONLY avatar renderer in the app.
 *
 * - Photo if available (painted on a transparent wrapper → no color leak).
 * - Else initials on a per-user color derived from `colorSeed` (the uid),
 *   so the same person is the same color on every screen.
 * - Else initials on `--brand` when no seed is given.
 * - Anonymous viewers get a neutral grey "A", never a hash color.
 */
export function UserAvatar({
  avatarUrl,
  image,
  photoURL,
  name,
  size,
  colorSeed,
  className = "",
  style,
  alt,
  isAnonymous = false,
  initialsClassName,
  eager = false,
}: UserAvatarProps) {
  const src = resolveImageSrc(avatarUrl, image, photoURL);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const showImage = Boolean(src) && !imgError && !isAnonymous;
  const label = name?.trim() ?? "";
  // Fix 7: prefer the person's name for alt text so screen readers announce who
  // the avatar belongs to; fall back to the generic label when no name is set.
  const resolvedAlt = alt ?? (label ? `${label}'s avatar` : "User avatar");

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
    // Image branch: wrapper has NO background. The photo paints onto a
    // transparent circle, so no fallback color can ever bleed at the edges
    // or flash before the image decodes.
    return (
      <span className={wrapperClass} style={{ ...sizeStyle, ...style }}>
        <img
          src={src}
          alt={resolvedAlt}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
          // Fix 4: reserve layout + avoid sync decode jank. width/height are set
          // when a numeric size is known (the wrapper already fixes the box, so
          // the image swaps in place rather than reflowing). Lazy by default for
          // list/stack avatars; callers pass `eager` for above-the-fold ones.
          {...(typeof size === "number" ? { width: size, height: size } : {})}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </span>
    );
  }

  if (isAnonymous) {
    return (
      <span
        className={[
          wrapperClass,
          "text-[var(--text-secondary)] font-semibold",
        ].join(" ")}
        style={{
          ...sizeStyle,
          ...style,
          background: "var(--avatar-neutral-grey)",
        }}
        aria-hidden
      >
        A
      </span>
    );
  }

  const initials = label ? getInitials(label) : "U";

  // No-image branch: the colored fallback bg lives HERE, keyed on the
  // user's seed. initialsClassName (if provided) takes precedence and is
  // expected to carry its own bg.
  if (initialsClassName) {
    return (
      <span
        className={[wrapperClass, initialsClassName].join(" ")}
        style={{ ...sizeStyle, ...style }}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  const fallbackBg = colorSeed ? getAvatarColor(colorSeed) : "var(--brand)";

  return (
    <span
      className={[wrapperClass, "text-white font-semibold"].join(" ")}
      style={{ ...sizeStyle, ...style, background: fallbackBg }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
