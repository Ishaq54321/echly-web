import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// Production limits
// Free users (workspace plan === "starter"): 300 AI improvements per month
// Paid users (business, enterprise): 1500 AI improvements per month
const FREE_LIMIT = 300;
const PAID_LIMIT = 1500;

export interface UserPlan {
  isFree: boolean;
}

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  resetDate: string;
  quotaType: "monthly";
  isFree: boolean;
}

export type QuotaCheckOutcome =
  | { allowed: true; isFree: boolean; limit: number }
  | {
      allowed: false;
      used: number;
      limit: number;
      resetDate: string;
      quotaType: "monthly";
      isFree: boolean;
    };

export class QuotaExceededError extends Error {
  constructor(
    public readonly used: number,
    public readonly limit: number,
    public readonly resetDate: string,
  ) {
    super("Monthly AI quota exceeded");
    this.name = "QuotaExceededError";
  }
}

// In-memory plan cache. Plans change rarely (monthly at most), so
// a 15-minute TTL is a safe trade-off. Per-instance only — across
// serverless instances each will warm independently.
//
// Same pattern as the in-memory rate limiter in lib/ai/rateLimit.ts.
const PLAN_CACHE_TTL_MS = 15 * 60 * 1000;

interface CachedPlan {
  plan: UserPlan;
  cachedAt: number;
}

const planCache = new Map<string, CachedPlan>();

if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [uid, entry] of planCache.entries()) {
        if (now - entry.cachedAt > PLAN_CACHE_TTL_MS) {
          planCache.delete(uid);
        }
      }
    },
    30 * 60 * 1000,
  );
}

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getNextMonthResetDate(): string {
  const now = new Date();
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );
  return next.toISOString();
}

async function resolveUserPlanUncached(uid: string): Promise<UserPlan> {
  try {
    const userSnap = await adminDb.doc(`users/${uid}`).get();
    const workspaceId = userSnap.exists ? userSnap.data()?.workspaceId : null;

    if (!workspaceId) {
      return { isFree: true };
    }

    const workspaceSnap = await adminDb.doc(`workspaces/${workspaceId}`).get();
    const plan = workspaceSnap.exists
      ? workspaceSnap.data()?.billing?.plan
      : null;

    const isFree = !plan || plan === "starter";
    return { isFree };
  } catch (err) {
    console.error("Failed to resolve user plan, defaulting to free:", err);
    return { isFree: true };
  }
}

export async function resolveUserPlan(uid: string): Promise<UserPlan> {
  const cached = planCache.get(uid);
  const now = Date.now();

  if (cached && now - cached.cachedAt < PLAN_CACHE_TTL_MS) {
    return cached.plan;
  }

  const plan = await resolveUserPlanUncached(uid);
  planCache.set(uid, { plan, cachedAt: now });
  return plan;
}

export function invalidateUserPlanCache(uid: string): void {
  planCache.delete(uid);
}

// Fast read-only quota check. Returns whether the user can proceed.
//
// Race-condition tradeoff: this can briefly report "under limit" when
// async increments from concurrent requests haven't landed yet.
// Accepted: quota is a soft cap, not a payment gate.
export async function checkAiQuota(uid: string): Promise<QuotaCheckOutcome> {
  const { isFree } = await resolveUserPlan(uid);
  const limit = isFree ? FREE_LIMIT : PAID_LIMIT;
  const monthKey = getCurrentMonthKey();
  const quotaRef = adminDb.doc(`users/${uid}/aiQuotas/${monthKey}`);

  const snap = await quotaRef.get();
  const used = snap.exists ? (snap.data()?.count ?? 0) : 0;

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      resetDate: getNextMonthResetDate(),
      quotaType: "monthly",
      isFree,
    };
  }

  return { allowed: true, isFree, limit };
}

// Fire-and-forget increment. Caller does NOT await. Errors are logged
// but not propagated — quota miscount is acceptable per product decision.
export function incrementAiQuotaAsync(uid: string): void {
  const monthKey = getCurrentMonthKey();
  const quotaRef = adminDb.doc(`users/${uid}/aiQuotas/${monthKey}`);

  quotaRef
    .get()
    .then((snap) =>
      quotaRef.set(
        {
          count: FieldValue.increment(1),
          lastUsedAt: FieldValue.serverTimestamp(),
          ...(snap.exists ? {} : { firstUsedAt: FieldValue.serverTimestamp() }),
        },
        { merge: true },
      ),
    )
    .catch((err) => {
      console.warn("AI quota increment failed:", err);
    });
}
