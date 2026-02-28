"use client";

import Image from "next/image";
import { Share2 } from "lucide-react";

interface Props {
  title?: string;
  feedbackCount: number;
  copied: boolean;
  onCopy: () => void;
}

export default function SessionHeader({
  title,
  feedbackCount,
  copied,
  onCopy,
}: Props) {
  return (
    <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-12 py-7 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Image
            src="/Echly_logo.svg"
            alt="Echly"
            width={34}
            height={34}
          />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {feedbackCount} feedback items
            </p>
          </div>
        </div>

        <button
          onClick={onCopy}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl
                     bg-white border border-slate-300
                     text-slate-700 hover:text-rose-600
                     hover:border-rose-300 hover:bg-rose-50
                     transition-all duration-200"
        >
          <Share2 size={16} />
          {copied ? "Copied ✓" : "Share"}
        </button>
      </div>
    </div>
  );
}