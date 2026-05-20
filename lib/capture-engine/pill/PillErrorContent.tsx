"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Trash2,
  RotateCcw,
  RefreshCw,
  Mic,
  Shield,
  Lightbulb,
  Edit3,
} from "lucide-react";
import { detectBrowser } from "../core/detectBrowser";
import {
  ChromeSlidersIcon,
  EdgeLockIcon,
} from "../core/BrowserAddressBarIcon";
import { MicSelectorPopover } from "./MicSelectorPopover";
import { PillTooltip } from "./PillTooltip";

export type PillErrorType =
  | "mic_permission_initial"
  | "mic_permission_blocked"
  | "mic_permission_site_blocked"
  | "no_audio"
  | "transcription_failed";

interface MicDevice {
  deviceId: string;
  label: string;
}

interface PillErrorContentProps {
  type: PillErrorType;
  onRetry: () => void;
  onCancel: () => void;
  onSwitchToWrite?: () => void;
  /** Bare hostname (www-stripped) for the site-blocked copy; "This site" fallback. */
  hostnameForDisplay?: string;
  /** Select a microphone deviceId; persists for the next record attempt. */
  onSelectMic?: (deviceId: string) => void;
  /** Currently selected microphone deviceId (for checkmark in picker). */
  selectedMicId?: string;
}

