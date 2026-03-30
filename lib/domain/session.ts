import type { Timestamp } from "firebase/firestore";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";

/** Product-level gate: who may open the session without an account-specific invite row (see Phase 6). */
export type SessionGeneralAccess = "restricted" | "link_view";

export function normalizeGeneralAccess(value: unknown): SessionGeneralAccess {
  return value === "link_view" ? "link_view" : "restricted";
}

export interface SessionCreatedBy {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Session {
  id: string;
  /** Workspace scope (primary). */
  workspaceId?: string;
  /** Legacy scope (pre-workspaces). */
  userId?: string;
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
  /** Set at creation. Creator profile for card display. */
  createdBy?: SessionCreatedBy | null;
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
   * Default link access for visitors who are not workspace peers and have no email share row.
   */
  accessLevel?: AccessLevel;

  /**
   * Who may view the session when unauthenticated (invite system fills other cases).
   * @default "restricted" when absent (legacy docs).
   */
  generalAccess?: SessionGeneralAccess;

  /**
   * Firestore creator uid when `createdBy` profile is not denormalized on the doc.
   */
  createdByUserId?: string;

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
  if (typeof data !== "object" || data === null) return [];
  const raw = Reflect.get(data, "sessions");
  if (!Array.isArray(raw)) return [];
  const out: Session[] = [];
  for (const item of raw) {
    const s = sessionFromApiItem(item);
    if (s) out.push(s);
  }
  return out;
}

export function sessionFromApiItem(item: unknown): Session | null {
  if (typeof item !== "object" || item === null) return null;
  const id = Reflect.get(item, "id");
  if (typeof id !== "string") return null;
  const titleRaw = Reflect.get(item, "title");
  const title = typeof titleRaw === "string" ? titleRaw : "Untitled Session";
  const session: Session = { id, title };

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

  const accessLevel = Reflect.get(item, "accessLevel");
  session.accessLevel = normalizeAccessLevel(accessLevel);

  const ga = Reflect.get(item, "generalAccess");
  session.generalAccess = normalizeGeneralAccess(ga);

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

