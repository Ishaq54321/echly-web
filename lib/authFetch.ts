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
  const headers = new Headers(init.headers || {});

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
      credentials: "include",
      signal: signal ?? restInit.signal,
    });
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
