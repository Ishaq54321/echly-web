"use client";

import React, { useEffect, useRef } from "react";
import { shortDeviceName } from "@/components/CaptureWidget/utils/shortDeviceName";

export interface MicrophonePanelProps {
  devices: Array<{ deviceId: string; label: string }>;
  selectedDeviceId: string;
  onSelect: (deviceId: string) => void;
  onClose: () => void;
}

export function MicrophonePanel({
  devices,
  selectedDeviceId,
  onSelect,
  onClose,
}: MicrophonePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="echly-mic-panel"
      role="dialog"
      aria-label="Select microphone"
    >
      <div className="echly-mic-panel-title">Select microphone</div>
      <div className="echly-mic-panel-list">
        {devices.map((device) => (
          <button
            key={device.deviceId}
            type="button"
            className={`echly-mic-panel-item ${device.deviceId === selectedDeviceId ? "selected" : ""}`}
            onClick={() => {
              onSelect(device.deviceId);
              onClose();
            }}
          >
            <span className="echly-mic-panel-check">
              {device.deviceId === selectedDeviceId ? "✓" : ""}
            </span>
            {shortDeviceName(device.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
