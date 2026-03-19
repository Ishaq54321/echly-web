import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { resolveWorkspaceForUser } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { corsHeaders } from "@/lib/server/cors";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/** GET /api/folders - list folders for the authenticated user's workspace. */
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    const errRes = res as Response;
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
    });
  }

  try {
    const { workspaceId } = await resolveWorkspaceForUser(user.uid);
    const foldersQuery = query(
      collection(db, "folders"),
      where("workspaceId", "==", workspaceId)
    );
    const foldersSnapshot = await getDocs(foldersQuery);

    return NextResponse.json(
      {
        folders: foldersSnapshot.docs.map((folderDoc) => ({
          id: folderDoc.id,
          name: folderDoc.data().name,
          sessionCount: folderDoc.data().sessionCount || 0,
        })),
      },
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    console.error("GET /api/folders:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load folders" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
