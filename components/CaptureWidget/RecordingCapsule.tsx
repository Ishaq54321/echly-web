"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { RecordingMicOrb } from "./RecordingMicOrb";

export type RecordingCapsuleProps = {
  visible: boolean;
  isActive: boolean;
  isProcessing: boolean;
  isExiting?: boolean;
  audioLevel: number;
  sentiment: "negative" | "neutral" | "positive";
  liveTranscript?: string;
  onDone: () => void;
  onCancel: () => void;
};

const LINE_HEIGHT = 1.4;
const FONT_SIZE = 14;
const MAX_LINES_MASK = 3;

function estimateLineCount(text: string, maxWidth: number = 320): number {
  if (!text.trim()) return 1;
  const chars = text.length;
  const pxPerChar = FONT_SIZE * 0.6;
  const charsPerLine = Math.floor(maxWidth / pxPerChar);
  return Math.max(1, Math.ceil(chars / charsPerLine));
}

export function RecordingCapsule({
  visible,
  isActive,
  isProcessing,
  isExiting = false,
  liveTranscript = "",
  onDone,
  onCancel,
}: RecordingCapsuleProps) {
  const [expanded, setExpanded] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive || isProcessing) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setExpanded(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setExpanded(false);
  }, [isActive, isProcessing]);

  const transcriptText = useMemo(() => {
    if (isProcessing) return "Structuring insight…";
    const t = liveTranscript.trim();
    if (t) return t;
    return "Listening…";
  }, [isProcessing, liveTranscript]);

  const statusText = useMemo(() => {
    if (isProcessing) return "Optimizing your insight…";
    return "Listening — we'll structure this.";
  }, [isProcessing]);

  const lineCount = useMemo(
    () => (expanded ? estimateLineCount(transcriptText, 320) : 1),
    [expanded, transcriptText]
  );
  const linesClass =
    lineCount >= MAX_LINES_MASK
      ? "echly-recording-capsule--lines-3"
      : lineCount >= 2
        ? "echly-recording-capsule--lines-2"
        : "";

  if (!visible) return null;

  return (
    <div className="echly-recording-row" aria-live="polite" role="status">
      <div
        className={[
          "echly-recording-capsule",
          expanded ? "echly-recording-capsule--expanded" : "",
          isProcessing ? "echly-recording-capsule--processing" : "",
          isExiting ? "echly-recording-capsule--exiting" : "",
          linesClass,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="echly-recording-orb">
          <RecordingMicOrb isRecording={isActive} isProcessing={isProcessing} />
        </div>

        <div className="echly-recording-center">
          <span className="echly-recording-status">{statusText}</span>
          <div className="echly-recording-transcript" ref={transcriptRef}>
            <span className="echly-recording-text">
              {transcriptText}
              {isProcessing && (
                <span className="echly-recording-underline" aria-hidden />
              )}
            </span>
          </div>
          {!isProcessing && (
            <button
              type="button"
              onClick={onCancel}
              className="echly-recording-cancel-pill"
              aria-label="Cancel recording"
            >
              Cancel
            </button>
          )}
        </div>

        {isActive && !isProcessing && (
          <button
            type="button"
            className="echly-recording-done"
            onClick={onDone}
            aria-label="Done recording"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
