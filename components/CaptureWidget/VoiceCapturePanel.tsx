"use client";

import React, { useMemo } from "react";

export type VoiceCapturePanelProps = {
  /** 0–1 normalized microphone level for waveform */
  audioLevel: number;
  onFinish: () => void;
  /** Optional screenshot for context (session element capture) */
  screenshot?: string;
  isListening?: boolean;
};

const WAVEFORM_BARS = 24;

export function VoiceCapturePanel({
  audioLevel,
  onFinish,
  screenshot,
  isListening = true,
}: VoiceCapturePanelProps) {
  const bars = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < WAVEFORM_BARS; i++) {
      const t = i / (WAVEFORM_BARS - 1);
      const center = 0.5;
      const dist = Math.abs(t - center);
      const base = Math.max(0.15, 1 - dist * 1.2);
      const level = isListening ? base * (0.4 + 0.6 * audioLevel) : base * 0.3;
      arr.push(level);
    }
    return arr;
  }, [audioLevel, isListening]);

  return (
    <div
      className="voice-capture"
      data-echly-ui="true"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(380px, 92vw)",
        borderRadius: 14,
        background: "rgba(20,22,28,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.08)",
        zIndex: 2147483647,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: '"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif',
      }}
    >
      {screenshot && (
        <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(0,0,0,0.3)",
              aspectRatio: "16/10",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={screenshot}
              alt="Capture"
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      )}
      <div className="voice-waveform" style={{ padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 56 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 24,
              borderRadius: 3,
              background: "rgba(90,120,255,0.7)",
              transform: `scaleY(${h})`,
              transformOrigin: "center",
              transition: "transform 0.08s ease-out",
            }}
          />
        ))}
      </div>
      <div className="voice-controls" style={{ padding: "0 20px 20px", display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          className="voice-stop"
          onClick={onFinish}
          style={{
            padding: "12px 24px",
            borderRadius: 10,
            border: "none",
            background: "#466EFF",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Finish
        </button>
      </div>
    </div>
  );
}
