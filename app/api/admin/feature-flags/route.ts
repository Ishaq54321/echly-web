import { NextResponse } from "next/server";
import { getDocs, doc, setDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAdmin } from "@/lib/server/adminAuth";
import { logAdminAction } from "@/lib/admin/adminLogs";
import type { FeatureFlagDoc } from "@/lib/admin/types";

const FLAGS_COLLECTION = "featureFlags";

export interface FeatureFlagWithId extends FeatureFlagDoc {
  id: string;
}

/**
 * GET /api/admin/feature-flags
 * Returns all feature flag documents.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }
  const snapshot = await getDocs(collection(db, FLAGS_COLLECTION));
  const flags: FeatureFlagWithId[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as FeatureFlagDoc),
  }));
  return NextResponse.json(flags);
}

/**
 * PATCH /api/admin/feature-flags
 * Body: { id?: string, name?: string, enabledGlobally?: boolean, enabledForWorkspaces?: string[] }
 * Updates or creates a feature flag. If id is provided, updates that doc; else creates by name.
 */
export async function PATCH(req: Request) {
  let admin;
  try {
    admin = await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }
  let body: { id?: string; name?: string; enabledGlobally?: boolean; enabledForWorkspaces?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id.trim() : (typeof body.name === "string" ? body.name.trim().toLowerCase().replace(/\s+/g, "_") : "");
  if (!id) {
    return NextResponse.json({ error: "id or name is required" }, { status: 400 });
  }
  const ref = doc(db, FLAGS_COLLECTION, id);
  const payload: Partial<FeatureFlagDoc> = {};
  if (typeof body.name === "string") payload.name = body.name;
  if (typeof body.enabledGlobally === "boolean") payload.enabledGlobally = body.enabledGlobally;
  if (Array.isArray(body.enabledForWorkspaces)) payload.enabledForWorkspaces = body.enabledForWorkspaces;
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  try {
    await setDoc(ref, payload, { merge: true });
    await logAdminAction({
      adminId: admin.uid,
      action: "feature_flags.update",
      metadata: { flagId: id, updates: payload },
    });
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("PATCH /api/admin/feature-flags:", err);
    return NextResponse.json({ error: "Failed to update feature flag" }, { status: 500 });
  }
}
