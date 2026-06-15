// PERF (Tier 1, Batch 0.3) — dev-only critical-path timing markers.
//
// These instrument the three serialized segments the performance audit
// identified on the dashboard's cold load:
//
//   Segment 1  auth→claims      onAuthStateChanged fires → claimsReady set
//                               (the POST /api/users + token-refresh cost)
//   Segment 2  claims→sessions  claimsReady → first GET /api/sessions response
//                               (content latency)
//   Segment 3  sessions→painted sessions arrive → list painted
//                               (render cost — drops after virtualization)
//
// Everything here is GATED behind the existing ECHLY_PERF flag and the dev
// build, mirroring lib/authFetch.ts's echlyPerfEnabled(): it no-ops entirely in
// production AND in dev unless `localStorage.ECHLY_PERF === "1"`. There are no
// always-on logs — the functions short-circuit before touching the console.
//
// Usage: markStart("auth→claims") once, then markEnd("auth→claims") at the end
// of the segment. markEnd logs `[PERF] <label>: <delta>ms` and clears the mark,
// so a second end without a fresh start is a silent no-op (won't double-log).

type PerfLabel = "auth→claims" | "claims→sessions" | "sessions→painted";

function perfEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    typeof localStorage !== "undefined" &&
    typeof performance !== "undefined" &&
    localStorage.getItem("ECHLY_PERF") === "1"
  );
}

// Module-level start times. Per-label so the three segments don't clobber each
// other. Survives across the component remounts that happen during boot.
const startByLabel = new Map<PerfLabel, number>();

/** Record the start of a segment. No-op unless ECHLY_PERF is enabled in dev. */
export function markStart(label: PerfLabel): void {
  if (!perfEnabled()) return;
  // Only the FIRST start per label wins until its matching end — the segments
  // are one-shot cold-load measurements, so a later start (e.g. a provider
  // remount) must not reset an in-flight measurement.
  if (startByLabel.has(label)) return;
  startByLabel.set(label, performance.now());
}

/**
 * Record the end of a segment and log `[PERF] <label>: <delta>ms`. No-op unless
 * ECHLY_PERF is enabled in dev and a matching markStart ran. Clears the mark so
 * repeated ends don't re-log.
 */
export function markEnd(label: PerfLabel): void {
  if (!perfEnabled()) return;
  const start = startByLabel.get(label);
  if (start === undefined) return;
  startByLabel.delete(label);
  const delta = Math.round(performance.now() - start);
  console.log(`[PERF] ${label}: ${delta}ms`);
}
