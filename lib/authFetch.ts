import { auth } from "@/lib/firebase";

// PERF R-014: guard behind NODE_ENV so localStorage is never read in production
// builds — eliminates a synchronous localStorage read on every authFetch call.
function echlyPerfEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    typeof localStorage !== "undefined" &&
    localStorage.getItem("ECHLY_PERF") === "1"
  );
}

// Phase 28.X — in-memory ID token cache. Firebase ID tokens last 60 min; the
// SDK may do a network refresh to Google's token endpoint near expiry or under
// certain conditions, adding ~0.5–2s to the critical path of every mutation.
// Caching for 55 min keeps the common path free of that round-trip while
// staying safely inside the token's validity window. Cleared on 401/403 (the
// retry path force-refreshes) and on sign-out via clearAuthTokenCache().
let cachedToken: string | null = null;
let cachedTokenExpiry = 0; // epoch ms; token is reused while now < this
const TOKEN_CACHE_DURATION_MS = 55 * 60 * 1000; // 55 min (tokens last 60)

async function getIdTokenFresh(
  user: { getIdToken(): Promise<string> }
): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry) {
    return cachedToken;
  }
  const token = await user.getIdToken();
  cachedToken = token;
  cachedTokenExpiry = now + TOKEN_CACHE_DURATION_MS;
  return token;
}

export function clearAuthTokenCache(): void {
  cachedToken = null;
  cachedTokenExpiry = 0;
}

/** Bearer token for non-fetch callers (e.g. XHR upload). Uses the same refresh behavior as authFetch. */
export async function getFirebaseBearerToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return getIdTokenFresh(user);
}

/** In extension context, set window.__ECHLY_API_BASE__ so requests use the API origin. */
function resolveInput(input: RequestInfo | URL): RequestInfo | URL {
  const base =
    typeof window !== "undefined" &&
    (window as unknown as { __ECHLY_API_BASE__?: string }).__ECHLY_API_BASE__;
  if (!base) return input;
  const path =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.pathname + input.search
        : input instanceof Request
          ? input.url
          : String(input);
  return path.startsWith("http") ? input : base + path;
}

const DEFAULT_TIMEOUT_MS = 25000;

export type AuthFetchInit = RequestInit & {
  /** Abort request after this many ms. Default 15s when set. */
  timeout?: number;
};

export async function authFetch(
  input: RequestInfo | URL,
  init: AuthFetchInit = {}
): Promise<Response | null> {
  const user = auth.currentUser;

  const perf = echlyPerfEnabled();
  const clientStart = perf ? performance.now() : 0;
  if (perf) {
    console.log("[ECHLY_PERF] CLIENT authFetch start", clientStart);
  }

  const headers = new Headers(init.headers || {});

  let tokenMs = 0;
  if (user) {
    if (perf) {
      console.log("[ECHLY_PERF] TOKEN START");
    }
    const tokenStart = perf ? performance.now() : 0;
    const token = await getIdTokenFresh(user);
    tokenMs = perf ? performance.now() - tokenStart : 0;
    if (perf) {
      console.log("[ECHLY_PERF] TOKEN END", tokenMs.toFixed(1), "ms");
    }
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    return null;
  }

  const timeoutMs = init.timeout !== undefined ? init.timeout : DEFAULT_TIMEOUT_MS;
  const { timeout: _t, ...restInit } = init;
  let signal = restInit.signal;
  let controller: AbortController | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  if (timeoutMs > 0) {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      console.warn("[authFetch] Request exceeded timeout threshold:", timeoutMs, "ms");
      controller!.abort();
    }, timeoutMs);
    signal = restInit.signal
      ? (() => {
          const combined = new AbortController();
          restInit.signal?.addEventListener("abort", () => {
            clearTimeout(timeoutId!);
            combined.abort();
          });
          controller!.signal.addEventListener("abort", () => combined.abort());
          return combined.signal;
        })()
      : controller.signal;
  }

  let retried = false;
  try {
    const netStart = perf ? performance.now() : 0;
    if (perf) console.log("[ECHLY_PERF] NETWORK START (fetch → response)");
    let res = await fetch(resolveInput(input), {
      ...restInit,
      headers,
      cache: "no-store",
      signal: signal ?? restInit.signal,
    });
    if (perf) {
      const networkMs = performance.now() - netStart;
      const totalMs = performance.now() - clientStart;
      console.log("[ECHLY_PERF] NETWORK END", networkMs.toFixed(1), "ms");
      console.log(
        "[ECHLY_PERF] authFetch summary — CLIENT TOTAL:",
        totalMs.toFixed(1),
        "ms | TOKEN:",
        tokenMs.toFixed(1),
        "ms | NETWORK:",
        networkMs.toFixed(1),
        "ms (API time = server logs: [Resolve] Total API)"
      );
    }
    if ((res.status === 401 || res.status === 403) && !retried && user) {
      retried = true;
      try {
        // The cached token was rejected — drop it so no later call reuses
        // it, then force-refresh and re-prime the cache with the new token.
        clearAuthTokenCache();
        const freshToken = await user.getIdToken(true);
        cachedToken = freshToken;
        cachedTokenExpiry = Date.now() + TOKEN_CACHE_DURATION_MS;
        const retryHeaders = new Headers(restInit.headers || {});
        retryHeaders.set("Authorization", `Bearer ${freshToken}`);
        res = await fetch(resolveInput(input), { ...restInit, headers: retryHeaders, cache: "no-store", signal: signal ?? restInit.signal });
      } catch {}
    }
    if (timeoutId) clearTimeout(timeoutId);
    // 403 responses with "Workspace suspended" message are no longer redirected from here.
    // WorkspaceSuspendedGuard (mounted at the app layout root) renders a top banner when
    // the workspace status indicates suspension. Background fetches that 403 with this
    // reason simply fail silently — callers handle the failure as a normal failed response.
    // (The previous redirect here caused remount loops via background fetches.)
    if (res.status === 403 && typeof window !== "undefined") {
      res
        .clone()
        .json()
        .then(
          async (
            data: {
              error?: { code?: string; message?: string };
              data?: { reason?: string } | null;
            }
          ) => {
            if (
              data?.error?.code === "FORBIDDEN" &&
              (data?.data?.reason === "WORKSPACE_ACCESS_REVOKED" ||
                data?.error?.message === "WORKSPACE_ACCESS_REVOKED")
            ) {
              try {
                const { getAuth, signOut } = await import("firebase/auth");
                await signOut(getAuth());
              } catch {
                /* sign-out can fail silently; proceed with redirect */
              }
              window.location.href = "/login?reason=workspace_access_revoked";
            }
          }
        )
        .catch(() => {});
    }
    return res;
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError" && controller?.signal.aborted) {
      throw new Error("Request timed out");
    }
    throw err;
  }
}
