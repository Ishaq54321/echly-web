"use client";

import React, { useState } from "react";

export type SessionFeedbackPopupProps = {
  screenshot: string;
  isVoiceListening: boolean;
  onRecordVoice: () => void;
  onDoneVoice: () => void;
  onSaveText: (transcript: string) => void;
  onCancel?: () => void;
};

export function SessionFeedbackPopup({
  screenshot,
  isVoiceListening,
  onRecordVoice,
  onDoneVoice,
  onSaveText,
  onCancel,
}: SessionFeedbackPopupProps) {
  const [mode, setMode] = useState<"choose" | "voice" | "text">("choose");
  const [textInput, setTextInput] = useState("");

  const handleRecordVoice = () => {
    setMode("voice");
    onRecordVoice();
  };

  const handleWriteInstead = () => {
    setMode("text");
  };

  const handleSaveText = () => {
    const t = textInput.trim();
    if (t) onSaveText(t);
  };

  return (
    <div
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
        <p style={{ margin: "12px 0 0", fontSize: 13, fontWeight: 500, color: "#A1A1AA" }}>
          Speak or type feedback
        </p>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "choose" && (
          <>
            <button
              type="button"
              onClick={handleRecordVoice}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: "#466EFF",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Describe the change
            </button>
            <button
              type="button"
              onClick={handleWriteInstead}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.06)",
                color: "#F3F4F6",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Type feedback
            </button>
          </>
        )}

        {mode === "voice" && (
          <button
            type="button"
            onClick={onDoneVoice}
            disabled={!isVoiceListening}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: isVoiceListening ? "#466EFF" : "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: isVoiceListening ? "pointer" : "default",
            }}
          >
            {isVoiceListening ? "Save feedback" : "Saving feedback…"}
          </button>
        )}

        {mode === "text" && (
          <>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Describe feedback"
              aria-label="Feedback text"
              rows={3}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.06)",
                color: "#F3F4F6",
                fontSize: 14,
                resize: "vertical",
                minHeight: 80,
              }}
            />
            <button
              type="button"
              onClick={handleSaveText}
              disabled={!textInput.trim()}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: textInput.trim() ? "#466EFF" : "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: textInput.trim() ? "pointer" : "default",
              }}
            >
              Save feedback
            </button>
          </>
        )}

        {onCancel && mode === "choose" && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 12px",
              border: "none",
              background: "transparent",
              color: "#A1A1AA",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            Discard
          </button>
        )}
      </div>
    </div>
  );
}
