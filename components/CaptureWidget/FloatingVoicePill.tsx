"use client";

import React from "react";
import { MicOrb } from "./MicOrb";

type FloatingVoicePillProps = {
  isListening: boolean;
  isProcessing: boolean;
  isExiting?: boolean;
  audioLevel: number;
  sentiment: "negative" | "neutral" | "positive";
  onDone: () => void;
};

export function FloatingVoicePill({
  isListening,
  isProcessing,
  isExiting = false,
  audioLevel,
  sentiment,
  onDone,
}: FloatingVoicePillProps) {
  const isSpeaking = isListening && audioLevel > 0.12;

  return (
    <div
      className="echly-voice-pill"
      role="status"
      aria-live="polite"
      aria-label={isProcessing ? "Structuring insight" : "Describe the issue"}
    >
      <div className="echly-voice-pill-orb">
        <MicOrb
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          isExiting={isExiting}
          isProcessing={isProcessing}
          sentiment={sentiment}
        />
      </div>
      <span className="echly-voice-pill-text">
        {isProcessing ? (
          <>
            Structuring insight
            <span className="echly-voice-pill-dots" aria-hidden>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </>
        ) : (
          "Describe the issue…"
        )}
      </span>
      {isListening && !isProcessing && (
        <button
          type="button"
          className="echly-voice-pill-done"
          onClick={onDone}
          aria-label="Done recording"
        >
          Done
        </button>
      )}
    </div>
  );
}
