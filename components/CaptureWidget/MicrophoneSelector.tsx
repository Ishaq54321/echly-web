"use client";

import React, { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { shortDeviceName } from "./utils/shortDeviceName";

export interface MicrophoneSelectorProps {
  devices: Array<{ deviceId: string; label: string }>;
  selectedDeviceId: string;
  onSelect: (deviceId: string) => void;
  open: boolean;
  onToggle: () => void;
}

export function MicrophoneSelector({
  devices,
  selectedDeviceId,
  onSelect,
  open,
  onToggle,
}: MicrophoneSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open, onToggle]);

  const selectedLabel = devices.find((d) => d.deviceId === selectedDeviceId)?.label ?? "";
  const shortName = shortDeviceName(selectedLabel || "Default microphone");

  return (
    <div className="echly-mic-selector" ref={containerRef}>
      <button
        type="button"
        className="echly-mic-button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Microphone: ${shortName}`}
      >
        <span className="echly-mic-button-label">Mic: {shortName}</span>
        <ChevronDown size={14} className="echly-mic-chevron" aria-hidden />
      </button>
      {open && (
        <div
          className="echly-mic-menu"
          role="listbox"
          aria-label="Select microphone"
        >
          {devices.map((device) => (
            <button
              key={device.deviceId}
              type="button"
              role="option"
              aria-selected={device.deviceId === selectedDeviceId}
              className={`echly-mic-menu-item ${device.deviceId === selectedDeviceId ? "selected" : ""}`}
              onClick={() => {
                onSelect(device.deviceId);
                onToggle();
              }}
            >
              {shortDeviceName(device.label)}
              {device.deviceId === selectedDeviceId && (
                <span className="echly-mic-check" aria-hidden>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
