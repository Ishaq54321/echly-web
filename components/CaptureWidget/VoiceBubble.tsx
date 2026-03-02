"use client";

import React, { useEffect, useState } from "react";
import { MicOrb } from "./MicOrb";

export type VoiceBubbleProps = {
  isListening: boolean;
  isProcessing: boolean;
  isExiting?: boolean;
  audioLevel: number;
  sentiment: "negative" | "neutral" | "positive";
  /** Live transcript of what user is saying */
  liveTranscript?: string;
  /** Live AI title suggestion (below transcript) */
  aiPreviewTitle?: string | null;
  /** Brief green pulse after success */
  orbSuccess?: boolean;
  onDone: () => void;
};

const MOTION = "140ms cubic-bezier(0.2, 0.8, 0.2, 1)";

/**
 * AI voice capsule. Renders in #echly-ai-root only.
 * Structure: [ Mic Orb ] [ Live Transcript Preview (transcript + AI title below) ]
 */
export function VoiceBubble({
  isListening,
  isProcessing,
  isExiting = false,
  audioLevel,
  sentiment,
  liveTranscript = "",
  aiPreviewTitle = null,
  orbSuccess = false,
  onDone,
}: VoiceBubbleProps) {
  const isSpeaking = isListening && audioLevel > 0.12;
  const [showTranscript, setShowTranscript] = useState(false);
  const [showAiPreview, setShowAiPreview] = useState(false);

  const wordCount = liveTranscript.trim() ? liveTranscript.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (wordCount > 5) {
      const t = setTimeout(() => setShowTranscript(true), 80);
      return () => clearTimeout(t);
    } else {
      setShowTranscript(false);
    }
  }, [wordCount]);

  useEffect(() => {
    if (aiPreviewTitle && aiPreviewTitle.length > 5) {
      const t = setTimeout(() => setShowAiPreview(true), 80);
      return () => clearTimeout(t);
    } else {
      setShowAiPreview(false);
    }
  }, [aiPreviewTitle]);

  return (
    <div
      className={`echly-capsule ${isExiting ? "echly-capsule--exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={isProcessing ? "Structuring insight" : "Describe the issue"}
    >
      <div className="echly-capsule-orb">
        <MicOrb
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          isExiting={isExiting}
          isProcessing={isProcessing}
          isSuccess={orbSuccess}
          sentiment={sentiment}
        />
      </div>
      <div className="echly-capsule-transcript-block">
        {isProcessing ? (
          <span className="echly-capsule-text">
            Structuring insight…
            <span className="echly-capsule-underline" aria-hidden />
          </span>
        ) : (
          <>
            <span
              className="echly-capsule-transcript"
              style={{
                opacity: showTranscript ? 1 : 0,
                transition: `opacity ${MOTION}`,
              }}
            >
              {liveTranscript || "Describe the issue…"}
            </span>
            {aiPreviewTitle && (
              <span
                className="echly-ai-preview"
                style={{
                  opacity: showAiPreview ? 1 : 0,
                  transition: `opacity 200ms ease-out`,
                }}
              >
                {aiPreviewTitle}
              </span>
            )}
          </>
        )}
      </div>
      {isListening && !isProcessing && (
        <button
          type="button"
          className="echly-capsule-done"
          onClick={onDone}
          aria-label="Done recording"
        >
          Done
        </button>
      )}
    </div>
  );
}
