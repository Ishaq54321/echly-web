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
    <div className="px-8 py-4 border-b bg-[hsl(var(--surface-1))]">
      <div className="flex items-center gap-4">
        <Image
          src="/Echly_logo.svg"
          alt="Echly"
          width={34}
          height={34}
        />
        <h1 className="text-xl font-semibold text-[hsl(var(--text-primary))]">
          {title}
        </h1>
      </div>

      <div className="mt-8 bg-[hsl(var(--surface-2))] rounded-xl px-8 py-5 text-sm flex justify-between items-center space-x-10">
        <p className="text-[hsl(var(--text-secondary))]">
          {feedbackCount} feedback items
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 border border-opacity-60 rounded-lg px-3 py-1.5 text-sm font-medium
            text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-2))]"
        >
          <Share2 size={16} />
          {copied ? "Copied ✓" : "Share"}
        </button>
      </div>
    </div>
  );
}
