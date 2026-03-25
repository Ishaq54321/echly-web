import type { Timestamp } from "firebase/firestore";

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
  /** Denormalized: total skipped feedback (Execution Mode skip). */
  skippedCount?: number;
  /** Denormalized: total feedback count (open + resolved + skipped). */
  totalCount?: number;
  /** Denormalized: total feedback count (WAVE 1 structural). */
  feedbackCount?: number;

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

  return session;
}

