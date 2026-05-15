"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

interface MicDevice {
  deviceId: string;
  label: string;
}

interface MicSelectorPopoverProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  devices: MicDevice[];
  selectedDeviceId: string;
  onSelect: (deviceId: string) => void;
  onClose: () => void;
}

/** Strip OS/browser noise from enumerateDevices labels; never show raw system strings in UI. */
function formatMicLabel(label: string): string {
  if (!label?.trim()) return "Unknown device";
  let s = label.trim();
  s = s.replace(/\s*\([0-9a-fA-F]{4}:[0-9a-fA-F]{4}\)\s*/g, "").trim();
  s = s.replace(/\s+[0-9a-fA-F]{4}:[0-9a-fA-F]{4}\s*$/, "").trim();
  const defaultWrapped = /^Default\s*[-–]\s*Microphone\s*\(\s*\d+[-–]\s*(.+?)\s*\)\s*$/i.exec(s);
  if (defaultWrapped) return defaultWrapped[1].trim() || "Default Microphone";
  const wrapped = /^Microphone\s*\(\s*(.+?)\s*\)\s*$/i.exec(s);
  if (wrapped) return wrapped[1].trim() || "Microphone";
  s = s.replace(/^\d+[-–]\s*/, "").trim();
  s = s.replace(/\)+$/, "").trim();
  const numbered = /^Microphone\s+(\d+)$/i.exec(s);
  if (numbered) return `Input ${numbered[1]}`;
  s = s.replace(/^Microphone\s+/i, "").trim();
  const commWrapped = /^Communications\s*[-–]\s*(?:Headset\s+)?Microphone\s*\(\s*(.+?)\s*\)\s*$/i.exec(s);
  if (commWrapped) return commWrapped[1].trim();
  const headsetWrapped = /^Headset\s+Microphone\s*\(\s*(.+?)\s*\)\s*$/i.exec(s);
  if (headsetWrapped) return headsetWrapped[1].trim();
  return s || "Unknown device";
}

function getMicType(label: string): string {
  const l = (label || "").toLowerCase();
  if (l.includes("default")) return "System Default";
  if (l.includes("communications")) return "Communications";
  if (l.includes("webcam") || l.includes("camera")) return "Webcam";
  if (l.includes("headset") || l.includes("headphone")) return "Headset";
  if (l.includes("bluetooth") || l.includes("airpod")) return "Bluetooth";
  if (l.includes("usb") || l.includes("podcast") || l.includes("yeti") || l.includes("rode") || l.includes("shure")) return "USB Microphone";
  if (l.includes("built-in") || l.includes("internal") || l.includes("realtek")) return "Built-in";
  if (l.includes("virtual") || l.includes("droidcam") || l.includes("obs") || l.includes("krisp")) return "Virtual";
  return "Microphone";
}

/**
 * Popover listing available microphones, anchored above the mic icon in the pill.
 * Replaces the legacy lightbox-panel dropdown (VoiceCapturePanel pre-Phase-22).
 * Uses the existing selectVoiceMicrophone logic via the onSelect callback.
 */
export function MicSelectorPopover({
  anchorRef,
  devices,
  selectedDeviceId,
  onSelect,
  onClose,
}: MicSelectorPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (e.button !== 0) return;
      const path = e.composedPath();
      if (popoverRef.current && path.includes(popoverRef.current)) return;
      if (anchorRef.current && path.includes(anchorRef.current)) return;
      onClose();
    },
    [anchorRef, onClose]
  );

  useEffect(() => {
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [handlePointerDown]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  const items = useMemo(
    () =>
      devices.map((d) => ({
        deviceId: d.deviceId,
        label: formatMicLabel(d.label),
        type: getMicType(d.label),
      })),
    [devices]
  );

  return (
    <div
      ref={popoverRef}
      className="echly-mic-popover"
      role="listbox"
      aria-label="Microphones"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {items.length === 0 ? (
        <div style={{ padding: "12px 14px", fontSize: 13, color: "#8A8096" }}>
          No microphones found
        </div>
      ) : (
        items.map((d) => {
          const isActive = d.deviceId === selectedDeviceId;
          return (
            <button
              key={d.deviceId}
              type="button"
              role="option"
              aria-selected={isActive}
              aria-label={`${d.label}, ${d.type}`}
              className={`echly-mic-item${isActive ? " is-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!d.deviceId) return;
                onSelect(d.deviceId);
              }}
            >
              <span className="echly-mic-item-icon">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <div className="echly-mic-text">
                <div className="echly-mic-title">{d.label}</div>
                <div className="echly-mic-sub">{d.type}</div>
              </div>
              {isActive && (
                <div className="echly-mic-check" aria-hidden>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
