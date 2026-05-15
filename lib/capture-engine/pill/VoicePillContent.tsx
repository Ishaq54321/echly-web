"use client";

import React, { useRef, useState, useEffect } from "react";
import { Trash2, RotateCcw, Send, Mic, Type } from "lucide-react";
import { Waveform } from "./Waveform";
import { PillTooltip } from "./PillTooltip";
import { MicSelectorPopover } from "./MicSelectorPopover";

interface MicDevice {
  deviceId: string;
  label: string;
}

interface VoicePillContentProps {
  analyser: AnalyserNode | null;
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
  analyser,
  elapsedFormatted,
  onCancel,
  onReset,
  onSend,
  onSwitchToTextMode,
  onSelectMic,
  selectedMicId = "",
  isFinishing = false,
}: VoicePillContentProps) {
  const [micPopoverOpen, setMicPopoverOpen] = useState(false);
  const [micDevices, setMicDevices] = useState<MicDevice[]>([]);
  const micButtonRef = useRef<HTMLButtonElement>(null);

  /** Enumerate mics when popover opens (labels need permission, which we've already requested). */
  useEffect(() => {
    if (!micPopoverOpen) return;
    let cancelled = false;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        if (cancelled) return;
        const inputs = devices.filter((d) => d.kind === "audioinput");
        setMicDevices(
          inputs.map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label?.trim() || `Microphone ${i + 1}`,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setMicDevices([]);
      });
    return () => {
      cancelled = true;
    };
  }, [micPopoverOpen]);

  return (
    <div className="echly-pill-content echly-pill-content--voice">
      {/* LEFT — hover-revealed mode/mic switches. Hidden until pill is hovered
          or focus enters the pill (keyboard nav). */}
      <PillTooltip content="Select mic">
        <button
          ref={micButtonRef}
          type="button"
          className="echly-pill-action echly-pill-action--mic"
          onClick={() => setMicPopoverOpen((v) => !v)}
          aria-label="Select microphone"
          aria-expanded={micPopoverOpen}
          aria-haspopup="listbox"
        >
          <Mic size={18} strokeWidth={1.75} />
        </button>
      </PillTooltip>

      <PillTooltip content="Switch to text mode">
        <button
          type="button"
          className="echly-pill-action echly-pill-action--type"
          onClick={onSwitchToTextMode}
          aria-label="Switch to text mode"
        >
          <Type size={18} strokeWidth={1.75} />
        </button>
      </PillTooltip>

      <span className="echly-pill-divider" aria-hidden="true" />

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

      <Waveform source={analyser} />

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
        className="echly-pill-send-btn"
        onClick={onSend}
        aria-label="Send recording"
        disabled={isFinishing}
      >
        <Send size={18} strokeWidth={2} fill="currentColor" stroke="none" />
      </button>

      {micPopoverOpen && (
        <MicSelectorPopover
          anchorRef={micButtonRef}
          devices={micDevices}
          selectedDeviceId={selectedMicId}
          onSelect={(id) => {
            onSelectMic?.(id);
            setMicPopoverOpen(false);
          }}
          onClose={() => setMicPopoverOpen(false)}
        />
      )}
    </div>
  );
}
