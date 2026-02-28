import type { Timestamp } from "firebase/firestore";

export interface Session {
  id: string;
  userId: string;
  title: string;
  createdAt?: Timestamp | null;
}

