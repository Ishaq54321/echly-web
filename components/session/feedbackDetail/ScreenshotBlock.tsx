"use client";

import { Expand } from "lucide-react";

interface ScreenshotBlockProps {
  screenshotUrl: string;
  onExpand: () => void;
}

export function ScreenshotBlock({ screenshotUrl, onExpand }: ScreenshotBlockProps) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-1.5 text-xs text-[hsl(var(--text-secondary))] opacity-90 tracking-normal">
        <span>Attachment</span>
        <span>Screenshot</span>
      </div>
      <div className="relative overflow-hidden rounded-md max-h-[317px] bg-neutral-50">
        <img
          src={screenshotUrl}
          alt="Screenshot"
          className="w-full h-auto max-h-[317px] object-contain"
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
