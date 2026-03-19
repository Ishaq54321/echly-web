/**
 * One-time backfill of folders.workspaceId for legacy folder docs.
 *
 * Usage: npx tsx scripts/backfillFolderWorkspaceId.ts
 */

import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";

type SessionDocShape = {
  workspaceId?: string;
  userId?: string;
};

type FolderDocShape = {
  workspaceId?: string;
  userId?: string;
  createdByUserId?: string;
  sessionIds?: string[];
};

async function resolveWorkspaceIdFromFolderData(data: FolderDocShape): Promise<string | null> {
  if (typeof data.workspaceId === "string" && data.workspaceId.trim()) {
    return data.workspaceId.trim();
  }

  const ownerUid =
    typeof data.userId === "string" && data.userId.trim()
      ? data.userId.trim()
      : typeof data.createdByUserId === "string" && data.createdByUserId.trim()
        ? data.createdByUserId.trim()
        : null;

  if (ownerUid) {
    const ownerWorkspaceId = (await getUserWorkspaceIdRepo(ownerUid)) ?? ownerUid;
    if (ownerWorkspaceId) return ownerWorkspaceId;
  }

  const sessionIds = Array.isArray(data.sessionIds) ? data.sessionIds : [];
  if (sessionIds.length === 0) return null;

  for (const sessionId of sessionIds) {
    const trimmedId = typeof sessionId === "string" ? sessionId.trim() : "";
    if (!trimmedId) continue;
    const sessionSnap = await getDoc(doc(db, "sessions", trimmedId));
    if (!sessionSnap.exists()) continue;

    const sessionData = sessionSnap.data() as SessionDocShape;
    if (typeof sessionData.workspaceId === "string" && sessionData.workspaceId.trim()) {
      return sessionData.workspaceId.trim();
    }
    if (typeof sessionData.userId === "string" && sessionData.userId.trim()) {
      const fallbackWorkspaceId =
        (await getUserWorkspaceIdRepo(sessionData.userId.trim())) ?? sessionData.userId.trim();
      if (fallbackWorkspaceId) return fallbackWorkspaceId;
    }
  }

  return null;
}

async function main() {
  const foldersSnap = await getDocs(collection(db, "folders"));
  const missingWorkspaceFolders = foldersSnap.docs.filter((folderDoc) => {
    const data = folderDoc.data() as FolderDocShape;
    return !(typeof data.workspaceId === "string" && data.workspaceId.trim().length > 0);
  });

  console.log(`Found ${missingWorkspaceFolders.length} folder(s) missing workspaceId.`);
  if (missingWorkspaceFolders.length === 0) {
    console.log("Nothing to backfill.");
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const folderDoc of missingWorkspaceFolders) {
    const data = folderDoc.data() as FolderDocShape;
    const workspaceId = await resolveWorkspaceIdFromFolderData(data);
    if (!workspaceId) {
      skipped += 1;
      const sessionIds = Array.isArray(data.sessionIds) ? data.sessionIds : [];
      console.log(
        `SKIP ${folderDoc.id} (could not resolve workspaceId)`,
        {
          hasUserId: typeof data.userId === "string" && data.userId.trim().length > 0,
          hasCreatedByUserId:
            typeof data.createdByUserId === "string" && data.createdByUserId.trim().length > 0,
          sessionIdsCount: sessionIds.length,
          sampleSessionIds: sessionIds.slice(0, 3),
        }
      );
      continue;
    }

    await updateDoc(doc(db, "folders", folderDoc.id), { workspaceId });
    updated += 1;
    console.log(`UPDATED ${folderDoc.id} -> workspaceId=${workspaceId}`);
  }

  const afterSnap = await getDocs(collection(db, "folders"));
  const remainingMissing = afterSnap.docs.filter((folderDoc) => {
    const folderData = folderDoc.data() as FolderDocShape;
    return !(typeof folderData.workspaceId === "string" && folderData.workspaceId.trim().length > 0);
  });

  console.log("\nBackfill complete.");
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Remaining missing workspaceId: ${remainingMissing.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
