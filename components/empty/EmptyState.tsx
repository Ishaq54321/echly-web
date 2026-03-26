"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type EmptyStateProps = {
  icon?: LucideIcon;
  iconClassName?: string;
  media?: ReactNode;
  title: string;
  description: string;
  subtext?: string;
  emphasis?: "prominent" | "muted";
  animate?: boolean;
  /** Tighter padding and vertical rhythm (e.g. archive tab empty state). */
  density?: "default" | "compact";
  children?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  iconClassName = "w-12 h-12 text-neutral-400",
  media,
  title,
  description,
  subtext,
  emphasis = "prominent",
  animate = false,
  density = "default",
  children,
}: EmptyStateProps) {
  const [animateIn, setAnimateIn] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    setAnimateIn(true);
  }, [animate]);

  const titleClassName =
    emphasis === "prominent"
      ? "text-3xl font-semibold text-gray-900 whitespace-nowrap"
      : "text-2xl font-medium text-gray-900";

  const isCompact = density === "compact";
  const cardPadding = isCompact ? "p-7" : "p-10";
  const mediaOrIconBottom = isCompact ? "mb-4" : "mb-6";
  const descriptionTop = isCompact ? "mt-2" : "mt-4";
  const descriptionMaxW = isCompact ? "max-w-[340px]" : "max-w-[640px]";

  return (
    <div
      className={`mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white ${cardPadding} text-center shadow-sm`}
      style={{
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 140ms ease-out, transform 140ms ease-out",
        willChange: "opacity, transform",
      }}
    >
      {media ? <div className={mediaOrIconBottom}>{media}</div> : null}
      {!media && Icon ? (
        <div className={`${mediaOrIconBottom} flex justify-center`}>
          <Icon className={iconClassName} strokeWidth={1.5} aria-hidden />
        </div>
      ) : null}

      <div className="px-6 text-center">
        <h2 className={titleClassName}>{title}</h2>
        <p
          className={`${descriptionTop} ${descriptionMaxW} mx-auto text-center text-base text-gray-600`}
        >
          {description}
        </p>
        {subtext ? (
          <p className="mt-3 text-xs text-[hsl(var(--text-muted))]">{subtext}</p>
        ) : null}
      </div>

      {children ? <div className="relative mt-5">{children}</div> : null}
    </div>
  );
}
