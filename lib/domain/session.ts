import type { Timestamp } from "firebase/firestore";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { requireAccessLevel } from "@/lib/domain/accessLevel";

/** Product-level gate: who may open the session without an account-specific invite row (see Phase 6). */
export type SessionGeneralAccess = "restricted" | "link_view";

export function requireGeneralAccess(value: unknown): SessionGeneralAccess {
  if (value === "link_view") return "link_view";
  if (value === "restricted") return "restricted";
  throw new Error(
    `Invalid generalAccess: expected restricted|link_view, got ${JSON.stringify(value)}`,
  );
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

  /**
   * First-time share configuration UX (persist only; logic deferred).
   */
  hasConfiguredShare?: boolean;

  /**
   * Client-only flag for optimistic UI rows (temp sessions).
   * Not persisted/returned by the backend.
   */
  isOptimistic?: boolean;
}

/** Narrow `/api/sessions`-shaped JSON into `Session` (no type assertions on callers). */
export function sessionsArrayFromApiPayload(data: unknown): Session[] {
  if (typeof data !== "object" || data === null) {
    throw new Error("sessionsArrayFromApiPayload: expected object root");
  }
  let raw: unknown = Reflect.get(data, "sessions");
  if (!Array.isArray(raw)) {
    const inner = Reflect.get(data, "data");
    if (typeof inner === "object" && inner !== null) {
      raw = Reflect.get(inner, "sessions");
    }
  }
  if (!Array.isArray(raw)) {
    throw new Error("sessionsArrayFromApiPayload: missing sessions array");
  }
  return raw.map((item) => sessionFromApiItem(item));
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

  const hcs = Reflect.get(item, "hasConfiguredShare");
  if (typeof hcs === "boolean") session.hasConfiguredShare = hcs;

  const readCount = (key: string): number | undefined => {
    const v = Reflect.get(item, key);
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  };
  const oc = readCount("openCount");
  if (oc !== undefined) session.openCount = oc;
  const rc = readCount("resolvedCount");
  if (rc !== undefined) session.resolvedCount = rc;
  const tc = readCount("totalCount");
  if (tc !== undefined) session.totalCount = tc;
  const fc = readCount("feedbackCount");
  if (fc !== undefined) session.feedbackCount = fc;

  return session;
}

