"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Loader2, ZoomIn } from "lucide-react";

interface ScreenshotBlockProps {
  screenshotUrl: string;
  onExpand: () => void;
  /** Omit outer frame when nested inside a parent attachment card. */
  embeddedInCard?: boolean;
}

export function ScreenshotBlock({
  screenshotUrl,
  onExpand,
  embeddedInCard = false,
}: ScreenshotBlockProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Prevent "ghost" screenshot during ticket switch: reset loading before paint.
  useLayoutEffect(() => {
    setIsImageLoading(true);
  }, [screenshotUrl]);
  useEffect(() => {
    setIsImageLoading(true);
    const timeout = window.setTimeout(() => {
      setIsImageLoading(false);
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [screenshotUrl]);

  const outerFrame = embeddedInCard
    ? "rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.005] group"
    : "rounded-[var(--radius-xl)] overflow-hidden border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:scale-[1.005] group";
  const innerRadius = embeddedInCard ? "rounded-lg" : "rounded-[var(--radius-xl)]";

  return (
    <div className={outerFrame}>
      <div className={`relative overflow-hidden ${innerRadius} max-h-[317px] bg-[var(--layer-2-bg)]`}>
        <img
          key={screenshotUrl} // Hard reset the image element on ticket switch
          src={screenshotUrl}
          alt="Screenshot"
          className="w-full h-auto max-h-[317px] object-contain"
          style={{
            display: isImageLoading ? "none" : "block",
            opacity: isImageLoading ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
          loading="lazy"
          onLoad={() => {
            setIsImageLoading(false);
          }}
          onError={() => setIsImageLoading(false)}
        />

        {isImageLoading && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 bg-[var(--layer-2-bg)]">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--text-tertiary))]" strokeWidth={1.8} aria-hidden />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent pointer-events-none" />
        <button
          type="button"
          onClick={onExpand}
          className="absolute top-3 right-3 p-2.5 rounded-xl bg-white/95 text-[hsl(var(--text-primary-strong))] shadow-[var(--shadow-level-2)] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white hover:shadow-[var(--shadow-level-3)] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)]"
          aria-label="Expand screenshot"
        >
          <ZoomIn className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
