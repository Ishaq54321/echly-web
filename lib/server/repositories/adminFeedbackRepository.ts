import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export type AdminFeedbackTestDoc = {
  message: string;
  createdAt: FirebaseFirestore.FieldValue;
};

const collectionName = "_admin_feedback_test";

export async function addAdminFeedbackTestRepo(message: string) {
  const ref = adminDb.collection(collectionName).doc();
  const payload: AdminFeedbackTestDoc = {
    message,
    createdAt: FieldValue.serverTimestamp(),
  };
  await ref.set(payload);
  return { id: ref.id };
}

export async function getAdminFeedbackTestRepo(id: string) {
  const snap = await adminDb.collection(collectionName).doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, data: snap.data() };
}

