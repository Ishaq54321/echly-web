import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { getWorkspaceMemberRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import { adminDb, adminBucket } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

function extensionForType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);
    if (!workspace) {
      return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
    }

    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    if (callerMember?.role !== "OWNER") {
      return apiError({ code: "FORBIDDEN", message: "Only the workspace owner can update the logo", status: 403 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return apiError({ code: "INVALID_INPUT", message: "Invalid form data", status: 400 });
    }

    const file = formData.get("logo") as File | null;
    if (!file) {
      return apiError({ code: "INVALID_INPUT", message: "No file provided", status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError({ code: "INVALID_INPUT", message: "INVALID_FILE_TYPE", status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return apiError({ code: "INVALID_INPUT", message: "FILE_TOO_LARGE", status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extensionForType(file.type);
    const filePath = `workspaces/${workspaceId}/logo.${ext}`;
    const fileRef = adminBucket.file(filePath);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
      public: true,
    });

    const publicUrl = fileRef.publicUrl();

    await adminDb.doc(`workspaces/${workspaceId}`).update({
      logoUrl: publicUrl,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return apiSuccess({ logoUrl: publicUrl });
  } catch (err) {
    console.error("POST /api/workspace/logo:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to upload logo", status: 500 });
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
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);
    if (!workspace) {
      return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
    }

    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    if (callerMember?.role !== "OWNER") {
      return apiError({ code: "FORBIDDEN", message: "Only the workspace owner can remove the logo", status: 403 });
    }

    if (!workspace.logoUrl) {
      return apiError({ code: "INVALID_INPUT", message: "NO_LOGO", status: 400 });
    }

    // Extract storage path from the public URL
    // Public URL format: https://storage.googleapis.com/<bucket>/<path>
    try {
      const url = new URL(workspace.logoUrl);
      const bucketName = adminBucket.name;
      // Path after /<bucket>/
      const prefix = `/${bucketName}/`;
      const idx = url.pathname.indexOf(prefix);
      if (idx !== -1) {
        const storagePath = decodeURIComponent(url.pathname.slice(idx + prefix.length));
        await adminBucket.file(storagePath).delete({ ignoreNotFound: true });
      }
    } catch (storageErr) {
      console.error("DELETE /api/workspace/logo: storage delete failed:", storageErr);
    }

    await adminDb.doc(`workspaces/${workspaceId}`).update({
      logoUrl: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return apiSuccess({ success: true });
  } catch (err) {
    console.error("DELETE /api/workspace/logo:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to remove logo", status: 500 });
  }
}
