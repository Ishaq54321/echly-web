import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

import {
  sessionMembersPath,
  sessionMemberDocPath,
  sessionInvitesPath,
  sessionInviteDocPath,
} from "./sessionPaths";

import type { SessionMember } from "@/lib/domain/sessionMember";
import type { SessionInvite } from "@/lib/domain/sessionInvite";

export async function getSessionMember(
  sessionId: string,
  userId: string
): Promise<SessionMember | null> {
  const ref = adminDb.doc(sessionMemberDocPath(sessionId, userId));
  const snap = await ref.get();

  if (!snap.exists) return null;

  const data = snap.data()!;

  return {
    userId: data.userId,
    email: data.email,
    access: data.access,
    addedBy: data.addedBy,
    createdAt: data.createdAt?.toDate?.() ?? new Date(0),
  };
}

export async function listSessionMembers(
  sessionId: string
): Promise<SessionMember[]> {
  const ref = adminDb.collection(sessionMembersPath(sessionId));
  const snap = await ref.get();

  return snap.docs.map((doc) => {
    const data = doc.data();

    return {
      userId: data.userId,
      email: data.email,
      access: data.access,
      addedBy: data.addedBy,
      createdAt: data.createdAt?.toDate?.() ?? new Date(0),
    };
  });
}

export async function addSessionMember(params: {
  sessionId: string;
  userId: string;
  email: string;
  access: "view" | "resolve";
  addedBy: string;
}) {
  const ref = adminDb.doc(
    sessionMemberDocPath(params.sessionId, params.userId)
  );

  await ref.set({
    userId: params.userId,
    email: params.email,
    access: params.access,
    addedBy: params.addedBy,
    createdAt: Timestamp.now(),
  });
}

export async function getInviteByEmail(
  sessionId: string,
  email: string
): Promise<SessionInvite | null> {
  const ref = adminDb
    .collection(sessionInvitesPath(sessionId))
    .where("email", "==", email)
    .limit(1);

  const snap = await ref.get();

  if (snap.empty) return null;

  const data = snap.docs[0].data();

  return {
    email: data.email,
    access: data.access,
    status: data.status,
    invitedBy: data.invitedBy,
    createdAt: data.createdAt?.toDate?.() ?? new Date(0),
  };
}

export async function createSessionInvite(params: {
  sessionId: string;
  email: string;
  access: "view" | "resolve";
  invitedBy: string;
}) {
  const ref = adminDb.collection(sessionInvitesPath(params.sessionId));

  await ref.add({
    email: params.email,
    access: params.access,
    status: params.access === "view" ? "active" : "pending",
    invitedBy: params.invitedBy,
    createdAt: Timestamp.now(),
  });
}

export async function activateInvite(params: {
  sessionId: string;
  email: string;
}) {
  const ref = adminDb
    .collection(sessionInvitesPath(params.sessionId))
    .where("email", "==", params.email)
    .limit(1);

  const snap = await ref.get();

  if (snap.empty) return;

  const doc = snap.docs[0];

  await doc.ref.update({
    status: "active",
  });
}
