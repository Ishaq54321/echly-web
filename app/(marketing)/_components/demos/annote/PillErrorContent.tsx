"use client";

/**
 * Stub for: lib/capture-engine/pill/PillErrorContent.tsx
 *
 * The marketing demo loop never enters an error state (voiceError stays
 * null throughout), so this component is never rendered. It exists only to
 * satisfy the type contract of CapturePill's `showError` branch.
 *
 * If the demo ever needs to show an error UI, this file should be replaced
 * with a real forklift of the source component (293 lines, includes Lucide
 * icons, browser-detection helpers, and a mic-permission instruction card).
 */

import React from "react";

export type PillErrorType =
  | "mic_permission_initial"
  | "mic_permission_blocked"
  | "mic_permission_site_blocked"
  | "no_audio"
  | "transcription_failed";

interface PillErrorContentProps {
  type: PillErrorType;
  onRetry: () => void;
  onCancel: () => void;
  onSwitchToWrite: () => void;
  hostnameForDisplay: string;
  onSelectMic?: (deviceId: string) => void;
  selectedMicId?: string;
}

export function PillErrorContent(_props: PillErrorContentProps) {
  return null;
}
