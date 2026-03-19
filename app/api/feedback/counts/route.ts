import { NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { getCachedWorkspace } from "@/lib/server/cache/workspaceCache";
import { db } from "@/lib/firebase";

type FeedbackStatus = "open" | "skipped" | "resolved";

function normalizeFeedbackStatus(data: Record<string, unknown>): FeedbackStatus {
  const rawStatus = typeof data.status === "string" ? data.status.trim().toLowerCase() : "";

  if (rawStatus === "open" || rawStatus === "skipped" || rawStatus === "resolved") {
    return rawStatus;
  }

  // Keep counts aligned with visible ticket behavior for legacy docs.
  if (data.isSkipped === true) return "skipped";
  if (data.isResolved === true || rawStatus === "done") return "resolved";
  return "open";
}

/**
 * GET /api/feedback/counts?sessionId=ID
 * Returns Firestore-backed aggregation counts independent of pagination.
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId || sessionId.trim() === "") {
    return NextResponse.json(
      { error: "Missing sessionId" },
      { status: 400 }
    );
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }
  if (session.userId !== user.uid) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const workspaceId = session.workspaceId ?? session.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  try {
    await getCachedWorkspace(workspaceId, () => resolveWorkspaceById(workspaceId));
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    throw err;
  }

  try {
    console.time("COUNT_ROUTE");
    try {
      // MUST mirror the same Firestore filters used by /api/feedback session query.
      const q = query(
        collection(db, "feedback"),
        where("workspaceId", "==", workspaceId),
        where("sessionId", "==", sessionId)
      );
      const snapshot = await getDocs(q);

      let total = 0;
      let open = 0;
      let skipped = 0;
      let resolved = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as Record<string, unknown>;
        const status = normalizeFeedbackStatus(data);
        total++;

        if (status === "open") open++;
        else if (status === "skipped") skipped++;
        else if (status === "resolved") resolved++;
      });

      console.log("COUNT SUMMARY", {
        total,
        open,
        skipped,
        resolved,
        valid: total === open + skipped + resolved,
      });
      if (total !== open + skipped + resolved) {
        console.error("COUNT MISMATCH DETECTED", {
          total,
          open,
          skipped,
          resolved,
        });
      }

      return NextResponse.json({
        total,
        open,
        skipped,
        resolved,
      });
    } finally {
      console.timeEnd("COUNT_ROUTE");
    }
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    console.error("GET /api/feedback/counts:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
