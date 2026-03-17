import { NextResponse } from "next/server";
import { getDocs, getDoc, doc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getWorkspaceSessionCountRepo } from "@/lib/repositories/sessionsRepository";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import type { Workspace } from "@/lib/domain/workspace";
import type { PlanId } from "@/lib/billing/plans";

export interface WorkspaceRow {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail: string | null;
  ownerName: string | null;
  plan: string;
  sessionsUsed: number;
  members: number;
  createdAt: string | null;
  usage: { sessionsCreated: number; feedbackCreated: number; members: number };
  billing: Workspace["billing"];
  entitlements: Workspace["entitlements"];
  /** Plan default session limit (from catalog). null = unlimited. */
  planLimitSessions: number | null;
  /** Workspace override: undefined = use plan default, null = unlimited, number = custom limit. */
  overrideLimit: number | null | undefined;
}

/**
 * GET /api/admin/workspaces
 * Returns all workspaces with owner info and session count.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }
  try {
    const catalog = await getPlanCatalog();
    const workspacesSnap = await getDocs(collection(db, "workspaces"));
    const rows: WorkspaceRow[] = [];
    for (const d of workspacesSnap.docs) {
      const data = d.data() as Omit<Workspace, "id">;
      const workspaceId = d.id;
      const plan = (data.billing?.plan ?? "free") as PlanId;
      const planEntry = catalog[plan] ?? catalog.free;
      const planLimitSessions = planEntry.maxSessions ?? null;
      const overrideLimit = data.entitlements?.maxSessions;
      let ownerEmail: string | null = null;
      let ownerName: string | null = null;
      if (data.ownerId) {
        const userSnap = await getDoc(doc(db, "users", data.ownerId));
        if (userSnap.exists()) {
          const u = userSnap.data() as { email?: string; name?: string };
          ownerEmail = u.email ?? null;
          ownerName = u.name ?? null;
        }
      }
      const workspaceData = { id: workspaceId, ...data } as Workspace;
      const sessionsUsed = await getWorkspaceSessionCountRepo(workspaceId, workspaceData);
      const members = Array.isArray(data.members) ? data.members.length : 0;
      const createdAt = data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === "function"
        ? (data.createdAt as { toDate: () => Date }).toDate().toISOString()
        : (data.createdAt && typeof (data.createdAt as { seconds?: number }).seconds === "number"
          ? new Date((data.createdAt as { seconds: number }).seconds * 1000).toISOString()
          : null);
      rows.push({
        id: workspaceId,
        name: data.name ?? "Unnamed",
        ownerId: data.ownerId ?? "",
        ownerEmail,
        ownerName,
        plan: data.billing?.plan ?? "free",
        sessionsUsed,
        members,
        createdAt,
        usage: data.usage ?? { sessionsCreated: 0, feedbackCreated: 0, members: 0 },
        billing: data.billing ?? { plan: "free", billingCycle: "monthly", seats: 1, stripeCustomerId: null, stripeSubscriptionId: null },
        entitlements: data.entitlements ?? {},
        planLimitSessions,
        overrideLimit,
      });
    }
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/admin/workspaces:", err);
    return NextResponse.json({ error: "Failed to list workspaces" }, { status: 500 });
  }
}
