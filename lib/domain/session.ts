import type { Timestamp } from "firebase/firestore";

export interface Session {
  id: string;
  userId: string;
  title: string;
  archived?: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

