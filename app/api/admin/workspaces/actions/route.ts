import { NextResponse } from "next/server";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAdmin } from "@/lib/server/adminAuth";
import { logAdminAction } from "@/lib/admin/adminLogs";
import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { updateWorkspacePlanRepo } from "@/lib/repositories/workspacesRepository";
import type { PlanId } from "@/lib/billing/plans";

const VALID_PLANS: PlanId[] = ["free", "starter", "business", "enterprise"];

type Action =
  | "set_plan"
  | "grant_unlimited_sessions"
  | "override_session_limit"
  | "reset_usage"
  | "suspend"
  | "resume";

/**
 * POST /api/admin/workspaces/actions
 * Body: { workspaceId: string, action: Action, ...actionParams }
 * Admin actions: set_plan, grant_unlimited_sessions, override_session_limit, reset_usage, suspend, resume.
 */
export async function POST(req: Request) {
  let admin;
  try {
    admin = await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }
  let body: {
    workspaceId?: string;
    action?: Action;
    plan?: string;
    sessionLimit?: number | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId.trim() : "";
  const action = body.action;
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }
  if (!action || !["set_plan", "grant_unlimited_sessions", "override_session_limit", "reset_usage", "suspend", "resume"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const ref = doc(db, "workspaces", workspaceId);

  try {
    if (action === "set_plan") {
      const plan = (typeof body.plan === "string" ? body.plan.trim().toLowerCase() : "") as PlanId;
      if (!VALID_PLANS.includes(plan)) {
        return NextResponse.json({ error: "plan must be one of: free, starter, business, enterprise" }, { status: 400 });
      }
      await updateWorkspacePlanRepo(workspaceId, plan);
      await logAdminAction({ adminId: admin.uid, action: "workspace.set_plan", workspaceId, metadata: { plan } });
      return NextResponse.json({ success: true, plan });
    }

    if (action === "grant_unlimited_sessions") {
      await updateDoc(ref, {
        "entitlements.maxSessions": null,
        updatedAt: serverTimestamp(),
      });
      await logAdminAction({ adminId: admin.uid, action: "workspace.grant_unlimited_sessions", workspaceId });
      return NextResponse.json({ success: true });
    }

    // override_session_limit: only updates entitlements. Never deletes existing sessions.
    // Session limit is enforced only when creating NEW sessions (POST /api/sessions).
    if (action === "override_session_limit") {
      const sessionLimit = body.sessionLimit === undefined ? null : (typeof body.sessionLimit === "number" ? body.sessionLimit : null);
      await updateDoc(ref, {
        "entitlements.maxSessions": sessionLimit,
        updatedAt: serverTimestamp(),
      });
      await logAdminAction({ adminId: admin.uid, action: "workspace.override_session_limit", workspaceId, metadata: { sessionLimit } });
      return NextResponse.json({ success: true });
    }

    if (action === "reset_usage") {
      await updateDoc(ref, {
        "usage.sessionsCreated": 0,
        "usage.feedbackCreated": 0,
        updatedAt: serverTimestamp(),
      });
      await logAdminAction({ adminId: admin.uid, action: "workspace.reset_usage", workspaceId });
      return NextResponse.json({ success: true });
    }

    if (action === "suspend") {
      await updateDoc(ref, {
        "billing.suspended": true,
        updatedAt: serverTimestamp(),
      });
      await logAdminAction({ adminId: admin.uid, action: "workspace.suspend", workspaceId });
      return NextResponse.json({ success: true });
    }

    if (action === "resume") {
      await updateDoc(ref, {
        "billing.suspended": false,
        updatedAt: serverTimestamp(),
      });
      await logAdminAction({ adminId: admin.uid, action: "workspace.resume", workspaceId });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/admin/workspaces/actions:", err);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
