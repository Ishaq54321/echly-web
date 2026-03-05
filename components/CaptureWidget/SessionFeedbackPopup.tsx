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
        borderRadius: 16,
        background: "rgba(20,22,28,0.98)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.1)",
        zIndex: 2147483647,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div
          style={{
            borderRadius: 8,
            overflow: "hidden",
            background: "#111",
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
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          Speak or type feedback
        </p>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {mode === "choose" && (
          <>
            <button
              type="button"
              onClick={handleRecordVoice}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
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
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.9)",
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
              background: isVoiceListening ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "rgba(255,255,255,0.1)",
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
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.95)",
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
                background: textInput.trim() ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "rgba(255,255,255,0.1)",
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
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
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
