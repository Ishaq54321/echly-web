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
    screenshot: string | null
  ) => Promise<StructuredFeedback | undefined>;
  onDelete: (id: string) => Promise<void>;
};

export type Position = { x: number; y: number };
