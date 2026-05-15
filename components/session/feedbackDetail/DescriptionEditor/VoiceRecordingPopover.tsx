"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Square, X } from "lucide-react";
import { toast } from "sonner";
import type { Editor } from "@tiptap/react";
import { useVoiceRecording } from "./useVoiceRecording";
import { usePortalHost } from "./PortalHost";
import { Waveform } from "@/lib/capture-engine/pill/Waveform";

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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
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

            <div className="flex justify-center" style={{ height: 48 }}>
              <Waveform
                source={analyserNode}
                barCount={48}
                height={48}
                width={232}
                color="var(--overlay-dark-text)"
              />
            </div>

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
