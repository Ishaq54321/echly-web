import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { requireAdmin } from "@/lib/server/adminAuth";
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
  members: number;
  seats: number;
  createdAt: string | null;
  usage: {
    feedbackCreated: number;
    feedbackCreatedThisMonth: number;
    members: number;
  };
  billing: Workspace["billing"];
  entitlements: Workspace["entitlements"];
  /** Plan default ticket limit (from catalog). null = unlimited. */
  planLimitFeedback: number | null;
  /** Workspace override: undefined = use plan default, null = unlimited, number = custom limit. */
  overrideFeedbackLimit: number | null | undefined;
}

/**
 * GET /api/admin/workspaces
 * Returns all workspaces with owner info and ticket usage.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }
  try {
    const catalog = await getPlanCatalog();
    const workspacesSnap = await adminDb.collection("workspaces").get();
    const rows: WorkspaceRow[] = [];
    for (const d of workspacesSnap.docs) {
      const data = d.data() as Omit<Workspace, "id">;
      const workspaceId = d.id;
      const plan = (data.billing?.plan ?? "starter") as PlanId;
      const planEntry = catalog[plan] ?? catalog.starter;
      const planLimitFeedback = planEntry.maxFeedbackPerMonth;
      const overrideFeedbackLimit = data.entitlements?.maxFeedbackPerMonth;

      let ownerEmail: string | null = null;
      let ownerName: string | null = null;
      if (data.ownerId) {
        const userSnap = await adminDb.doc(`users/${data.ownerId}`).get();
        if (userSnap.exists) {
          const u = (userSnap.data() as { email?: string; name?: string } | undefined) ?? {};
          ownerEmail = u.email ?? null;
          ownerName = u.name ?? null;
        }
      }

      const members = Array.isArray(data.members) ? data.members.length : (data.usage?.members ?? 0);
      const seats = data.billing?.seats ?? 1;

      const createdAt =
        data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === "function"
          ? (data.createdAt as { toDate: () => Date }).toDate().toISOString()
          : data.createdAt && typeof (data.createdAt as { seconds?: number }).seconds === "number"
          ? new Date((data.createdAt as { seconds: number }).seconds * 1000).toISOString()
          : null;

      rows.push({
        id: workspaceId,
        name: data.name ?? "Unnamed",
        ownerId: data.ownerId ?? "",
        ownerEmail,
        ownerName,
        plan: data.billing?.plan ?? "starter",
        members,
        seats,
        createdAt,
        usage: {
          feedbackCreated: data.usage?.feedbackCreated ?? 0,
          feedbackCreatedThisMonth: data.usage?.feedbackCreatedThisMonth ?? 0,
          members: data.usage?.members ?? 0,
        },
        billing: data.billing ?? {
          plan: "starter",
          billingCycle: "monthly",
          seats: 1,
          customerId: null,
          subscriptionId: null,
        },
        entitlements: data.entitlements ?? {},
        planLimitFeedback,
        overrideFeedbackLimit,
      });
    }
    return apiSuccess(rows);
  } catch (err) {
    console.error("GET /api/admin/workspaces:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to list workspaces",
      status: 500,
    });
  }
}
