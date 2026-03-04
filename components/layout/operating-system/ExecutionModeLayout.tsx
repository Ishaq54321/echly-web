"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  MessageCircleQuestion,
  UserPlus,
  SkipForward,
  ArrowLeft,
  ZoomIn,
  X,
  Loader2,
} from "lucide-react";
import { ExecutionModeActionSteps } from "@/components/session/feedbackDetail/ExecutionModeActionSteps";
import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";

const SCROLL_MEMORY_KEY_PREFIX = "echly-exec-scroll-";

export interface ExecutionModeLayoutProps {
  item: (FeedbackItemShape & { index: number; total: number }) | null;
  onExitExecutionMode: () => void;
  onSkip: () => void;
  onNeedsClarification: () => void;
  onAssign: () => void;
  onResolveAndNext: () => void;
  onSaveActionSteps: (actionSteps: string[]) => Promise<void>;
  onExpandImage: () => void;
  descriptionDraft?: string;
  setDescriptionDraft?: (v: string) => void;
  saveDescription?: () => void | Promise<void>;
  sessionId?: string;
  streakCount?: number;
}

export function ExecutionModeLayout({
  item,
  onExitExecutionMode,
  onSkip,
  onNeedsClarification,
  onAssign,
  onResolveAndNext,
  onSaveActionSteps,
  onExpandImage,
  descriptionDraft,
  setDescriptionDraft,
  saveDescription,
  sessionId,
}: ExecutionModeLayoutProps) {
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [quickNoteValue, setQuickNoteValue] = useState("");
  const [screenshotZoomed, setScreenshotZoomed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const processingTriggeredForRef = useRef<string | null>(null);

  // Clear processing when ticket changes (navigated to next or error recovery)
  useEffect(() => {
    setIsProcessing(false);
    processingTriggeredForRef.current = null;
  }, [item?.id]);

  // Scroll memory: restore when ticket changes
  useEffect(() => {
    if (!item?.id || !sessionId || !contentScrollRef.current) return;
    try {
      const key = `${SCROLL_MEMORY_KEY_PREFIX}${sessionId}-${item.id}`;
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const top = parseInt(saved, 10);
        if (Number.isFinite(top)) {
          contentScrollRef.current.scrollTop = top;
        }
      }
    } catch {
      // ignore
    }
  }, [item?.id, sessionId]);

  // Scroll memory: save on scroll
  useEffect(() => {
    if (!item?.id || !sessionId) return;
    const el = contentScrollRef.current;
    if (!el) return;
    let timeout: ReturnType<typeof setTimeout>;
    const save = () => {
      try {
        const key = `${SCROLL_MEMORY_KEY_PREFIX}${sessionId}-${item.id}`;
        sessionStorage.setItem(key, String(el.scrollTop));
      } catch {
        // ignore
      }
    };
    const onScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(save, 150);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (timeout) clearTimeout(timeout);
      save();
    };
  }, [item?.id, sessionId]);

  const handleResolveAndNext = useCallback(() => {
    if (!item?.id || processingTriggeredForRef.current === item.id) return;
    processingTriggeredForRef.current = item.id;
    setIsProcessing(true);
    onResolveAndNext();
  }, [item?.id, onResolveAndNext]);

  // Global shortcuts (disabled when processing)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isProcessing) return;
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === "/") {
        e.preventDefault();
        setQuickNoteOpen((o) => !o);
        return;
      }
      if ((e.key === "z" || e.key === "Z") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setScreenshotZoomed((z) => !z);
        return;
      }
      if (inInput) return;
      const k = e.key.toLowerCase();
      switch (k) {
        case "d":
          e.preventDefault();
          if (e.shiftKey) handleResolveAndNext();
          else onSkip();
          break;
        case "n":
        case "s":
          e.preventDefault();
          onSkip();
          break;
        case "c":
          e.preventDefault();
          onNeedsClarification();
          break;
        case "a":
          e.preventDefault();
          onAssign();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isProcessing, handleResolveAndNext, onSkip, onNeedsClarification, onAssign]);

  // Normalize: always a real array, render all steps (no truncation)
  const actionSteps = Array.isArray(item?.actionSteps) ? [...item.actionSteps] : [];
  const hasScreenshot = Boolean(item?.screenshotUrl);
  const hasActionSteps = actionSteps.length > 0;

  if (!item) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-[var(--canvas-base)]">
        <p className="text-[14px] text-[hsl(var(--text-tertiary))]">
          Select a ticket to start. Turn on Execution Mode from the session view.
        </p>
      </div>
    );
  }

  const progressPercent = item.total > 0 ? (item.index / item.total) * 100 : 0;
  const disabled = isProcessing;

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-[var(--canvas-base)] overflow-hidden">
      {/* Top bar: Exit (left) | Position (right). Progress bar full width below. */}
      <header className="shrink-0 bg-[var(--canvas-base)]">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <button
            type="button"
            onClick={onExitExecutionMode}
            disabled={disabled}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[hsl(var(--text-secondary-soft))] hover:text-[hsl(var(--text-primary-strong))] rounded-lg px-2 py-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] focus-visible:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Exit Execution Mode"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Exit Execution Mode
          </button>
          <span className="text-[22px] font-medium tabular-nums text-[hsl(var(--text-primary-strong))] leading-none">
            {item.index} / {item.total}
          </span>
        </div>
        <div className="w-full h-[3px] rounded-full bg-[hsl(var(--layer-2-border))] overflow-hidden">
          <div
            className="h-full bg-[var(--accent-operational)] rounded-full transition-[width] duration-150 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Content: centered, max-w 920px, minimal chrome */}
      <div
        ref={contentScrollRef}
        className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden transition-opacity duration-150 ${disabled ? "opacity-[0.85]" : "opacity-100"}`}
      >
        <div className="max-w-[920px] mx-auto px-6 py-8 pb-12 flex flex-col items-center">
          <h1 className="w-full text-center text-[24px] font-semibold leading-[1.25] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))] mb-5">
            {item.title}
          </h1>

          <div className="w-full text-center mb-6">
            {descriptionDraft !== undefined && setDescriptionDraft && saveDescription ? (
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={() => void saveDescription()}
                disabled={disabled}
                className="w-full min-h-[80px] text-[15px] leading-[1.65] text-[hsl(var(--text-primary-strong))] text-center bg-transparent border-0 resize-none focus:outline-none focus-visible:ring-0 placeholder:text-[hsl(var(--text-tertiary))]"
                placeholder="Description…"
              />
            ) : (
              <p className="text-[15px] leading-[1.65] text-[hsl(var(--text-secondary-soft))] whitespace-pre-wrap">
                {item.description || "No description."}
              </p>
            )}
          </div>

          {hasScreenshot && (
            <div className="w-full mb-8 flex justify-center">
              <div className="relative w-full max-w-[920px] aspect-video max-h-[400px] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <Image
                  src={item.screenshotUrl!}
                  alt="Screenshot"
                  fill
                  className="object-contain"
                  unoptimized={item.screenshotUrl!.startsWith("data:")}
                  sizes="(max-width: 1024px) 100vw, 920px"
                />
                <button
                  type="button"
                  onClick={onExpandImage}
                  disabled={disabled}
                  className="absolute top-[12px] right-[12px] w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm hover:bg-white hover:shadow transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 disabled:opacity-60"
                  aria-label="Zoom screenshot (Z)"
                >
                  <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {hasActionSteps ? (
            <div className="w-full max-w-[920px] mb-10 px-0 py-1">
              <ExecutionModeActionSteps actionSteps={actionSteps} />
            </div>
          ) : null}

          {/* Action bar: Skip | Needs clarification | Assign | Resolve & Next — centered, primary right */}
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onSkip}
                disabled={disabled}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-gray-300 bg-white text-gray-700 text-[14px] font-medium hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <SkipForward className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                Skip
              </button>
              <button
                type="button"
                onClick={onNeedsClarification}
                disabled={disabled}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-[14px] font-medium hover:bg-amber-100 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <MessageCircleQuestion className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                Needs clarification
              </button>
              <button
                type="button"
                onClick={onAssign}
                disabled={disabled}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-gray-300 bg-white text-gray-600 text-[14px] font-medium hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <UserPlus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                Assign
              </button>
              <button
                type="button"
                onClick={handleResolveAndNext}
                disabled={disabled}
                className="inline-flex items-center justify-center gap-2 min-w-[160px] h-11 px-6 rounded-xl bg-blue-600 text-white text-[14px] font-medium hover:bg-blue-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    Resolve & Next
                  </>
                )}
              </button>
            </div>
          </div>

          {quickNoteOpen && (
            <div className="mt-8 w-full max-w-[920px] p-3">
              <input
                type="text"
                value={quickNoteValue}
                onChange={(e) => setQuickNoteValue(e.target.value)}
                placeholder="Quick note…"
                className="w-full text-[14px] px-3 py-2 rounded-lg border border-[var(--layer-2-border)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] placeholder:text-[hsl(var(--text-tertiary))]"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* Full-screen screenshot zoom */}
      {screenshotZoomed && item.screenshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setScreenshotZoomed(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setScreenshotZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setScreenshotZoomed(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close zoom"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={item.screenshotUrl}
              alt="Screenshot zoomed"
              fill
              className="object-contain"
              unoptimized={item.screenshotUrl.startsWith("data:")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
