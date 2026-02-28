/** Minimal feedback item shape used by UI subcomponents. */
export interface FeedbackItemShape {
  id: string;
  title: string;
  type: string;
  timestamp?: number;
  status?: string;
  screenshotUrl?: string | null;
  description: string;
  suggestion?: string | null;
}
