"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

export function CommentModeIndicator({ onExit }: { onExit: () => void }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center gap-2 py-1.5 px-3 bg-[var(--accent-operational)]/10 border-b border-[var(--accent-operational)]/20 text-[12px] text-[hsl(var(--text-secondary-soft))]"
      role="status"
      aria-live="polite"
    >
      <MessageSquare className="h-3.5 w-3.5 text-[var(--accent-operational)]" strokeWidth={1.5} aria-hidden />
      <span>Comment mode active · Esc to exit</span>
      <button
        type="button"
        onClick={onExit}
        className="ml-2 text-[11px] font-medium text-[var(--accent-operational)] hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 rounded"
      >
        Exit
      </button>
    </div>
  );
}
