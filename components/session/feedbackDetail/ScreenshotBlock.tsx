"use client";

import { Expand } from "lucide-react";

interface ScreenshotBlockProps {
  screenshotUrl: string;
  onExpand: () => void;
}

export function ScreenshotBlock({ screenshotUrl, onExpand }: ScreenshotBlockProps) {
  return (
    <div className="mt-4 rounded-lg border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--surface-1))] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-3 text-xs text-[hsl(var(--text-muted))] tracking-normal">
        <span>Attachment</span>
        <span>Screenshot</span>
      </div>
      <div className="relative overflow-hidden rounded-md max-h-[400px] bg-neutral-50">
        <img
          src={screenshotUrl}
          alt="Screenshot"
          className="w-full h-auto max-h-[400px] object-contain"
        />
        <button
          type="button"
          onClick={onExpand}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label="Expand screenshot"
        >
          <Expand size={14} />
        </button>
      </div>
    </div>
  );
}
