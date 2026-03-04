"use client";

import Image from "next/image";
import { Expand } from "lucide-react";

interface ScreenshotBlockProps {
  screenshotUrl: string;
  onExpand: () => void;
}

export function ScreenshotBlock({ screenshotUrl, onExpand }: ScreenshotBlockProps) {
  return (
    <div className="rounded-xl border border-[var(--layer-2-border)] bg-white/95 backdrop-blur-[6px] p-3 shadow-[var(--layer-2-shadow)]">
      <div className="relative overflow-hidden rounded-lg max-h-[317px] bg-white/90 border border-[var(--layer-2-border)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Image
          src={screenshotUrl}
          alt="Screenshot"
          width={800}
          height={317}
          sizes="(max-width: 1024px) 100vw, 768px"
          className="w-full h-auto max-h-[317px] object-contain"
          loading="lazy"
        />
        <button
          type="button"
          onClick={onExpand}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-colors duration-120 cursor-pointer"
          aria-label="Expand screenshot"
        >
          <Expand size={14} />
        </button>
      </div>
    </div>
  );
}
