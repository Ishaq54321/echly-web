"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Square, X } from "lucide-react";
import { toast } from "sonner";
import type { Editor } from "@tiptap/react";
import { useVoiceRecording } from "./useVoiceRecording";
import { usePortalHost } from "./PortalHost";

export type VoiceStatus = "recording" | "transcribing" | "done" | null;

interface VoiceRecordingPopoverProps {
  anchorRef: RefObject<HTMLButtonElement | null>;
  editor: Editor | null;
  onClose: () => void;
  /** Fires after a successful transcription has been inserted and auto-selected. */
  onTranscriptionComplete?: () => void;
  /** Optional fetch wrapper for the transcription request (extension builds inject auth). */
  fetchClient?: (url: string, init?: RequestInit) => Promise<Response>;
  /** Notifies the parent of the popover's current status so the dictate
   * button can render the transcribing/done pill inline once recording
   * finishes and the floating popover dismisses itself. */
  onStatusChange?: (status: VoiceStatus) => void;
}

const POPOVER_WIDTH = 280;
const POPOVER_MAX_HEIGHT = 160;
const GAP = 8;

const WAVE_HEIGHT = 48;
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const STEP = BAR_WIDTH + BAR_GAP;
const MIN_BAR_PX = 2;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cssSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: WAVE_HEIGHT });
  const barCountRef = useRef(40);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = window.devicePixelRatio || 1;

    const apply = (width: number) => {
      const cssW = Math.max(1, Math.floor(width));
      const cssH = WAVE_HEIGHT;
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cssSizeRef.current = { w: cssW, h: cssH };
      barCountRef.current = Math.max(8, Math.floor(cssW / STEP));
    };

    apply(container.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      apply(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let bufferLength = 0;
    let frequencyData: Uint8Array<ArrayBuffer> | null = null;

    if (analyser) {
      bufferLength = analyser.frequencyBinCount;
      frequencyData = new Uint8Array(new ArrayBuffer(bufferLength));
    }

    /* Read brand colors from CSS variables so the waveform matches the
       active theme in both the dashboard and the extension shadow DOM. */
    const styles = getComputedStyle(canvas);
    const brandStart = styles.getPropertyValue("--brand").trim() || "#5A49BF";
    const brandEnd = styles.getPropertyValue("--brand-secondary").trim() || "#7B6ACC";

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const { w: cssW, h: cssH } = cssSizeRef.current;
      const barCount = barCountRef.current;
      if (cssW <= 0 || barCount <= 0) return;

      ctx.clearRect(0, 0, cssW, cssH);

      const gradient = ctx.createLinearGradient(0, 0, cssW, 0);
      gradient.addColorStop(0, brandStart);
      gradient.addColorStop(1, brandEnd);
      ctx.fillStyle = gradient;

      const centerY = cssH / 2;
      const maxHeight = cssH - 4;

      // Total drawn width to center bars horizontally
      const drawWidth = barCount * STEP - BAR_GAP;
      const offsetX = Math.max(0, (cssW - drawWidth) / 2);

      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
      }

      for (let i = 0; i < barCount; i++) {
        let value = 0;
        if (analyser && frequencyData && bufferLength > 0) {
          // Sample logarithmically-ish across the lower frequency bins.
          const binIndex = Math.min(
            bufferLength - 1,
            Math.floor((i / barCount) * (bufferLength * 0.7)),
          );
          value = frequencyData[binIndex] / 255;
        }

        const rawHeight = value * maxHeight;
        const barHeight = Math.max(MIN_BAR_PX, rawHeight);
        const x = offsetX + i * STEP;
        const y = centerY - barHeight / 2;

        // Rounded vertical bar
        const r = BAR_WIDTH / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + BAR_WIDTH - r, y);
        ctx.quadraticCurveTo(x + BAR_WIDTH, y, x + BAR_WIDTH, y + r);
        ctx.lineTo(x + BAR_WIDTH, y + barHeight - r);
        ctx.quadraticCurveTo(
          x + BAR_WIDTH,
          y + barHeight,
          x + BAR_WIDTH - r,
          y + barHeight,
        );
        ctx.lineTo(x + r, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [analyser]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: WAVE_HEIGHT }}
      className="relative"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

