import type { Timestamp } from "firebase/firestore";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { requireAccessLevel } from "@/lib/domain/accessLevel";

/** Product-level gate: who may open the session without an account-specific invite row (see Phase 6). */
export type SessionGeneralAccess = "restricted" | "link_view";

export function requireGeneralAccess(value: unknown): SessionGeneralAccess {
  if (value === "restricted" || value === "link_view") {
    return value;
  }
  return "restricted";
}

export interface Session {
  id: string;
  /** Workspace scope (primary). */
  workspaceId: string;
  title: string;
  /**
   * Canonical archive flag used throughout the app today.
   * Stored in Firestore as `archived`.
   */
  archived?: boolean;
  /**
   * Compatibility alias for clients that expect `isArchived`.
   * When both exist, treat `isArchived` as the source of truth.
   */
  isArchived?: boolean;
  createdAt?: Timestamp | Date | string | null;
  updatedAt?: Timestamp | Date | string | null;
  /** Loom-style unique view count (one per viewer per session). */
  viewCount?: number;
  /** Denormalized: most recent up to 5 viewers (for cheap avatar rendering on lists). */
  recentViewers?: Array<{
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isAnonymous: boolean;
    viewedAt: number;
  }>;
  /** Total comment count across all feedback in this session. */
  commentCount?: number;
  /** Denormalized: total open feedback (WAVE 1 structural). */
  openCount?: number;
  /** Denormalized: total resolved feedback (WAVE 1 structural). */
  resolvedCount?: number;
  /** Denormalized: total feedback count (stored on session doc). */
  totalCount?: number;
  /** Denormalized: total feedback count (WAVE 1 structural). */
  feedbackCount?: number;

  /**
   * Default link access tier for non-workspace viewers.
   */
  accessLevel: AccessLevel;

  /**
   * Who may view the session when unauthenticated.
   */
  generalAccess: SessionGeneralAccess;

  /** Firestore creator uid (session owner). */
  createdByUserId: string;

  /** Display name of the session creator (resolved server-side). */
  creatorName?: string;

  /**
   * First-time share configuration UX (persist only; logic deferred).
   */
  hasConfiguredShare?: boolean;

  /**
   * Client-only flag for optimistic UI rows (temp sessions).
   * Not persisted/returned by the backend.
   */
  isOptimistic?: boolean;

  /** Hydrated server-side from owner workspace; not stored on session doc. */
  ownerBrandLogoUrl?: string | null;
  /** Hydrated server-side; true when owner workspace plan/entitlement allows custom branding. */
  ownerBrandingEnabled?: boolean;
}

/** Counts by status for one session (aligned with session denormalized count fields). */
export interface SessionFeedbackCounts {
  total: number;
  open: number;
  resolved: number;
}

export interface SharedSessionMembership {
  sessionId: string;
  sessionName: string;
  workspaceId: string;
  workspaceName: string | null;
  access: "view" | "resolve";
  addedBy: string | null;
  addedByName: string | null;
  addedAt: { seconds: number; nanoseconds: number } | null;
  feedbackCount: number;
  openCount: number;
  resolvedCount: number;
  generalAccess: string;
  isArchived: boolean;
}

/** GET /api/sessions page: `{ success, data: { sessions, hasMore, nextCursor } }`. */
export function sessionsListBootstrapFromApiPayload(json: unknown): {
  sessions: Session[];
  hasMore: boolean;
  nextCursor: string | null;
} {
  const inner = requireApiSuccessData<{
    sessions: unknown;
    hasMore?: boolean;
    nextCursor?: string | null;
  }>(json);
  if (!Array.isArray(inner.sessions)) {
    throw new Error("sessionsListBootstrapFromApiPayload: missing sessions array");
  }
  const sessions = inner.sessions.map((item) => sessionFromApiItem(item));
  const hasMore = inner.hasMore === true && typeof inner.nextCursor === "string";
  const nextCursor = hasMore ? inner.nextCursor! : null;
  return { sessions, hasMore, nextCursor };
}

/** Narrow `/api/sessions` list JSON into `Session[]` (no legacy root shapes). */
export function sessionsArrayFromApiPayload(data: unknown): Session[] {
  return sessionsListBootstrapFromApiPayload(data).sessions;
}

