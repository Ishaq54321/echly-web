/**
 * Firestore `share_links` — token-based session sharing (phase 1).
 * SERVER-ONLY: use from API routes or Node scripts (uses Node crypto).
 */
import { randomBytes } from "node:crypto";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

export type ShareGeneralAccess = AccessLevel;

export interface ShareLinkRecord {
  id: string;
  token: string;
  sessionId: string;
  userId: string;
  workspaceId: string;
  generalAccess: ShareGeneralAccess;
  createdBy: string;
  createdAt: Timestamp | null;
  expiresAt: Timestamp | null;
  isActive: boolean;
}

function generateUrlSafeToken(): string {
  return randomBytes(32).toString("base64url");
}

export interface CreateShareLinkResult {
  id: string;
  token: string;
}

/**
 * Create a share link row. Token is 32 random bytes, base64url-encoded (~43 chars).
 */
export async function createShareLink(
  userId: string,
  sessionId: string,
  generalAccess: ShareGeneralAccess,
  createdBy: string,
  options?: { expiresAt?: Date | null }
): Promise<CreateShareLinkResult> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    throw new Error("Missing userId - invalid state");
  }
  const trimmedSession = sessionId.trim();
  if (!trimmedSession) {
    throw new Error("createShareLink: sessionId is required");
  }
  const uid = createdBy.trim();
  if (!uid) {
    throw new Error("createShareLink: createdBy is required");
  }
  const level = normalizeAccessLevel(generalAccess) as ShareGeneralAccess;
  const workspaceId = await getUserWorkspaceIdRepo(normalizedUserId);
  const token = generateUrlSafeToken();
  const ref = adminDb.collection("share_links").doc();

  const exp = options?.expiresAt ?? null;
  await ref.set({
    userId: normalizedUserId,
    workspaceId,
    token,
    sessionId: trimmedSession,
    generalAccess: level,
    createdBy: uid,
    createdAt: FieldValue.serverTimestamp(),
    lastAccessedAt: null,
    ...(exp ? { expiresAt: Timestamp.fromDate(exp) } : {}),
    isActive: true,
  });

  return { id: ref.id, token };
}

export async function updateShareLinkLastAccessedAt(shareLinkDocumentId: string): Promise<void> {
  const linkId = shareLinkDocumentId.trim();
  if (!linkId) return;
  await adminDb.doc(`share_links/${linkId}`).update({
    lastAccessedAt: FieldValue.serverTimestamp(),
  });
}

export async function getShareLinkByToken(token: string): Promise<ShareLinkRecord | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const snap = await adminDb
    .collection("share_links")
    .where("token", "==", trimmed)
    .limit(1)
    .get();
  const d = snap.docs[0];
  if (!d) return null;

  const raw = d.data() as {
    token?: unknown;
    sessionId?: unknown;
    userId?: unknown;
    workspaceId?: unknown;
    generalAccess?: unknown;
    createdBy?: unknown;
    createdAt?: Timestamp | null;
    expiresAt?: unknown;
    isActive?: unknown;
  };

  const sessionId = typeof raw.sessionId === "string" ? raw.sessionId : "";
  if (!sessionId) return null;

  const userId = typeof raw.userId === "string" ? raw.userId.trim() : "";
  const workspaceIdRaw = typeof raw.workspaceId === "string" ? raw.workspaceId.trim() : "";
  if (!workspaceIdRaw) {
    throw new Error("Invalid share link: missing workspaceId");
  }
  const workspaceId = workspaceIdRaw;

  return {
    id: d.id,
    token: typeof raw.token === "string" ? raw.token : trimmed,
    sessionId,
    userId,
    workspaceId,
    generalAccess: normalizeAccessLevel(raw.generalAccess) as ShareGeneralAccess,
    createdBy: typeof raw.createdBy === "string" ? raw.createdBy : "",
    createdAt: raw.createdAt ?? null,
    expiresAt: coerceExpiresAt(raw.expiresAt),
    isActive: raw.isActive !== false,
  };
}

function coerceExpiresAt(value: unknown): Timestamp | null {
  if (value == null) return null;
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (typeof value === "object" && value !== null && "toMillis" in value) {
    return value as Timestamp;
  }
  return null;
}