export function VoiceRecordingPopover({
  anchorRef,
  editor,
  onClose,
  onTranscriptionComplete,
  fetchClient,
  onStatusChange,
}: VoiceRecordingPopoverProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [showDone, setShowDone] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const portalHost = usePortalHost();

  const handleTranscribed = (transcript: string) => {
    if (!editor || editor.isDestroyed) {
      onClose();
      return;
    }

    const { from } = editor.state.selection;

    editor
      .chain()
      .focus()
      .insertContent(transcript)
      .run();

    const to = editor.state.selection.from;
    if (to > from) {
      editor.chain().setTextSelection({ from, to }).run();
    }

    toast.success("Voice note transcribed");

    if (to > from) {
      onTranscriptionComplete?.();
    }

    setShowDone(true);
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleError = (msg: string) => {
    toast.error(msg);
    // Close popover on error (after a short delay so the user sees nothing
    // weird flash). The toast carries the message.
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 50);
  };

  const {
    isRecording,
    isTranscribing,
    duration,
    analyserNode,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecording({
    onTranscribed: handleTranscribed,
    onError: handleError,
    fetchClient,
  });

  // Position the popover under the anchor.
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Anchor pill sits at bottom-right of the editor — align the popover's
      // right edge to the pill's right edge so it grows leftward, and place
      // it above the pill.
      let left = rect.right - POPOVER_WIDTH;
      let top = rect.top - POPOVER_MAX_HEIGHT - GAP;

      if (left + POPOVER_WIDTH > viewportWidth - 16) {
        left = viewportWidth - POPOVER_WIDTH - 16;
      }
      if (left < 16) left = 16;

      // If there's no room above, fall back to below the pill.
      if (top < 16) {
        top = rect.bottom + GAP;
      }
      if (top + POPOVER_MAX_HEIGHT > viewportHeight - 16) {
        top = viewportHeight - POPOVER_MAX_HEIGHT - 16;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef]);

  // Kick off recording on mount. Under StrictMode the effect runs twice;
  // the hook's cleanup tears down the first attempt so a second start is safe.
  useEffect(() => {
    void startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelRecording();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cancelRecording, onClose]);

  // Click outside to cancel
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (popoverRef.current && popoverRef.current.contains(target)) return;
      if (anchorRef.current && anchorRef.current.contains(target)) return;
      cancelRecording();
      onClose();
    };
    const t = window.setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [anchorRef, cancelRecording, onClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  // Notify the parent of the current status so the dictate button can
  // render the transcribing/done pill inline.
  useEffect(() => {
    if (!onStatusChange) return;
    if (showDone) onStatusChange("done");
    else if (isTranscribing) onStatusChange("transcribing");
    else if (isRecording) onStatusChange("recording");
    else onStatusChange(null);
  }, [isRecording, isTranscribing, showDone, onStatusChange]);

  // Clear status on unmount so a fresh open starts from a clean slate.
  useEffect(() => {
    return () => onStatusChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once recording ends, the dictate button takes over the UI — the
  // floating popover hides itself so transcribing/done only renders in
  // the bottom-right where the user expects.
  if (isTranscribing || showDone) return null;

  if (typeof document === "undefined" || !position || !portalHost) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={popoverRef}
        key="voice-popover"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="description-editor-portal fixed select-none"
        style={{
          zIndex: 2147483700,
          top: position.top,
          left: position.left,
          width: POPOVER_WIDTH,
          borderRadius: 16,
          background: "var(--overlay-dark-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--overlay-dark-border)",
          boxShadow: "var(--overlay-dark-shadow)",
          color: "var(--overlay-dark-text)",
          padding: 16,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <>
          <div className="flex items-center gap-2 mb-3">
              <span
                aria-hidden
                className="vrp-rec-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "var(--color-danger)",
                  display: "inline-block",
                }}
              />
              <span className="text-[13px] font-medium text-white">
                {isRecording ? "Recording..." : "Starting..."}
              </span>
              <span
                className="ml-auto text-[12px] tabular-nums"
                style={{ color: "var(--overlay-dark-text-muted)" }}
              >
                {formatTime(duration)}
              </span>
            </div>

            <Waveform analyser={analyserNode} />

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  cancelRecording();
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-1.5 h-[30px] px-3 rounded-md text-[12.5px] font-medium cursor-pointer transition-colors"
                style={{
                  background: "transparent",
                  color: "var(--overlay-dark-text-soft)",
                  border: "1px solid var(--overlay-dark-border-strong)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--overlay-dark-inset-lo)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--overlay-dark-text)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--overlay-dark-text-soft)";
                }}
              >
                <X size={13} strokeWidth={2.2} />
                Cancel
              </button>
              <button
                type="button"
                disabled={!isRecording}
                onClick={() => {
                  void stopRecording();
                }}
                className="inline-flex items-center justify-center gap-1.5 h-[30px] px-3.5 rounded-md text-[12.5px] font-semibold cursor-pointer transition-opacity ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--brand)",
                  color: "var(--overlay-dark-text)",
                  boxShadow: "0 1px 0 var(--overlay-dark-inset-hi) inset",
                }}
              >
                <Square
                  size={11}
                  strokeWidth={0}
                  fill="white"
                  className="rounded-sm"
                />
                Stop
              </button>
            </div>
        </>

        <style jsx>{`
          @keyframes vrp-pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.3);
              opacity: 0.5;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .vrp-rec-dot {
            animation: vrp-pulse 1.5s ease-in-out infinite;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>,
    portalHost,
  );
}
