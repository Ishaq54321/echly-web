"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ChatGPTWaveform from "@/components/ChatGPTWaveform";

export type VoiceCapturePanelProps = {
  /** 0–1 normalized microphone level (legacy, visualizer uses analyser when provided) */
  audioLevel: number;
  onFinish: () => void;
  /** Called when user cancels (e.g. Escape). Discards the capture session. */
  onCancel?: () => void;
  /** Optional screenshot for context (session element capture) */
  screenshot?: string;
  isListening?: boolean;
  /** AnalyserNode for real-time horizontal bar visualizer */
  analyser?: AnalyserNode | null;
  /** DOM node to portal into (#echly-capture-root). Required for correct viewport positioning. */
  captureRoot?: HTMLDivElement | null;
};

export function VoiceCapturePanel({
  onFinish,
  onCancel,
  screenshot,
  isListening = true,
  analyser = null,
  captureRoot = null,
}: VoiceCapturePanelProps) {
  const [voiceActive, setVoiceActive] = useState(false);
  const voiceActiveRef = useRef(false);
  const [recordingStarted, setRecordingStarted] = useState(false);

  useEffect(() => {
    voiceActiveRef.current = voiceActive;
  }, [voiceActive]);

  useEffect(() => {
    if (!analyser) {
      setVoiceActive(false);
      return;
    }
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let rafId: number;

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = dataArray.length ? sum / dataArray.length : 0;
      const isSpeaking = avg > 20;

      if (isSpeaking !== voiceActiveRef.current) {
        voiceActiveRef.current = isSpeaking;
        setVoiceActive(isSpeaking);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [analyser]);

  useEffect(() => {
    if (analyser && !recordingStarted) {
      setRecordingStarted(true);
    }
  }, [analyser, recordingStarted]);

  useEffect(() => {
    if (!onCancel) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const dimLayer = (
    <div
      className={`echly-dim-layer ${recordingStarted ? "echly-dim-layer--visible" : ""}`}
      aria-hidden
    />
  );

  const card = (
    <div
      className={`echly-capture-card ${recordingStarted ? "echly-capture-card--visible" : ""}`}
      data-echly-ui="true"
    >
      {screenshot && (
        <div className="echly-capture-screenshot-preview">
          <img src={screenshot} alt="Capture" />
        </div>
      )}

      <h2 className="echly-capture-title">Voice Feedback</h2>
      <p className="echly-capture-instruction">
        Describe the issue — Echly will structure it.
      </p>

      <div className="echly-capture-visualizer">
        <div className="echly-waveform-container">
          <ChatGPTWaveform analyser={analyser} />
        </div>
      </div>

      <div className="echly-capture-status">
        {isListening ? "Listening…" : "Paused"}
      </div>

      <button type="button" className="echly-finish-btn" onClick={onFinish}>
        Finish
      </button>
      <p className="echly-capture-cancel-hint">(Press Escape to cancel)</p>
    </div>
  );

  if (captureRoot) {
    return createPortal(
      <>
        {dimLayer}
        {card}
      </>,
      captureRoot
    );
  }

  return card;
}
