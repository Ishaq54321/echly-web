import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { DIGEST_EPOCH } from "@/lib/domain/notification";
import type { NotificationRow } from "@/lib/domain/notification";

/**
 * Repository layer for the daily activity-digest cron.
 *
 * Source of truth is the per-recipient `notifications` collection. A
 * notification is "un-digested" when `digestedAt == null` AND
 * `createdAt >= DIGEST_EPOCH`. The cron walks users with un-digested
 * notifications, renders one digest per user, then transactionally stamps
 * `digestedAt` on exactly the docs it rendered.
 *
 * Required composite indexes (declared in firestore.indexes.json):
 *   - notifications(digestedAt ASC, userId ASC)
 *       → user discovery: page through distinct userIds with un-digested docs
 *   - notifications(userId ASC, digestedAt ASC, createdAt ASC)
 *       → per-user fetch: un-digested docs for one user, oldest-first
 *
 * IMPORTANT (Firestore semantics): `where("digestedAt", "==", null)` matches
 * only docs where the field is explicitly `null`, NOT docs where it is absent.
 * Every notification is created with `digestedAt: null` (see
 * notificationsRepository.server.ts buildPayload) so this holds. Pre-epoch
 * historical docs may predate that and/or be ancient — the `createdAt` floor in
 * the per-user fetch excludes them regardless, so they are simply never
 * digested (the locked design: no backfill, no giant first digest).
 */

const COLLECTION = "notifications";

/** Max distinct users returned per discovery page. Keep the page bounded so a
 * single discovery round-trip stays cheap; the cron loops pages via cursor. */
const USER_PAGE_DEFAULT = 25;

/** Hard cap on docs scanned in one discovery page. Each undigested doc is one
 * read; bound the scan so a backlog can't blow the function's time/cost budget
 * in a single query. We over-fetch raw docs to collect USER_PAGE_DEFAULT
 * distinct users, but never scan more than this many in one call. */
const DISCOVERY_SCAN_CAP = 500;

/** Max un-digested notifications loaded per user per digest. If a user somehow
 * has more, the digest summarizes the loaded set and marks "+N more"; we never
 * load unbounded. The remainder stays un-digested and is swept next run. */
export const MAX_NOTIFICATIONS_PER_USER = 500;

export interface UserDiscoveryPage {
  /** Distinct userIds (with at least one un-digested notification) for this page. */
  userIds: string[];
  /**
   * Opaque cursor for the next discovery page, or null when drained. The cursor
   * is the last userId scanned; the next page resumes strictly after it. Note:
   * because we cut the page at a distinct-user boundary, the cursor is always a
   * userId we've fully accounted for, so no user is split across pages.
   */
  nextCursor: string | null;
}

/**
 * Discover a bounded page of distinct userIds that have un-digested
 * notifications. Ordered by userId so paging by a userId cursor yields stable,
 * non-overlapping pages.
 *
 * We query `digestedAt == null` ordered by `userId` and collect distinct ids
 * until we have USER_PAGE_DEFAULT of them (or hit DISCOVERY_SCAN_CAP scanned
 * docs, or run out). The `createdAt >= DIGEST_EPOCH` floor is intentionally NOT
 * applied here (Firestore can't combine the `== null` equality, a `createdAt`
 * range, and an `orderBy userId` in one query). Instead the per-user fetch
 * applies the epoch floor; a user whose only un-digested docs are pre-epoch
 * yields an empty fetch and is skipped (no email). With a go-forward epoch this
 * is rare and cheap.
 */
export async function getUsersWithUndigestedNotificationsPage(
  cursorUserId: string | null,
  pageSize: number = USER_PAGE_DEFAULT
): Promise<UserDiscoveryPage> {
  const targetUsers = Math.max(1, Math.min(pageSize, USER_PAGE_DEFAULT));
  const seen = new Set<string>();
  const userIds: string[] = [];
  let lastScannedUserId: string | null = cursorUserId;
  let scanned = 0;
  let exhausted = false;

  // Page through raw docs (ordered by userId) accumulating distinct users.
  // Each inner query is capped; we loop until we have enough distinct users,
  // the global scan cap is reached, or the collection is drained.
  while (userIds.length < targetUsers && scanned < DISCOVERY_SCAN_CAP) {
    let q: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION)
      .where("digestedAt", "==", null)
      .orderBy("userId", "asc");
    if (lastScannedUserId) {
      q = q.startAfter(lastScannedUserId);
    }
    const remainingScan = DISCOVERY_SCAN_CAP - scanned;
    q = q.limit(Math.min(200, remainingScan));

    const snap = await q.get();
    if (snap.empty) {
      exhausted = true;
      break;
    }

    for (const doc of snap.docs) {
      scanned++;
      const uid =
        typeof doc.data().userId === "string" ? (doc.data().userId as string) : "";
      lastScannedUserId = uid;
      if (!uid || seen.has(uid)) continue;
      seen.add(uid);
      userIds.push(uid);
      if (userIds.length >= targetUsers) break;
    }

    if (snap.docs.length < Math.min(200, remainingScan)) {
      // The inner query returned fewer than requested → collection drained.
      exhausted = true;
      break;
    }
  }

  // nextCursor is the last userId we scanned. We resume strictly after it.
  // If we drained the collection, there is no next page.
  const nextCursor = exhausted ? null : lastScannedUserId;
  return { userIds, nextCursor };
}

