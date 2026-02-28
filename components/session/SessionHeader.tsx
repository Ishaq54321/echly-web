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
    <div className="flex items-start justify-between py-10 border-b border-[hsl(var(--border))]">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))] leading-snug">
          {title ?? "Session"}
        </h1>
        <div className="text-sm text-[hsl(var(--text-muted))] flex items-center gap-3">
          <span>{feedbackCount} feedback item{feedbackCount !== 1 ? "s" : ""}</span>
          {sessionId != null && sessionId !== "" && (
            <>
              <span className="opacity-50">•</span>
              <span>{sessionId}</span>
            </>
          )}
          {dateStr != null && (
            <>
              <span className="opacity-50">•</span>
              <span>{dateStr}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] hover:bg-[hsl(var(--surface-2))] transition-colors duration-150 font-medium text-[hsl(var(--text-primary))]"
        >
          <Share2 size={16} />
          {copied ? "Copied" : "Share"}
        </button>
      </div>
    </div>
  );
}
