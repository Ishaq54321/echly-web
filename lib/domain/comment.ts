import type { Timestamp } from "firebase/firestore";

export interface Comment {
  id: string;
  sessionId: string;
  feedbackId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  createdAt: Timestamp | null;
}

