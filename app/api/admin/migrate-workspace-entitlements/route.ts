import { requireAdmin } from "@/lib/server/adminAuth";
import { migrateWorkspaceEntitlementsToOverrides } from "@/lib/admin/migrateWorkspaceEntitlementsToOverrides";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

/**
 * POST /api/admin/migrate-workspace-entitlements
 * Query: ?dryRun=true to preview without writing.
 *
 * Removes plan-synced entitlement fields from workspaces (maxSessions, maxMembers,
 * insightsAccess) when they equal the current plan catalog value. Preserves true overrides.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "true";

  try {
    const { updated, results } = await migrateWorkspaceEntitlementsToOverrides(dryRun);
    return apiSuccess({
      dryRun,
      updated,
      results,
      message: dryRun
        ? `Would update ${results.length} workspace(s). Remove ?dryRun=true to apply.`
        : `Updated ${updated} workspace(s).`,
    });
  } catch (err) {
    console.error("migrate-workspace-entitlements:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : "Migration failed",
      status: 500,
    });
  }
}
