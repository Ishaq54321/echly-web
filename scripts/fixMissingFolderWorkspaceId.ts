import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = "echly-b74cc";

if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });
}

async function main() {
  const db = getFirestore();
  const snapshot = await db.collection("folders").get();

  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  const forcedWorkspaceId = (process.env.FORCE_WORKSPACE_ID ?? "").trim();

  for (const folderDoc of snapshot.docs) {
    scanned += 1;
    const data = folderDoc.data() as {
      workspaceId?: string;
      userId?: string;
      createdByUserId?: string;
    };

    const workspaceIdAlready = typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
    if (workspaceIdAlready) continue;

    const userId = typeof data.userId === "string" ? data.userId.trim() : "";
    const createdByUserId =
      typeof data.createdByUserId === "string" ? data.createdByUserId.trim() : "";

    const workspaceId = userId || createdByUserId;

    if (!workspaceId) {
      // One-time override for legacy/orphan docs without any owner fields.
      if (forcedWorkspaceId) {
        await folderDoc.ref.update({
          workspaceId: forcedWorkspaceId,
        });
        updated += 1;
        console.log("Forced update folder:", folderDoc.id, "-> workspaceId=", forcedWorkspaceId);
        continue;
      }

      skipped += 1;
      const raw = folderDoc.data() as Record<string, unknown>;
      console.log("Skipping folder (no userId):", folderDoc.id, {
        workspaceId: raw.workspaceId,
        userId: raw.userId,
        createdByUserId: raw.createdByUserId,
        name: raw.name,
        createdAt: raw.createdAt,
        sessionIds: Array.isArray(raw.sessionIds) ? raw.sessionIds : undefined,
        otherKeys: Object.keys(raw).filter((k) =>
          !["workspaceId", "userId", "createdByUserId", "sessionIds"].includes(k)
        ),
      });
      continue;
    }

    await folderDoc.ref.update({
      workspaceId,
    });

    updated += 1;
    console.log("Updated folder:", folderDoc.id);
  }

  const afterSnap = await db.collection("folders").get();
  const remainingMissing = afterSnap.docs.filter((docSnap) => {
    const d = docSnap.data() as { workspaceId?: string };
    return !(typeof d.workspaceId === "string" && d.workspaceId.trim().length > 0);
  });

  console.log("\nDone.");
  console.log(`Scanned: ${scanned}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Remaining missing workspaceId: ${remainingMissing.length}`);

  // If there are still missing folders, it helps to see what workspaceIds exist.
  const workspacesSnap = await db.collection("workspaces").limit(10).get();
  console.log("Existing workspaces (sample up to 10):");
  for (const wsDoc of workspacesSnap.docs) {
    const wsData = wsDoc.data() as Record<string, unknown>;
    const name = typeof wsData.name === "string" ? wsData.name : undefined;
    console.log(`- ${wsDoc.id}${name ? ` (${name})` : ""}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
