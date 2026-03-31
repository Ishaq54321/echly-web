import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

import {
  accessRequestDocPath,
  accessRequestsPath,
} from "@/lib/repositories/accessRequestPaths";
import { getSessionMember } from "@/lib/repositories/sessionMembersRepository.server";
import type { AccessRequest, AccessRequestStatus } from "@/lib/domain/accessRequest";

function timestampToMs(value: unknown): number {
  if (
    value &&
    typeof (value as { toMillis?: () => number }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (
    value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

function mapDocToAccessRequest(
  sessionId: string,
  docId: string,
  data: FirebaseFirestore.DocumentData
): AccessRequest {
  return {
    id: docId,
    sessionId,
    requesterUserId: data.requesterUserId,
    requesterEmail: data.requesterEmail,
    requestedAccess: data.requestedAccess,
    status: data.status,
    createdAt: timestampToMs(data.createdAt),
    updatedAt: timestampToMs(data.updatedAt),
  };
}

export async function getRequestByUser(
  sessionId: string,
  userId: string
): Promise<AccessRequest | null> {
  const ref = adminDb.doc(accessRequestDocPath(sessionId, userId));
  const snap = await ref.get();
  if (!snap.exists) return null;
  return mapDocToAccessRequest(sessionId, snap.id, snap.data()!);
}

export async function getAccessRequest(
  sessionId: string,
  requestId: string
): Promise<AccessRequest | null> {
  const rid = requestId.trim();
  if (!rid) return null;
  const ref = adminDb.doc(accessRequestDocPath(sessionId, rid));
  const snap = await ref.get();
  if (!snap.exists) return null;
  return mapDocToAccessRequest(sessionId, snap.id, snap.data()!);
}

export async function createAccessRequest(params: {
  sessionId: string;
  requesterUserId: string;
  requesterEmail: string;
  requestedAccess: "resolve";
}): Promise<AccessRequest> {
  const requesterUserId = params.requesterUserId.trim();
  const requesterEmail = params.requesterEmail.trim();

  if (!requesterUserId) {
    throw new Error("requesterUserId is required");
  }
  if (!requesterEmail) {
    throw new Error("requesterEmail is required");
  }

  const ref = adminDb.doc(
    accessRequestDocPath(params.sessionId, requesterUserId)
  );
  const snap = await ref.get();
  const now = Timestamp.now();

  if (snap.exists) {
    const existing = snap.data()!;
    const existingStatus = existing.status as AccessRequestStatus;

    if (existingStatus === "pending") {
      throw new Error("already_requested");
    }
    if (existingStatus === "approved") {
      const member = await getSessionMember(params.sessionId, requesterUserId);
      if (member?.access === "resolve") {
        throw new Error("already_has_access");
      }
      await ref.update({
        requesterUserId,
        requesterEmail,
        requestedAccess: params.requestedAccess,
        status: "pending" as const,
        updatedAt: now,
      });

      const after = await ref.get();
      return mapDocToAccessRequest(
        params.sessionId,
        after.id,
        after.data()!
      );
    }
    if (existingStatus === "rejected") {
      await ref.update({
        requesterUserId,
        requesterEmail,
        requestedAccess: params.requestedAccess,
        status: "pending" as const,
        updatedAt: now,
      });

      const after = await ref.get();
      return mapDocToAccessRequest(
        params.sessionId,
        after.id,
        after.data()!
      );
    }

    throw new Error("invalid_access_request_status");
  }

  await ref.set({
    requesterUserId,
    requesterEmail,
    requestedAccess: params.requestedAccess,
    status: "pending" as const,
    createdAt: now,
    updatedAt: now,
  });

  const after = await ref.get();
  return mapDocToAccessRequest(params.sessionId, after.id, after.data()!);
}

export async function listAccessRequests(
  sessionId: string
): Promise<AccessRequest[]> {
  const ref = adminDb.collection(accessRequestsPath(sessionId));
  const snap = await ref.orderBy("createdAt", "desc").get();

  return snap.docs.map((doc) =>
    mapDocToAccessRequest(sessionId, doc.id, doc.data())
  );
}

/** Every pending request for the session (intent is independent of current membership). */
export async function listPendingAccessRequests(
  sessionId: string
): Promise<AccessRequest[]> {
  const all = await listAccessRequests(sessionId);
  return all.filter((r) => r.status === "pending");
}

export async function updateAccessRequestStatus(params: {
  sessionId: string;
  requestId: string;
  status: Extract<AccessRequestStatus, "approved" | "rejected">;
}): Promise<AccessRequest> {
  const ref = adminDb.doc(
    accessRequestDocPath(params.sessionId, params.requestId)
  );
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error("Access request not found");
  }

  await ref.update({
    status: params.status,
    updatedAt: Timestamp.now(),
  });

  const after = await ref.get();
  return mapDocToAccessRequest(
    params.sessionId,
    after.id,
    after.data()!
  );
}
