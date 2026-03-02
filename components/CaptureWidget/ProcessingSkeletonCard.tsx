"use client";

import React from "react";

/**
 * Placeholder card that matches real ticket layout during "Publishing to your session..." phase.
 * Title bar + 2–3 action line shimmers, rounded edges, subtle elevation, CSS shimmer.
 */
export default function ProcessingSkeletonCard({
  exiting = false,
}: {
  /** When true, applies fade-out for transition to real ticket. */
  exiting?: boolean;
}) {
  return (
    <div
      className={`
        capture-processing-skeleton
        bg-white px-6 py-4 border-b border-[rgba(0,0,0,0.05)]
        shadow-[0_2px_6px_rgba(0,0,0,0.03)]
        transition-opacity duration-200 ease-out
        ${exiting ? "opacity-0" : "opacity-100"}
      `}
      aria-hidden
    >
      <div className="flex justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Title bar shimmer */}
          <div className="capture-skeleton-line capture-skeleton-title h-4 w-3/4 rounded" />
          {/* 2–3 fake action line shimmers */}
          <div className="capture-skeleton-line h-3 w-full rounded" />
          <div className="capture-skeleton-line h-3 w-5/6 rounded" />
          <div className="capture-skeleton-line h-3 w-4/6 rounded" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="capture-skeleton-dot h-6 w-6 rounded-md" />
          <div className="capture-skeleton-dot h-6 w-6 rounded-md" />
          <div className="capture-skeleton-dot h-6 w-6 rounded-md" />
        </div>
      </div>
    </div>
  );
}
