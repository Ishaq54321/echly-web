"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatGPTWaveform from "@/components/ChatGPTWaveform";

export type VoiceCapturePanelProps = {
  /** 0–1 normalized microphone level (legacy, visualizer uses analyser when provided) */
  audioLevel: number;
  onFinish: () => void;
  /** Optional screenshot for context (session element capture) */
  screenshot?: string;
  isListening?: boolean;
  /** AnalyserNode for real-time horizontal bar visualizer */
  analyser?: AnalyserNode | null;
};

export function VoiceCapturePanel({
  onFinish,
  screenshot,
  isListening = true,
  analyser = null,
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

  /* Micro interaction: scale 0.98 → 1 when recording starts */
  useEffect(() => {
    if (analyser && !recordingStarted) {
      setRecordingStarted(true);
    }
  }, [analyser, recordingStarted]);

  const elementPreview = screenshot ? (
    <img
      src={screenshot}
      alt="Capture"
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ) : null;

  return (
    <div
      className={`voice-capture ${recordingStarted ? "voice-capture--recording" : ""}`}
      data-echly-ui="true"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 420,
        padding: 24,
        borderRadius: 16,
        background: "linear-gradient(180deg, #0f172a, #020617)",
        boxShadow: "0 20px 60px rgba(0,0,0,.35)",
        zIndex: 2147483647,
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 16,
      }}
    >
      {screenshot && (
        <div className="capture-preview">{elementPreview}</div>
      )}

      <h2 className="voice-capture-title">Voice Feedback</h2>
      <p className="voice-capture-instruction">Describe the issue on this page.</p>

      <div className="capture-visualizer">
        <ChatGPTWaveform analyser={analyser} />
      </div>

      <div className="capture-status">
        {isListening ? "Listening — describe the issue" : "Paused"}
      </div>

      <div className="voice-capture-actions">
        <button type="button" className="finish-btn" onClick={onFinish}>
          Finish
        </button>
      </div>
    </div>
  );
}
