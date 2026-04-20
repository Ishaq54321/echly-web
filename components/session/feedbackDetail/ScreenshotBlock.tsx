"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Loader2, ZoomIn } from "lucide-react";

interface ScreenshotBlockProps {
  screenshotId: string | null | undefined;
  /** Resolved download URL from parent `useScreenshotUrl` (single resolution per ticket). */
  screenshotUrl: string | null;
  screenshotUrlLoading: boolean;
  screenshotUrlError: string | null;
  onExpand: () => void;
  /** Omit outer frame when nested inside a parent attachment card. */
  embeddedInCard?: boolean;
}

export function ScreenshotBlock({
  screenshotId,
  screenshotUrl: url,
  screenshotUrlLoading: loading,
  screenshotUrlError: error,
  onExpand,
  embeddedInCard = false,
}: ScreenshotBlockProps) {
  const [imageDecoded, setImageDecoded] = useState(false);

  useLayoutEffect(() => {
    setImageDecoded(false);
  }, [url]);
  useEffect(() => {
    if (!url) return;
    const timeout = window.setTimeout(() => {
      setImageDecoded(true);
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [url]);

  const outerFrame = embeddedInCard
    ? "rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.005] group"
    : "rounded-[var(--radius-xl)] overflow-hidden border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:scale-[1.005] group";
  const innerRadius = embeddedInCard ? "rounded-lg" : "rounded-[var(--radius-xl)]";

  return (
    <div className={outerFrame}>
      <div className={`relative overflow-hidden ${innerRadius} max-h-[317px] bg-[var(--layer-2-bg)]`} style={{ aspectRatio: "16/9" }}>
        {!screenshotId ? null : url ? (
        <img
          key={url} // Hard reset the image element on ticket switch
          src={url}
          alt="Screenshot"
          className={`w-full h-auto max-h-[317px] object-contain block transition-[filter,opacity] duration-300 ease-out ${
            imageDecoded ? "opacity-100 blur-0" : "opacity-[0.88] blur-md"
          }`}
          loading="eager"
          decoding="async"
          onLoad={() => {
            setImageDecoded(true);
          }}
          onError={() => setImageDecoded(true)}
        />
        ) : null}

        {(loading && !url) || (Boolean(screenshotId) && !url && !error) ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 bg-[var(--layer-2-bg)]/80">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--text-tertiary))]" strokeWidth={1.8} aria-hidden />
          </div>
        ) : null}
        {!loading && screenshotId && !url && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 bg-[var(--layer-2-bg)] text-[12px] text-[hsl(var(--text-tertiary))]">
            {error ?? "Screenshot unavailable"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent pointer-events-none" />
        {url ? (
          <button
            type="button"
            onClick={onExpand}
            className="absolute top-3 right-3 p-2.5 rounded-xl bg-white/95 text-[hsl(var(--text-primary-strong))] shadow-[var(--shadow-level-2)] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white hover:shadow-[var(--shadow-level-3)] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)]"
            aria-label="Expand screenshot"
          >
            <ZoomIn className="h-5 w-5" strokeWidth={1.5} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
