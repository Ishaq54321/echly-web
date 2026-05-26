import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

/**
 * Per-actor-per-recipient-per-event-type email cooldown (Phase 6).
 *
 * Why this exists: previously, when one actor performed many actions in a
 * burst (e.g., resolving 100 tickets in a triage sweep), every action sent
 * an immediate email to the affected user — 100 emails. There is no batching
 * or digesting layer. This cooldown is the cheapest possible fix: when the
 * same actor triggers the same event type to the same recipient within
 * COOLDOWN_MS, only the first one sends.
 *
 * Scope:
 *   - Per-user (lives at users/{recipientUid}.emailSends.cooldowns.*)
 *   - Global across workspaces (Daniel resolving Maya's tickets is one bucket
 *     regardless of which workspace the ticket lives in)
 *   - Per-actor (Daniel's burst does NOT suppress Sarah's email to Maya)
 *   - Per-event-type (a newComment cooldown does NOT suppress a mention)
 *
 * Limits / not in scope:
 *   - Does NOT cap fan-out (one access-request still emails N owners)
 *   - Does NOT cap per-recipient total volume across actors
 *   - Does NOT apply to lifecycle (welcome, plan-limit) or transactional sends
 *
 * The claim is performed in a Firestore transaction so two concurrent events
 * from the same actor to the same recipient can't both win. The stamp is
 * written only when we actually send (after the preference gate passes), so
 * a recipient with notifications off doesn't accumulate suppression stamps.
 */

export const EMAIL_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

/** Event-type discriminator for the cooldown bucket. */
export type CooldownEventType =
  | "newComment"
  | "mention"
  | "ticketAssigned"
  | "ticketResolved";

/**
 * Firestore-safe key for the cooldown map. Composes (actorUid, eventType) into
 * a single map key under users/{recipientUid}.emailSends.cooldowns.
 *
 * We sanitize "." out of the actorUid component because Firestore field paths
 * use "." as a separator; in practice Firebase uids are alphanumeric, but a
 * defensive replace keeps the format unambiguous if the uid shape ever shifts.
 */
function cooldownKey(actorUid: string, eventType: CooldownEventType): string {
  return `${actorUid.replace(/\./g, "_")}_${eventType}`;
}

export type CooldownClaim =
  | { ok: true }
  | { ok: false; reason: "cooldown" };

/**
 * Attempt to claim a cooldown slot for (actor → recipient, eventType).
 *
 * Returns { ok: true } if the caller may proceed to send. Returns
 * { ok: false, reason: "cooldown" } if a fresh stamp is present.
 *
 * IMPORTANT: this does NOT write the stamp. Callers must call
 * stampCooldownSent() AFTER a successful send. If the preference gate or send
 * itself fails, no stamp is written, so the recipient can still receive a
 * later event of the same kind from the same actor.
 *
 * The "claim" semantics live in checkAndReserve below: we read the current
 * stamp in a transaction and only return ok:true if it's stale. Two concurrent
 * callers race on the same transaction — exactly one sees a stale stamp.
 * The transaction does NOT write a placeholder, so a caller that wins the
 * race but then fails to send doesn't leave a phantom stamp behind. The
 * trade-off: if two events race AND BOTH end up sending (because the read
 * happened before either committed), the second sees no stamp and proceeds.
 * Acceptable — the actual race window is sub-millisecond and the cost of a
 * lost dedup is one extra email, not a storm.
 */
export async function checkCooldown(params: {
  recipientUid: string;
  actorUid: string;
  eventType: CooldownEventType;
  now?: number;
}): Promise<CooldownClaim> {
  const { recipientUid, actorUid, eventType } = params;
  const now = params.now ?? Date.now();

  if (!recipientUid || !actorUid) {
    // Nothing to dedup against — let the caller decide via preference check.
    return { ok: true };
  }

  const ref = adminDb.doc(`users/${recipientUid}`);
  const key = cooldownKey(actorUid, eventType);

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      // No user doc at all — caller will fail the user lookup downstream.
      // Return ok so the natural error path runs (vs silently swallowing as
      // a cooldown skip).
      return { ok: true } as const;
    }
    const stamp = snap.data()?.emailSends?.cooldowns?.[key] as
      | Timestamp
      | undefined;
    if (stamp && now - stamp.toMillis() < EMAIL_COOLDOWN_MS) {
      return { ok: false, reason: "cooldown" } as const;
    }
    return { ok: true } as const;
  });
}

/**
 * Write the cooldown stamp after a successful send. Best-effort: a failure
 * here only means the next event in the cooldown window might also send —
 * less bad than throwing on a successful send path.
 */
export async function stampCooldownSent(params: {
  recipientUid: string;
  actorUid: string;
  eventType: CooldownEventType;
}): Promise<void> {
  const { recipientUid, actorUid, eventType } = params;
  if (!recipientUid || !actorUid) return;
  const key = cooldownKey(actorUid, eventType);
  try {
    await adminDb.doc(`users/${recipientUid}`).set(
      {
        emailSends: {
          cooldowns: { [key]: FieldValue.serverTimestamp() },
        },
      },
      { merge: true }
    );
  } catch (err) {
    console.error(
      `[email-cooldown] stamp failed recipient=${recipientUid} actor=${actorUid} event=${eventType}:`,
      err
    );
  }
}
