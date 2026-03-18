"use client";

import Image from "next/image";
import { ZoomIn } from "lucide-react";

interface ScreenshotBlockProps {
  screenshotUrl: string;
  onExpand: () => void;
}

export function ScreenshotBlock({ screenshotUrl, onExpand }: ScreenshotBlockProps) {
  return (
    <div className="rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-level-3)] border border-[var(--card-border)] transition-transform duration-200 hover:scale-[1.01] group">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] max-h-[317px] bg-[var(--layer-2-bg)]">
        <div className="absolute inset-0 animate-pulse rounded-lg bg-[var(--layer-2-border)]/50 z-0" aria-hidden />
        <Image
          src={screenshotUrl}
          alt="Screenshot"
          width={800}
          height={317}
          sizes="(max-width: 1024px) 100vw, 768px"
          className="relative z-10 w-full h-auto max-h-[317px] object-contain rounded-lg"
          loading="lazy"
          onLoad={(e) => (e.currentTarget.previousElementSibling as HTMLElement)?.classList?.add("hidden")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent pointer-events-none z-[5]" />
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
