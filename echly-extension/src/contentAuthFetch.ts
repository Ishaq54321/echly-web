/**
 * authFetch for content script: proxies requests through background to avoid CORS.
 * Same interface as lib/authFetch so CaptureWidget works unchanged.
 */
import { auth } from "./firebase";

const API_BASE = "https://echly-web.vercel.app";

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

function getFullUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input.startsWith("http") ? input : API_BASE + input;
  }
  if (input instanceof URL) return input.href;
  return input.url;
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await getCachedIdToken(user);
  const url = getFullUrl(input);
  const method = (init.method || "GET") as string;
  const headers: Record<string, string> =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers)
      : Array.isArray(init.headers)
        ? Object.fromEntries(init.headers)
        : { ...(init.headers as Record<string, string>) };
  const body = init.body ?? null;

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: "echly-api",
        url,
        method,
        headers,
        body,
        token,
      },
      (response: { ok?: boolean; status?: number; headers?: Record<string, string>; body?: string } | undefined) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response) {
          reject(new Error("No response from background"));
          return;
        }
        const res = new Response(response.body ?? "", {
          status: response.status ?? 0,
          headers: response.headers ? new Headers(response.headers) : undefined,
        });
        resolve(res);
      }
    );
  });
}

/** Same as api.ts apiFetch; use in content for handleComplete etc. */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : API_BASE + path;
  return authFetch(url, options);
}
