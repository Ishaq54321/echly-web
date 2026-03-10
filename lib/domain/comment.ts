import type { Timestamp } from "firebase/firestore";

/** Pin position as percentage of image dimensions (0–100). */
export interface CommentPosition {
  xPercent: number;
  yPercent: number;
}

/** Text range for inline (Google Docs–style) comments. */
export interface CommentTextRange {
  startOffset: number;
  endOffset: number;
  containerId: string;
}

export type CommentType = "pin" | "text" | "general";

export interface Comment {
  id: string;
  sessionId: string;
  feedbackId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  createdAt: Timestamp | null;
  /** "pin" | "text" | "general". Omit = legacy (treated as general). */
  type?: CommentType;
  /** For pin comments: position on screenshot. */
  position?: CommentPosition;
  /** For text comments: selection range. */
  textRange?: CommentTextRange;
  /** Reply to this comment id. Omit = thread root. */
  threadId?: string | null;
  /** Thread resolved. */
  resolved?: boolean;
  /** Optional attachment (one per comment). */
  attachment?: CommentAttachment;
}

export interface CommentAttachment {
  file_name: string;
  file_url: string;
  file_size: number;
}

