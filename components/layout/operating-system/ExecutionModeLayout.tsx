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
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-[var(--env-base)]">
        <p className="text-[14px] leading-relaxed text-[hsl(var(--text-tertiary))]">
          Select a ticket to start. Turn on Execution Mode from the session view.
        </p>
      </div>
    );
  }

  const progressPercent = item.total > 0 ? (item.index / item.total) * 100 : 0;
  const disabled = isProcessing;

  return (
    <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden bg-[rgba(0,0,0,0.03)]">
      {/* Focus chamber: dimmed env + subtle spotlight behind content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-none">
        <div className="absolute inset-0 bg-[var(--env-base)] opacity-95" />
        <div
          className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-[140%] max-w-[900px] h-[60vh] rounded-[50%] opacity-40"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255,255,255,0.9) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Top bar: Exit | Progress prominent */}
      <header className="relative z-10 shrink-0 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onExitExecutionMode}
            disabled={disabled}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[hsl(var(--text-secondary-soft))] hover:text-[hsl(var(--text-primary-strong))] rounded-xl px-2.5 py-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Exit Execution Mode"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Exit Execution Mode
          </button>
          <span className="text-[20px] font-semibold tabular-nums text-[hsl(var(--text-primary-strong))] leading-none tracking-[-0.02em]">
            {item.index} <span className="text-[hsl(var(--text-tertiary))] font-normal">/ {item.total}</span>
          </span>
        </div>
        <div className="mt-3 w-full h-1.5 rounded-full bg-[var(--layer-2-border)] overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-[width] duration-200 ease-out shadow-[0_0_12px_rgba(26,86,219,0.25)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Content: centered, elevated, max-w 920px */}
      <div
        ref={contentScrollRef}
        className={`relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden transition-opacity duration-200 ${disabled ? "opacity-90" : "opacity-100"}`}
      >
        <div className="max-w-[920px] mx-auto px-6 py-6 pb-16 flex flex-col items-center">
          <h1 className="w-full text-center text-[24px] font-semibold leading-[1.3] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))] mb-6">
            {item.title}
          </h1>

          <div className="w-full text-center mb-8">
            {descriptionDraft !== undefined && setDescriptionDraft && saveDescription ? (
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={() => void saveDescription()}
                disabled={disabled}
                className="w-full min-h-[80px] text-[15px] leading-[1.7] text-[hsl(var(--text-primary-strong))] text-center bg-transparent border-0 resize-none focus:outline-none focus-visible:ring-0 placeholder:text-[hsl(var(--text-tertiary))]"
                placeholder="Description…"
              />
            ) : (
              <p className="text-[15px] leading-[1.7] text-[hsl(var(--text-secondary-soft))] whitespace-pre-wrap">
                {item.description || "No description."}
              </p>
            )}
          </div>

          {hasScreenshot && (
            <div className="w-full mb-10 flex justify-center">
              <div className="relative w-full max-w-[920px] aspect-video max-h-[400px] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-level-3)] border border-[var(--card-border)] transition-transform duration-200 hover:scale-[1.01] group">
                <Image
                  src={item.screenshotUrl!}
                  alt="Screenshot"
                  fill
                  className="object-contain"
                  unoptimized={item.screenshotUrl!.startsWith("data:")}
                  sizes="(max-width: 1024px) 100vw, 920px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                <button
                  type="button"
                  onClick={onExpandImage}
                  disabled={disabled}
                  className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-xl bg-white/95 text-[hsl(var(--text-primary-strong))] shadow-[var(--shadow-level-2)] hover:bg-white hover:shadow-[var(--shadow-level-3)] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] disabled:opacity-60"
                  aria-label="Zoom screenshot (Z)"
                >
                  <ZoomIn className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {hasActionSteps ? (
            <div className="w-full max-w-[920px] mb-10 px-0 py-1">
              <ExecutionModeActionSteps actionSteps={actionSteps} />
            </div>
          ) : null}

          {/* Action bar: Resolve & Next dominant, Skip subtle, others secondary. Centered, elevated. */}
          <div className="flex flex-col items-center justify-center gap-6 w-full mt-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onSkip}
                disabled={disabled}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] text-[hsl(var(--text-tertiary))] text-[14px] font-medium hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-secondary-soft))] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <SkipForward className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                Skip
              </button>
              <button
                type="button"
                onClick={onNeedsClarification}
                disabled={disabled}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] text-[hsl(var(--text-secondary-soft))] text-[14px] font-medium hover:bg-[var(--layer-2-hover-bg)] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <MessageCircleQuestion className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                Needs clarification
              </button>
              <button
                type="button"
                onClick={onAssign}
                disabled={disabled}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] text-[hsl(var(--text-secondary-soft))] text-[14px] font-medium hover:bg-[var(--layer-2-hover-bg)] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <UserPlus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                Assign
              </button>
              <button
                type="button"
                onClick={handleResolveAndNext}
                disabled={disabled}
                className="inline-flex items-center justify-center gap-2 min-w-[180px] h-12 px-8 rounded-xl bg-[var(--color-primary)] text-white text-[15px] font-semibold shadow-[0_4px_14px_rgba(26,86,219,0.35)] hover:bg-[var(--color-primary-hover)] hover:shadow-[0_6px_20px_rgba(26,86,219,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_2px_8px_rgba(26,86,219,0.3)] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} aria-hidden />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} aria-hidden />
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
                className="w-full text-[14px] px-4 py-2.5 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] placeholder:text-[hsl(var(--text-tertiary))]"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* Full-screen screenshot zoom */}
      {screenshotZoomed && item.screenshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6 cursor-pointer"
          onClick={() => setScreenshotZoomed(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setScreenshotZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setScreenshotZoomed(false)}
            className="absolute top-5 right-5 p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close zoom"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden shadow-[var(--shadow-level-5)]" onClick={(e) => e.stopPropagation()}>
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
