/**
 * Migration: Remove plan-synced entitlement fields from workspaces so that
 * effective limits come from the plan catalog. Only removes a field when
 * its value equals the current catalog value for that workspace's plan
 * (so true overrides are preserved).
 */

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getPlanCatalog, type PlanCatalog } from "@/lib/billing/getPlanCatalog";
import type { PlanId } from "@/lib/billing/plans";

export type MigrationResult = {
  workspaceId: string;
  plan: PlanId;
  removed: ("maxSessions" | "maxMembers" | "insightsAccess")[];
};

/**
 * Runs the migration: for each workspace, removes entitlements.maxSessions,
 * entitlements.maxMembers, entitlements.insightsAccess when they equal the
 * current plan catalog value. Does not remove true overrides.
 *
 * @param dryRun If true, returns what would be changed without writing.
 */
export async function migrateWorkspaceEntitlementsToOverrides(dryRun: boolean): Promise<{
  updated: number;
  results: MigrationResult[];
}> {
  const catalog: PlanCatalog = await getPlanCatalog();

  const workspacesSnap = await adminDb.collection("workspaces").get();
  const results: MigrationResult[] = [];
  let updated = 0;

  for (const wsDoc of workspacesSnap.docs) {
    const workspaceId = wsDoc.id;
    const data = wsDoc.data();
    const plan = (data.billing?.plan ?? "free") as PlanId;
    const entry = catalog[plan] ?? catalog.free;
    const entitlements = data.entitlements as {
      maxSessions?: number | null;
      maxMembers?: number | null;
      insightsAccess?: boolean;
    } | undefined;

    const toRemove: ("maxSessions" | "maxMembers" | "insightsAccess")[] = [];

    if (entitlements?.maxSessions !== undefined && entitlements.maxSessions === entry.maxSessions) {
      toRemove.push("maxSessions");
    }
    if (entitlements?.maxMembers !== undefined && entitlements.maxMembers === entry.maxMembers) {
      toRemove.push("maxMembers");
    }
    if (
      entitlements?.insightsAccess !== undefined &&
      entitlements.insightsAccess === entry.insightsEnabled
    ) {
      toRemove.push("insightsAccess");
    }

    if (toRemove.length === 0) continue;

    results.push({ workspaceId, plan, removed: toRemove });

    if (!dryRun) {
      const updates: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (toRemove.includes("maxSessions")) updates["entitlements.maxSessions"] = FieldValue.delete();
      if (toRemove.includes("maxMembers")) updates["entitlements.maxMembers"] = FieldValue.delete();
      if (toRemove.includes("insightsAccess")) updates["entitlements.insightsAccess"] = FieldValue.delete();
      await adminDb.collection("workspaces").doc(workspaceId).update(updates);
      updated += 1;
    }
  }

  return { updated: dryRun ? results.length : updated, results };
}
