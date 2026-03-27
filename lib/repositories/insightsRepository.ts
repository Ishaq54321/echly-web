import {
  doc,
  type DocumentReference,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface WorkspaceInsightsDoc {
  totalFeedback: number;
  totalComments: number;
  totalResolved: number;
  timeSavedMinutes: number;

  issueTypes: Record<string, number>;
  sessionCounts: Record<string, number>;

  daily: Record<
    string,
    {
      feedback: number;
      comments: number;
      resolved: number;
    }
  >;

  response: {
    totalFirstReplyMs: number;
    count: number;
  };

  updatedAt: Timestamp | null;
}

// IMPORTANT: workspaceId is used as document key (previously named userId)
export function workspaceInsightsRef(
  workspaceId: string
): DocumentReference<WorkspaceInsightsDoc> {
  return doc(
    db,
    "workspaces",
    workspaceId,
    "insights",
    "main"
  ) as DocumentReference<WorkspaceInsightsDoc>;
}

export function emptyWorkspaceInsightsDoc(): WorkspaceInsightsDoc {
  return {
    totalFeedback: 0,
    totalComments: 0,
    totalResolved: 0,
    timeSavedMinutes: 0,
    issueTypes: {},
    sessionCounts: {},
    daily: {},
    response: { totalFirstReplyMs: 0, count: 0 },
    updatedAt: null,
  };
}

