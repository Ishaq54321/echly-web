import type { MutableRefObject } from "react";

export type StructuredFeedback = {
  id: string;
  title: string;
  description: string;
  type: string;
};

export interface Recording {
  id: string;
  screenshot: string | null;
  transcript: string;
  structuredOutput: StructuredFeedback | null;
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
    }
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
};

export type Position = { x: number; y: number };
