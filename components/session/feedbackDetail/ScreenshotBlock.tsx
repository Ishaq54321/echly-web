"use client";

import Image from "next/image";
import { Expand } from "lucide-react";

interface ScreenshotBlockProps {
  screenshotUrl: string;
  onExpand: () => void;
}

export function ScreenshotBlock({ screenshotUrl, onExpand }: ScreenshotBlockProps) {
  return (
    <div className="rounded-lg border border-[var(--layer-2-border)] bg-white p-2.5">
      <div className="flex items-center justify-between mb-1.5 text-xs text-[hsl(var(--text-tertiary))] tracking-normal">
        <span>Attachment</span>
        <span>Screenshot</span>
      </div>
      <div className="relative overflow-hidden rounded-md max-h-[317px] bg-white border border-[var(--layer-2-border)]">
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
