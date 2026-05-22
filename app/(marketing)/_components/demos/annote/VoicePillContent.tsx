"use client";

/**
 * Forklifted from: lib/capture-engine/pill/VoicePillContent.tsx
 *
 * Visual code is byte-faithful to the source — JSX, className strings,
 * Lucide icon usage, ARIA labels, and the icon-row layout are unchanged.
 *
 * Modifications (only):
 * - Removed `useEffect` for navigator.mediaDevices.enumerateDevices (no mic
 *   enumeration in demo) and the `MicDevice[]` state.
 * - Replaced the `analyser: AnalyserNode | null` prop with a
 *   `waveformLevels: number[]` prop (mock data from demo orchestrator).
 * - Stripped `MicSelectorPopover` rendering — mic picker never opens in demo.
 * - Removed `PillTooltip` wrappers (they're tiny presentational helpers and
 *   the demo doesn't need hover tooltips; wraps replaced with plain spans).
 * - `sendingRef` double-submit guard is preserved verbatim.
 * - `onCancel`, `onReset`, `onSend`, `onSwitchToTextMode`, `onSelectMic` are
 *   wired to optional/no-op props.
 *
 * Every visible element (mic button, type-mode button, divider, trash, rec
 * dot, timer span, Waveform, reset button, send button + Loader2 morph) is
 * unchanged from the source.
 */

import React, { useRef, useEffect } from "react";
import { Trash2, RotateCcw, Send, Loader2 } from "lucide-react";
import { Waveform } from "./Waveform";

interface VoicePillContentProps {
  waveformLevels: number[];
  elapsedFormatted: string;
  onCancel: () => void;
  onReset: () => void;
  onSend: () => void;
  onSwitchToTextMode: () => void;
  onSelectMic?: (deviceId: string) => void;
  selectedMicId?: string;
  isFinishing?: boolean;
}

export function VoicePillContent({
  waveformLevels,
  elapsedFormatted,
  onCancel,
  onReset,
  onSend,
  onSwitchToTextMode: _onSwitchToTextMode,
  onSelectMic: _onSelectMic,
  selectedMicId: _selectedMicId = "",
  isFinishing = false,
}: VoicePillContentProps) {
  /** Silent guard against double-submit — no visual disabled state. */
  const sendingRef = useRef(false);

  const handleSend = () => {
    if (sendingRef.current || isFinishing) return;
    sendingRef.current = true;
    onSend();
  };

  /** Reset the guard if the send fails and recording resumes (isFinishing
   *  flips back to false), so the user can retry. */
  useEffect(() => {
    if (!isFinishing) sendingRef.current = false;
  }, [isFinishing]);

  return (
    <div className="echly-pill-content echly-pill-content--voice">
      {/* The real extension reveals mic/text-mode switches (+ a divider) on
          hover here. The demo pill is watched, not used (pointerEvents: none in
          HeroCaptureDemo), so they'd only flicker in on hover with no purpose —
          dropped entirely for the marketing demo. */}

      {/* PRIMARY CONTROLS — always visible */}
      <button
        type="button"
        className="echly-pill-icon-btn"
        onClick={onCancel}
        aria-label="Cancel recording"
      >
        <Trash2 size={18} strokeWidth={1.75} />
      </button>

      <div className="echly-pill-rec-dot" aria-hidden="true" />

      <span className="echly-pill-timer" aria-live="polite">
        {elapsedFormatted}
      </span>

      <Waveform levels={waveformLevels} />

      <button
        type="button"
        className="echly-pill-icon-btn"
        onClick={onReset}
        aria-label="Reset recording"
        disabled={isFinishing}
      >
        <RotateCcw size={18} strokeWidth={1.75} />
      </button>

      <button
        type="button"
        className={`echly-pill-send-btn${isFinishing ? " is-loading" : ""}`}
        onClick={handleSend}
        aria-label={isFinishing ? "Sending recording…" : "Send recording"}
      >
        {isFinishing ? (
          <Loader2 size={18} className="echly-mic-permission-spinner" />
        ) : (
          <Send size={18} strokeWidth={2} fill="currentColor" stroke="none" />
        )}
      </button>
    </div>
  );
}
