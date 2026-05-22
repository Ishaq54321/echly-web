/**
 * StaticPin — non-interactive speech-bubble pin overlay for demo screenshots.
 *
 * Reproduces the production PinMarker visual (ScreenshotWithPins.tsx PinMarker):
 *   - PIN_SIZE_PX = 24, speech-bubble SVG path verbatim from source
 *   - brand fill (--text-heading) / white stroke 1.5 / drop-shadow
 *   - translate(-50%,-50%) so the pin centers on the (x,y) percentage point
 * Adds a numbered label inside the bubble (the marketing demo shows one static
 * pin per screenshot; production numbers pins idx+1 the same way).
 *
 * No drag, no click-to-thread — purely decorative. Hover shows an optional
 * tooltip with the note text.
 */
"use client";

import { useState } from "react";

const PIN_SIZE_PX = 24;

export function StaticPin({
  x,
  y,
  number,
  tooltip,
}: {
  x: number;
  y: number;
  number: number;
  tooltip?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        width: PIN_SIZE_PX,
        height: PIN_SIZE_PX,
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
        zIndex: 10,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="img"
      aria-label={`Comment ${number}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="var(--text-heading)"
        stroke="white"
        strokeWidth="1.5"
        className="w-full h-full"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span
        className="absolute text-white font-semibold pointer-events-none"
        style={{ fontSize: 9, top: "42%", left: "50%", transform: "translate(-50%, -50%)" }}
        aria-hidden
      >
        {number}
      </span>
      {showTooltip && tooltip && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-1.5 rounded bg-[var(--text-heading)] text-white text-[12px] leading-snug whitespace-nowrap overflow-hidden max-w-[220px] truncate pointer-events-none z-30 shadow-lg">
          {tooltip}
        </span>
      )}
    </div>
  );
}
