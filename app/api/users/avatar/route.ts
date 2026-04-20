import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { adminDb, adminBucket } from "@/lib/server/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { getSignedStorageUrl, extractStoragePathFromUrl } from "@/lib/server/storage/getSignedUrl";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function extensionForType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function extractStoragePath(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "firebasestorage.googleapis.com") {
      const match = parsed.pathname.match(/\/v0\/b\/[^/]+\/o\/(.+)/);
      if (match) return decodeURIComponent(match[1]);
    }
    const bucketName = adminBucket.name;
    const prefix = `/${bucketName}/`;
    const idx = parsed.pathname.indexOf(prefix);
    if (idx === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(idx + prefix.length));
  } catch {
    return null;
  }
}

/** GET /api/users/avatar — refresh signed URL for existing avatar. */
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const snap = await adminDb.doc(`users/${user.uid}`).get();
    const storedUrl = snap.data()?.avatarUrl as string | undefined;

    if (!storedUrl) {
      return apiSuccess({ avatarUrl: null });
    }

    // Extract the storage path from whatever URL format is stored
    const storagePath =
      extractStoragePathFromUrl(storedUrl) ?? extractStoragePath(storedUrl);

    if (!storagePath) {
      return apiSuccess({ avatarUrl: storedUrl });
    }

    const signedUrl = await getSignedStorageUrl(storagePath);

    // Update Firestore with the refreshed URL
    await adminDb.doc(`users/${user.uid}`).set(
      { avatarUrl: signedUrl, photoURL: signedUrl, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    return apiSuccess({ avatarUrl: signedUrl });
  } catch (err) {
    console.error("GET /api/users/avatar:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to refresh avatar URL", status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return apiError({ code: "INVALID_INPUT", message: "Invalid form data", status: 400 });
    }

    const file = formData.get("avatar") as File | null;
    if (!file) {
      return apiError({ code: "INVALID_INPUT", message: "No file provided", status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError({ code: "INVALID_INPUT", message: "INVALID_FILE_TYPE", status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return apiError({ code: "INVALID_INPUT", message: "FILE_TOO_LARGE", status: 400 });
    }

    // Delete existing avatar if any
    const existingSnap = await adminDb.doc(`users/${user.uid}`).get();
    const existingAvatarUrl = existingSnap.data()?.avatarUrl as string | undefined;
    if (existingAvatarUrl) {
      const storagePath =
        extractStoragePathFromUrl(existingAvatarUrl) ?? extractStoragePath(existingAvatarUrl);
      if (storagePath) {
        await adminBucket.file(storagePath).delete({ ignoreNotFound: true });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extensionForType(file.type);
    const filePath = `users/${user.uid}/avatar/${Date.now()}.${ext}`;
    const fileRef = adminBucket.file(filePath);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });

    const signedUrl = await getSignedStorageUrl(filePath);

    await adminDb.doc(`users/${user.uid}`).set(
      { avatarUrl: signedUrl, photoURL: signedUrl, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    await getAuth().updateUser(user.uid, { photoURL: signedUrl });

    return apiSuccess({ avatarUrl: signedUrl });
  } catch (err) {
    console.error("POST /api/users/avatar:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to upload avatar", status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const snap = await adminDb.doc(`users/${user.uid}`).get();
    const avatarUrl = snap.data()?.avatarUrl as string | undefined;

    if (avatarUrl) {
      const storagePath =
        extractStoragePathFromUrl(avatarUrl) ?? extractStoragePath(avatarUrl);
      if (storagePath) {
        await adminBucket.file(storagePath).delete({ ignoreNotFound: true });
      }
    }

    await adminDb.doc(`users/${user.uid}`).set(
      { avatarUrl: null, photoURL: null, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    await getAuth().updateUser(user.uid, { photoURL: null });

    return apiSuccess({ removed: true });
  } catch (err) {
    console.error("DELETE /api/users/avatar:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to remove avatar", status: 500 });
  }
}