export function PillErrorContent({
  type,
  onRetry,
  onCancel,
  onSwitchToWrite,
  hostnameForDisplay = "This site",
  onSelectMic,
  selectedMicId = "",
}: PillErrorContentProps) {
  const [micPopoverOpen, setMicPopoverOpen] = useState(false);
  const [micDevices, setMicDevices] = useState<MicDevice[]>([]);
  const micButtonRef = useRef<HTMLButtonElement>(null);

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
  // Site-level Permissions-Policy block: no user action can override it, so
  // there is no Try-again — a single honest path to Write mode. Same design
  // as the ModeSelectionView site-blocked panel, compact --pill variant.
  if (type === "mic_permission_site_blocked") {
    return (
      <div className="echly-mic-permission-panel echly-mic-permission-panel--pill">
        <div className="echly-mic-permission-header">
          <div className="echly-mic-permission-icon-circle">
            <Shield size={20} />
          </div>
          <p className="echly-mic-permission-title">
            This site doesn&apos;t allow voice recording
          </p>
          <p className="echly-mic-permission-sub">
            {hostnameForDisplay} has disabled microphone access for security
            reasons — this isn&apos;t something we can change.
          </p>
        </div>

        <div className="echly-mic-permission-hint">
          <Lightbulb size={14} />
          <span>
            You can still use <strong>Write mode</strong> to capture text
            feedback on this site.
          </span>
        </div>

        <button
          type="button"
          className="echly-mic-permission-primary"
          onClick={() => onSwitchToWrite?.()}
        >
          <Edit3 size={14} />
          Switch to Write mode
        </button>
      </div>
    );
  }

  // Mic permission states reuse the dedicated permission-panel design with
  // the browser-specific inline instructions. Same structure and copy as the
  // mode-selection panel, adapted to the compact pill via the --pill modifier.
  if (type === "mic_permission_initial" || type === "mic_permission_blocked") {
    const isPermanent = type === "mic_permission_blocked";
    const browser = detectBrowser();
    const BrowserIcon =
      browser === "chrome"
        ? ChromeSlidersIcon
        : browser === "edge"
          ? EdgeLockIcon
          : null;

    if (isPermanent) {
      return (
        <div className="echly-mic-permission-panel echly-mic-permission-panel--pill">
          <div className="echly-mic-permission-header">
            <div className="echly-mic-permission-icon-circle echly-mic-permission-icon-circle--blocked">
              <Mic size={20} />
              <span
                className="echly-mic-permission-slash"
                aria-hidden="true"
              />
            </div>
            <p className="echly-mic-permission-title">
              Microphone is blocked
            </p>
            <p className="echly-mic-permission-sub">
              Allow it in a couple of clicks — we&apos;ll detect it
              automatically.
            </p>
          </div>

          <div className="echly-mic-permission-instructions">
            <div className="echly-mic-permission-step">
              <span className="echly-mic-permission-step-num">1</span>
              <span className="echly-mic-permission-step-text">
                Click the
                {BrowserIcon ? (
                  <>
                    {" "}
                    <span className="echly-mic-permission-icon-chip">
                      <BrowserIcon size={13} color="var(--muted)" />
                    </span>{" "}
                    icon
                  </>
                ) : (
                  <>
                    {" "}
                    <strong>icon</strong>
                  </>
                )}{" "}
                in the address bar
              </span>
            </div>

            <div className="echly-mic-permission-step">
              <span className="echly-mic-permission-step-num">2</span>
              <span className="echly-mic-permission-step-text">
                Find <strong>Microphone</strong> and toggle it to{" "}
                <strong>Allow</strong>
              </span>
            </div>

            <div className="echly-mic-permission-step">
              <span className="echly-mic-permission-step-num">3</span>
              <span className="echly-mic-permission-step-text">
                Come back here — we&apos;ll start recording automatically
              </span>
            </div>
          </div>

          <button
            type="button"
            className="echly-mic-permission-primary"
            onClick={onRetry}
          >
            <RefreshCw size={14} />
            Try again
          </button>
          <button
            type="button"
            className="echly-mic-permission-secondary"
            onClick={() => onSwitchToWrite?.()}
          >
            Use Write instead
          </button>
        </div>
      );
    }

    return (
      <div className="echly-mic-permission-panel echly-mic-permission-panel--pill">
        <div className="echly-mic-permission-header">
          <div className="echly-mic-permission-icon-circle">
            <Mic size={20} />
          </div>
          <p className="echly-mic-permission-title">
            Annote needs your microphone
          </p>
          <p className="echly-mic-permission-sub">
            To capture voice feedback, allow microphone access when your
            browser asks.
          </p>
        </div>
        <button
          type="button"
          className="echly-mic-permission-primary"
          onClick={onRetry}
        >
          <RefreshCw size={14} />
          Try again
        </button>
        <button
          type="button"
          className="echly-mic-permission-secondary"
          onClick={() => onSwitchToWrite?.()}
        >
          Use Write instead
        </button>
      </div>
    );
  }

  const copy =
    type === "no_audio"
      ? { title: "No audio detected — check your mic", cta: "Try again" }
      : { title: "Couldn't process audio", cta: "Retry" };

  return (
    <div className="echly-pill-content echly-pill-content--error">
      <button
        type="button"
        className="echly-pill-icon-btn"
        onClick={onCancel}
        aria-label="Dismiss"
      >
        <Trash2 size={18} strokeWidth={1.75} />
      </button>
      <span className="echly-pill-error-msg">{copy.title}</span>
      {type === "no_audio" && onSelectMic && (
        <PillTooltip content="Change microphone">
          <button
            ref={micButtonRef}
            type="button"
            className="echly-pill-icon-btn"
            onClick={() => setMicPopoverOpen((v) => !v)}
            aria-label="Change microphone"
            aria-expanded={micPopoverOpen}
            aria-haspopup="listbox"
          >
            <Mic size={18} strokeWidth={1.75} />
          </button>
        </PillTooltip>
      )}
      <button type="button" className="echly-pill-error-action" onClick={onRetry}>
        <RotateCcw size={14} strokeWidth={1.75} />
        <span>{copy.cta}</span>
      </button>
      {type === "no_audio" && micPopoverOpen && onSelectMic && (
        <MicSelectorPopover
          anchorRef={micButtonRef}
          devices={micDevices}
          selectedDeviceId={selectedMicId}
          onSelect={(id) => {
            onSelectMic(id);
            setMicPopoverOpen(false);
          }}
          onClose={() => setMicPopoverOpen(false)}
        />
      )}
    </div>
  );
}
