"use client";

import type { Session } from "@/lib/domain/session";

export type SessionOption = Pick<Session, "id" | "title"> &
  Partial<Pick<Session, "archived" | "updatedAt">> & {
    /** Ticket total from session document fields (`totalCount` / `feedbackCount`) when present. */
    counts?: { total: number };
    [key: string]: unknown;
  };

export type ResumeSessionModalProps = {
  open: boolean;
  onClose: () => void;
  fetchSessions?: () => Promise<SessionOption[]>;
  onSelectSession: (sessionId: string) => void;
  /** Extension: run before loading sessions. If returns false, show login-required UI and do not call fetchSessions. */
  checkAuth?: () => Promise<boolean>;
  /** Extension: called when user clicks "Open Login" in login-required state. */
  onOpenLogin?: () => void;
};

type FilterKey = "today" | "7days" | "30days" | "all";

/** @deprecated Replaced by PreviousFeedbackView. Retained as a shell for type exports only. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ResumeSessionModal(_props: ResumeSessionModalProps): null {
  return null;
}
