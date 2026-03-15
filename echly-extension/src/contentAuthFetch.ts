/**
 * authFetch for content script: proxies requests through background (no Firebase in content).
 * Background adds Bearer token via ECHLY_GET_TOKEN / getValidToken().
 */
import { ECHLY_DEBUG } from "../../lib/utils/logger";

const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://echly-web.vercel.app";
if (ECHLY_DEBUG) console.log("[EXTENSION] Using API_BASE:", API_BASE);

export function clearAuthTokenCache(): void {
  // No-op: token cache lives in background.
}

function getFullUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input.startsWith("http") ? input : API_BASE + input;
  }
  if (input instanceof URL) return input.href;
  return input.url;
}

export function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
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
      { type: "echly-api", url, method, headers, body },
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

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : API_BASE + path;
  return authFetch(url, options);
}
