"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { CheckCircle2, MessageCircleQuestion, UserPlus, SkipForward } from "lucide-react";

export interface ExecutionModeViewProps {
  title: string;
  description?: string | null;
  screenshotUrl?: string | null;
  isResolved?: boolean;
  onDone: () => void;
  onNeedsClarification: () => void;
  onAssign: () => void;
  onSkip: () => void;
  onResolveAndNext: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  index: number;
  total: number;
}

export function ExecutionModeView({
  title,
  description,
  screenshotUrl,
  isResolved,
  onDone,
  onNeedsClarification,
  onAssign,
  onSkip,
  onResolveAndNext,
  onPrev,
  onNext,
  index,
  total,
}: ExecutionModeViewProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case "d":
          e.preventDefault();
          if (e.shiftKey) onResolveAndNext();
          else onDone();
          break;
        case "n":
          e.preventDefault();
          onSkip();
          break;
        case "a":
          e.preventDefault();
          onAssign();
          break;
        case "arrowleft":
          e.preventDefault();
          onPrev?.();
          break;
        case "arrowright":
          e.preventDefault();
          onNext?.();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onDone, onSkip, onAssign, onResolveAndNext, onPrev, onNext]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[var(--canvas-base)]">
      <div className="shrink-0 px-6 py-3 border-b border-[var(--layer-2-border)] flex items-center justify-between">
        <span className="text-[12px] text-[hsl(var(--text-tertiary))]">
          Item {index} of {total}
        </span>
        <span className="text-[11px] text-[hsl(var(--text-tertiary))]">
          D Done · N Next · A Assign · ← → navigate · Shift+D Resolve & Next
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center p-6">
        <h1 className="text-[18px] font-semibold text-[hsl(var(--text-primary-strong))] text-center mb-4 w-full max-w-2xl">
          {title || "Untitled"}
        </h1>

        {description && (
          <p className="text-[14px] text-[hsl(var(--text-secondary-soft))] mb-6 w-full max-w-2xl whitespace-pre-wrap">
            {description}
          </p>
        )}

        {screenshotUrl && (
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-[var(--structural-gray-ticket)] border border-[var(--layer-2-border)] mb-8">
            <Image
              src={screenshotUrl}
              alt="Screenshot"
              fill
              className="object-contain"
              unoptimized={screenshotUrl.startsWith("data:")}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-2xl">
          {!isResolved && (
            <button
              type="button"
              onClick={() => onResolveAndNext()}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[var(--accent-operational)] text-white text-[13px] font-medium hover:opacity-92 focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
            >
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
              Done
            </button>
          )}
          <button
            type="button"
            onClick={onNeedsClarification}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[var(--layer-2-border)] bg-white text-[13px] font-medium text-[hsl(var(--text-primary-strong))] hover:bg-black/[0.02] focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
          >
            <MessageCircleQuestion className="h-4 w-4" strokeWidth={1.5} />
            Needs clarification
          </button>
          <button
            type="button"
            onClick={onAssign}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[var(--layer-2-border)] bg-white text-[13px] font-medium text-[hsl(var(--text-primary-strong))] hover:bg-black/[0.02] focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.5} />
            Assign
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[var(--layer-2-border)] bg-white text-[13px] font-medium text-[hsl(var(--text-tertiary))] hover:bg-black/[0.02] focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
          >
            <SkipForward className="h-4 w-4" strokeWidth={1.5} />
            Skip
          </button>
          {!isResolved && (
            <button
              type="button"
              onClick={onResolveAndNext}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#E5E7EB] text-[hsl(var(--text-primary-strong))] text-[13px] font-medium hover:bg-[#E9ECEB] focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
            >
              Resolve & Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