/**
 * Load a user's un-digested notifications (digestedAt == null AND
 * createdAt >= DIGEST_EPOCH), oldest-first, capped at MAX_NOTIFICATIONS_PER_USER.
 *
 * Returns both the rows and a `truncated` flag: when the user has more than the
 * cap, only the oldest `cap` are loaded+digested this run; the rest stay
 * un-digested and the digest renders a "+N more" affordance. Oldest-first so we
 * always drain the backlog tail-first and don't strand old notifications.
 */
export async function getUndigestedNotificationsForUser(
  userId: string,
  cap: number = MAX_NOTIFICATIONS_PER_USER
): Promise<{ rows: NotificationRow[]; truncated: boolean }> {
  const uid = userId.trim();
  if (!uid) return { rows: [], truncated: false };

  const limit = Math.max(1, cap);
  const snap = await adminDb
    .collection(COLLECTION)
    .where("userId", "==", uid)
    .where("digestedAt", "==", null)
    .where("createdAt", ">=", Timestamp.fromMillis(DIGEST_EPOCH))
    .orderBy("createdAt", "asc")
    // +1 so we can detect "more than the cap exists" without a second query.
    .limit(limit + 1)
    .get();

  const docs = snap.docs;
  const truncated = docs.length > limit;
  const kept = truncated ? docs.slice(0, limit) : docs;
  const rows = kept.map((d) => rowFromDigestDoc(d));
  return { rows, truncated };
}

function rowFromDigestDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot
): NotificationRow {
  const d = doc.data();
  return {
    id: doc.id,
    userId: typeof d.userId === "string" ? d.userId : "",
    workspaceId: typeof d.workspaceId === "string" ? d.workspaceId : "",
    sessionId: typeof d.sessionId === "string" ? d.sessionId : "",
    sessionTitle: typeof d.sessionTitle === "string" ? d.sessionTitle : null,
    feedbackId: typeof d.feedbackId === "string" ? d.feedbackId : null,
    commentId: typeof d.commentId === "string" ? d.commentId : null,
    type: d.type,
    actor: d.actor,
    title: typeof d.title === "string" ? d.title : "",
    entityTitle: typeof d.entityTitle === "string" ? d.entityTitle : null,
    body: typeof d.body === "string" ? d.body : null,
    read: d.read === true,
    readAt: d.readAt?.toMillis?.() ?? null,
    createdAt: d.createdAt?.toMillis?.() ?? null,
    digestedAt: d.digestedAt?.toMillis?.() ?? null,
    accessRequestId:
      typeof d.accessRequestId === "string" ? d.accessRequestId : null,
    requestedAccess:
      d.requestedAccess === "view" || d.requestedAccess === "resolve"
        ? d.requestedAccess
        : null,
    actionStatus:
      d.actionStatus === "pending" ||
      d.actionStatus === "approved" ||
      d.actionStatus === "rejected"
        ? d.actionStatus
        : null,
    collapseKey: typeof d.collapseKey === "string" ? d.collapseKey : null,
    collapseCount:
      typeof d.collapseCount === "number" ? d.collapseCount : null,
  };
}

/** Firestore batched-write cap (writes per commit). */
const STAMP_CHUNK = 400;

/**
 * Transactionally stamp `digestedAt` on exactly the notification ids that were
 * rendered into a sent digest. Call this ONLY after a confirmed send.
 *
 * Idempotency / no-double-send argument:
 *   - Each stamp is conditional inside a transaction: we re-read the doc and
 *     skip it if `digestedAt` is already set. So an overlapping/retried run that
 *     re-selected the same docs and re-sent (e.g. the previous run sent the
 *     email but crashed before stamping) will, on its OWN stamp, find them
 *     unstamped and stamp them — and any run that already stamped them is a
 *     no-op. Combined with the fetch filter (`digestedAt == null`), a doc that
 *     is already stamped is never re-selected for a future digest at all.
 *   - We stamp only the ids passed in (the rendered set), so notifications that
 *     arrived mid-run (after the fetch) are NOT stamped and flow into the next
 *     run — never silently swallowed.
 *
 * Returns the number of docs newly stamped (already-stamped docs are skipped).
 * Chunked into transactions of STAMP_CHUNK so a large digest stays within
 * Firestore's per-transaction write limit.
 */
export async function stampNotificationsDigested(
  notificationIds: string[]
): Promise<number> {
  const ids = notificationIds.filter((id) => typeof id === "string" && id.trim());
  if (ids.length === 0) return 0;

  let stamped = 0;
  for (let i = 0; i < ids.length; i += STAMP_CHUNK) {
    const chunk = ids.slice(i, i + STAMP_CHUNK);
    await adminDb.runTransaction(async (tx) => {
      const refs = chunk.map((id) => adminDb.collection(COLLECTION).doc(id));
      const snaps = await tx.getAll(...refs);
      const now = FieldValue.serverTimestamp();
      for (let j = 0; j < snaps.length; j++) {
        const snap = snaps[j];
        if (!snap.exists) continue;
        // Skip docs already digested — keeps the stamp idempotent under retries.
        if (snap.data()?.digestedAt != null) continue;
        tx.update(refs[j], { digestedAt: now });
        stamped++;
      }
    });
  }
  return stamped;
}
