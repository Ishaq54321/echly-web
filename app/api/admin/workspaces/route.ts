import { NextResponse } from "next/server";
import { getDocs, getDoc, doc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getWorkspaceSessionCountRepo } from "@/lib/repositories/sessionsRepository";
import type { Workspace } from "@/lib/domain/workspace";

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
    const workspacesSnap = await getDocs(collection(db, "workspaces"));
    const rows: WorkspaceRow[] = [];
    for (const d of workspacesSnap.docs) {
      const data = d.data() as Omit<Workspace, "id">;
      const workspaceId = d.id;
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
      const sessionsUsed = await getWorkspaceSessionCountRepo(workspaceId);
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
      });
    }
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/admin/workspaces:", err);
    return NextResponse.json({ error: "Failed to list workspaces" }, { status: 500 });
  }
}
