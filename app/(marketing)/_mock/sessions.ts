import type { Session } from "@/lib/domain/session";

// Canonical mock session for marketing demos: "Q2 launch · preflight".
// 12 total / 4 resolved / 8 open. Created by Maya, viewed recently by
// Maya, Daniel, and Jordan (the external client).
//
// `createdAt`/`updatedAt` accept Date per the domain type's
// `Timestamp | Date | string | null` union — using Date keeps the mock
// free of any firebase/firestore import.

const TWO_DAYS_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);
const FIVE_MIN_AGO = Date.now() - 1000 * 60 * 5;
const ONE_HOUR_AGO = Date.now() - 1000 * 60 * 60;
const SIX_HOURS_AGO = Date.now() - 1000 * 60 * 60 * 6;

export const mockSession: Session = {
  id: "session_q2_launch_preflight",
  workspaceId: "ws_northwind_studio",
  title: "Q2 launch · preflight",
  archived: false,
  isArchived: false,
  createdAt: TWO_DAYS_AGO,
  updatedAt: new Date(FIVE_MIN_AGO),
  viewCount: 7,
  recentViewers: [
    {
      id: "user_maya",
      displayName: "Maya Chen",
      avatarUrl: null,
      isAnonymous: false,
      viewedAt: FIVE_MIN_AGO,
    },
    {
      id: "user_daniel",
      displayName: "Daniel Park",
      avatarUrl: null,
      isAnonymous: false,
      viewedAt: ONE_HOUR_AGO,
    },
    {
      id: "user_jordan",
      displayName: "Jordan Mills",
      avatarUrl: null,
      isAnonymous: false,
      viewedAt: SIX_HOURS_AGO,
    },
  ],
  commentCount: 19,
  openCount: 8,
  resolvedCount: 4,
  totalCount: 12,
  feedbackCount: 12,
  accessLevel: "comment",
  generalAccess: "link_view",
  createdByUserId: "user_maya",
  creatorName: "Maya Chen",
  hasConfiguredShare: true,
};
