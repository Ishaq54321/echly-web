export type StructuredFeedback = {
  id: string;
  title: string;
  description: string;
  type: string;
};

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
  initialPointers?: StructuredFeedback[];
  onComplete: (
    transcript: string,
    screenshot: string | null
  ) => Promise<StructuredFeedback>;
  onDelete: (id: string) => Promise<void>;
};

export type Position = { x: number; y: number };
