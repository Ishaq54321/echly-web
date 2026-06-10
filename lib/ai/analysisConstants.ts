/**
 * Shared AI-Analysis constants — client- AND server-safe (no firebase-admin /
 * openai imports, so this is importable from both the analyze route and the
 * dashboard client).
 *
 * PENDING_STALE_MS is the contract that makes the stuck-state recovery work: the
 * server treats a "pending" lock older than this as reclaimable
 * (claimAnalysisLock), and the client re-fires the analysis when it sees a
 * "pending" doc older than this. Both halves MUST use the same value or they
 * deadlock — a fresh pending the client won't re-fire vs. a stale pending the
 * server won't reclaim. Keep them reading from here.
 */

/** A "pending" lock older than this is treated as stale (a crashed prior run). */
export const PENDING_STALE_MS = 2 * 60 * 1000; // 2m
