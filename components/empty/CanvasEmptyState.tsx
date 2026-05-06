"use client";

import * as React from "react";

interface CanvasEmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  description?: string;
  /** Optional CTA button (rendered below the description). */
  cta?: React.ReactNode;
  /** Compact density: smaller illustration + tighter spacing for inline use (#10–#12). */
  density?: "default" | "compact";
  className?: string;
}

export function CanvasEmptyState({
  illustration,
  title,
  description,
  cta,
  density = "default",
  className = "",
}: CanvasEmptyStateProps) {
  const isCompact = density === "compact";

  const illuSize = isCompact
    ? "w-[112px] h-[98px]"
    : "w-[160px] h-[140px]";
  const titleClass = isCompact
    ? "text-[13px] font-semibold text-[var(--text-heading)] tracking-[-0.005em]"
    : "text-[15px] font-semibold text-[var(--text-heading)] tracking-[-0.005em]";
  const descClass = isCompact
    ? "mt-1 text-[12px] text-[var(--text-secondary)] leading-[1.5] max-w-[240px]"
    : "mt-1.5 text-[13px] text-[var(--text-secondary)] leading-[1.5] max-w-[260px]";
  const illuMb = isCompact ? "mb-3" : "mb-5";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 ${className}`}
    >
      <div className={`${illuSize} flex items-center justify-center ${illuMb}`}>
        <div className="w-full h-full">{illustration}</div>
      </div>
      <h3 className={titleClass}>{title}</h3>
      {description ? <p className={descClass}>{description}</p> : null}
      {cta ? <div className="mt-4">{cta}</div> : null}
    </div>
  );
}
