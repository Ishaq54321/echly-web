"use client";

import { Expand } from "lucide-react";

interface ScreenshotBlockProps {
  screenshotUrl: string;
  onExpand: () => void;
}

export function ScreenshotBlock({ screenshotUrl, onExpand }: ScreenshotBlockProps) {
  return (
    <div className="mt-8 mb-16">
      <div className="relative rounded-3xl overflow-hidden border border-[hsl(var(--border))] border-opacity-50 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] group transition">
        <button
          onClick={onExpand}
          className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
        >
          <Expand size={16} />
        </button>

        <img
          src={screenshotUrl}
          alt="Screenshot"
          className="w-full object-contain bg-black/5"
        />
      </div>
    </div>
  );
}
