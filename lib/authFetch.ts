import { auth } from "@/lib/firebase";

function echlyPerfEnabled(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof localStorage !== "undefined" &&
    localStorage.getItem("ECHLY_PERF") === "1"
  );
}

async function getIdTokenFresh(
  user: { getIdToken(): Promise<string>; getIdTokenResult(): Promise<{ expirationTime?: string }> }
): Promise<string> {
  const token = await user.getIdToken();
  await user.getIdTokenResult();
  return token;
}

export function clearAuthTokenCache(): void {
  // No-op: token cache removed.
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

  if (!user) {
    return null;
  }

  const perf = echlyPerfEnabled();
  const clientStart = perf ? performance.now() : 0;
  if (perf) {
    console.log("[ECHLY_PERF] CLIENT authFetch start", clientStart);
    console.log("[ECHLY_PERF] TOKEN START");
  }
  const tokenStart = perf ? performance.now() : 0;
  const token = await getIdTokenFresh(user);
  const tokenMs = perf ? performance.now() - tokenStart : 0;
  if (perf) {
    console.log("[ECHLY_PERF] TOKEN END", tokenMs.toFixed(1), "ms");
  }

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

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

  try {
    const netStart = perf ? performance.now() : 0;
    if (perf) console.log("[ECHLY_PERF] NETWORK START (fetch → response)");
    const res = await fetch(resolveInput(input), {
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
    if (timeoutId) clearTimeout(timeoutId);
    if (res.status === 403 && typeof window !== "undefined") {
      res
        .clone()
        .json()
        .then((data: { error?: string }) => {
          if (data?.error === "WORKSPACE_SUSPENDED") {
            window.location.href = "/workspace-suspended";
          }
        })
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
