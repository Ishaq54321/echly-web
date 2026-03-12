"use client";

import { Share2 } from "lucide-react";

interface Props {
  title?: string;
  feedbackCount: number;
  sessionId?: string;
  createdAt?: { toDate?: () => Date; seconds?: number } | null;
  copied: boolean;
  onCopy: () => void;
}

function formatCreatedAt(
  createdAt: { toDate?: () => Date; seconds?: number } | null | undefined
): string | null {
  if (!createdAt) return null;
  try {
    const date =
      typeof createdAt.toDate === "function"
        ? createdAt.toDate()
        : createdAt.seconds != null
          ? new Date(createdAt.seconds * 1000)
          : null;
    return date ? date.toLocaleDateString(undefined, { dateStyle: "medium" }) : null;
  } catch {
    return null;
  }
}

export default function SessionHeader({
  title,
  feedbackCount,
  sessionId,
  createdAt,
  copied,
  onCopy,
}: Props) {
  const dateStr = formatCreatedAt(createdAt ?? null);

  return (
    <div className="flex items-start justify-between py-6 border-b border-[hsl(var(--border))]">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))] leading-snug">
          {title ?? "Session"}
        </h1>
        <div className="text-sm text-[hsl(var(--text-secondary))] opacity-[0.92] flex items-center gap-2">
          <span>{feedbackCount} feedback item{feedbackCount !== 1 ? "s" : ""}</span>
          {sessionId != null && sessionId !== "" && (
            <>
              <span className="opacity-60" aria-hidden>•</span>
              <span>{sessionId}</span>
            </>
          )}
          {dateStr != null && (
            <>
              <span className="opacity-60" aria-hidden>•</span>
              <span>{dateStr}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 text-[14px] px-4 py-2 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration)] font-medium text-[hsl(var(--text-primary-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer"
        >
          <Share2 size={16} />
          {copied ? "Copied" : "Share"}
        </button>
      </div>
    </div>
  );
}