export function sessionFromApiItem(item: unknown): Session {
  if (typeof item !== "object" || item === null) {
    throw new Error("sessionFromApiItem: expected object");
  }
  const id = Reflect.get(item, "id");
  if (typeof id !== "string") {
    throw new Error("sessionFromApiItem: missing id");
  }
  const workspaceId = Reflect.get(item, "workspaceId");
  if (typeof workspaceId !== "string" || workspaceId.trim() === "") {
    throw new Error("sessionFromApiItem: missing workspaceId");
  }
  const createdByUserId = Reflect.get(item, "createdByUserId");
  if (typeof createdByUserId !== "string" || createdByUserId.trim() === "") {
    throw new Error("sessionFromApiItem: missing createdByUserId");
  }
  const titleRaw = Reflect.get(item, "title");
  if (typeof titleRaw !== "string" || titleRaw.trim() === "") {
    throw new Error("sessionFromApiItem: missing title");
  }
  const accessLevelRaw = Reflect.get(item, "accessLevel");
  const generalAccessRaw = Reflect.get(item, "generalAccess");
  const session: Session = {
    id,
    title: titleRaw.trim(),
    workspaceId: workspaceId.trim(),
    createdByUserId: createdByUserId.trim(),
    accessLevel: requireAccessLevel(accessLevelRaw),
    generalAccess: requireGeneralAccess(generalAccessRaw),
  };

  const archived = Reflect.get(item, "archived");
  if (typeof archived === "boolean") {
    session.archived = archived;
    session.isArchived = archived;
  }

  const isArchived = Reflect.get(item, "isArchived");
  if (typeof isArchived === "boolean") {
    session.isArchived = isArchived;
    session.archived = isArchived;
  }

  const updatedAt = Reflect.get(item, "updatedAt");
  if (
    typeof updatedAt === "string" ||
    updatedAt instanceof Date ||
    updatedAt === null
  ) {
    session.updatedAt = updatedAt;
  }

  const createdAt = Reflect.get(item, "createdAt");
  if (
    typeof createdAt === "string" ||
    createdAt instanceof Date ||
    createdAt === null
  ) {
    session.createdAt = createdAt;
  }

  const hcs = Reflect.get(item, "hasConfiguredShare");
  if (typeof hcs === "boolean") session.hasConfiguredShare = hcs;

  const creatorName = Reflect.get(item, "creatorName");
  if (typeof creatorName === "string") session.creatorName = creatorName;

  const readCount = (key: string): number | undefined => {
    const v = Reflect.get(item, key);
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  };
  const cc = readCount("commentCount");
  if (cc !== undefined) session.commentCount = cc;
  const oc = readCount("openCount");
  if (oc !== undefined) session.openCount = oc;
  const rc = readCount("resolvedCount");
  if (rc !== undefined) session.resolvedCount = rc;
  const tc = readCount("totalCount");
  if (tc !== undefined) session.totalCount = tc;
  const fc = readCount("feedbackCount");
  if (fc !== undefined) session.feedbackCount = fc;
  const vc = readCount("viewCount");
  if (vc !== undefined) session.viewCount = vc;

  const ownerBrandLogoUrl = Reflect.get(item, "ownerBrandLogoUrl");
  if (typeof ownerBrandLogoUrl === "string" || ownerBrandLogoUrl === null) {
    session.ownerBrandLogoUrl = ownerBrandLogoUrl;
  }
  const ownerBrandingEnabled = Reflect.get(item, "ownerBrandingEnabled");
  if (typeof ownerBrandingEnabled === "boolean") {
    session.ownerBrandingEnabled = ownerBrandingEnabled;
  }

  const rvRaw = Reflect.get(item, "recentViewers");
  if (Array.isArray(rvRaw)) {
    const parsed: NonNullable<Session["recentViewers"]> = [];
    for (const entry of rvRaw) {
      if (typeof entry !== "object" || entry === null) continue;
      const id = Reflect.get(entry, "id");
      if (typeof id !== "string" || id.trim() === "") continue;
      const displayName = Reflect.get(entry, "displayName");
      const avatarUrl = Reflect.get(entry, "avatarUrl");
      const isAnonymous = Reflect.get(entry, "isAnonymous");
      const viewedAt = Reflect.get(entry, "viewedAt");
      parsed.push({
        id,
        displayName: typeof displayName === "string" ? displayName : null,
        avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
        isAnonymous: isAnonymous === true,
        viewedAt: typeof viewedAt === "number" ? viewedAt : 0,
      });
    }
    session.recentViewers = parsed;
  }

  return session;
}

