import type { MutableRefObject } from "react";

export type StructuredFeedback = {
  id: string;
  title: string;
  description: string;
  type: string;
};

/** Context captured with the region (URL, scroll, viewport, DOM path, nearby text). */
export type CaptureContext = {
  url: string;
  scrollX: number;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  domPath: string | null;
  nearbyText: string | null;
  capturedAt: number;
};

export interface Recording {
  id: string;
  screenshot: string | null;
  transcript: string;
  structuredOutput: StructuredFeedback | null;
  /** Page context when capture was taken (extension region capture). */
  context?: CaptureContext | null;
  createdAt: number;
}

export type CaptureState =
  | "idle"
  | "capturing"
  | "listening"
  | "processing"
  | "anticipation"
  | "error";

export type CaptureWidgetProps = {
  sessionId: string;
  userId: string;
  /** When true, disables auto-collapse on blur/outside click and locks tray during recording. */
  extensionMode?: boolean;
  initialPointers?: StructuredFeedback[];
  onComplete: (
    transcript: string,
    screenshot: string | null,
    callbacks?: {
      onSuccess: (ticket: StructuredFeedback) => void;
      onError: () => void;
    },
    context?: CaptureContext | null
  ) => void | Promise<StructuredFeedback | undefined>;
  onDelete: (id: string) => Promise<void>;
  /** Optional ref for extension: parent can set a toggle callback to open/close widget via message. */
  widgetToggleRef?: MutableRefObject<(() => void) | null>;
  /** Optional callback when recording starts or stops (for extension global recording state). */
  onRecordingChange?: (recording: boolean) => void;
  /** When provided, widget is controlled: expanded = open panel, !expanded = floating button only. */
  expanded?: boolean;
  /** Called when user clicks the floating button to open (extension sends ECHLY_EXPAND_WIDGET). */
  onExpandRequest?: () => void;
  /** Called when user clicks close (X) to collapse (extension sends ECHLY_COLLAPSE_WIDGET). */
  onCollapseRequest?: () => void;
  /** Optional: fetch live title/tags/priority while user is speaking (instant structured insight). */
  liveStructureFetch?: (transcript: string) => Promise<{ title: string; tags: string[]; priority: string } | null>;
  /** When true, Add Feedback button is disabled (e.g. no active session in extension). No message shown. */
  captureDisabled?: boolean;
};

export type LiveStructured = { title: string; tags: string[]; priority: string };

export type Position = { x: number; y: number };
