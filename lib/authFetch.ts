import { auth } from "@/lib/firebase";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getCachedIdToken(user: { getIdToken(): Promise<string>; getIdTokenResult(): Promise<{ expirationTime?: string }> }): Promise<string> {
  const now = Date.now();

  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const token = await user.getIdToken();
  const result = await user.getIdTokenResult();

  cachedToken = token;
  tokenExpiry = result.expirationTime
    ? new Date(result.expirationTime).getTime() - 60000
    : now + 60000; // fallback 1 min

  return token;
}

export function clearAuthTokenCache(): void {
  cachedToken = null;
  tokenExpiry = null;
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
): Promise<Response> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await getCachedIdToken(user);

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
    const res = await fetch(resolveInput(input), {
      ...restInit,
      headers,
      signal: signal ?? restInit.signal,
    });
    if (timeoutId) clearTimeout(timeoutId);
    return res;
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError" && controller?.signal.aborted) {
      throw new Error("Request timed out");
    }
    throw err;
  }
}
