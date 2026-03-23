/**
 * authFetch for content script: gets extension token from background and includes
 * Authorization: Bearer <token> on all API requests so /api/structure-feedback
 * and other authenticated endpoints pass requireAuth().
 */
import { ECHLY_DEBUG } from "../../lib/utils/logger";
import { API_BASE } from "../config";

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

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  try {
    const token = await new Promise<string | null>((resolve) => {
      chrome.runtime.sendMessage(
        { type: "ECHLY_GET_EXTENSION_TOKEN" },
        (res: { token?: string | null } | undefined) => resolve(res?.token ?? null)
      );
    });

    const url = getFullUrl(input);
    const headers: Record<string, string> =
      init.headers instanceof Headers
        ? Object.fromEntries(init.headers)
        : Array.isArray(init.headers)
          ? Object.fromEntries(init.headers)
          : (init.headers as Record<string, string>) ?? {};
    const body = init.body;
    const isFormDataBody = typeof FormData !== "undefined" && body instanceof FormData;

    if (!isFormDataBody && body != null) {
      const hasContentType = Object.keys(headers).some(
        (headerName) => headerName.toLowerCase() === "content-type"
      );
      if (!hasContentType) {
        headers["Content-Type"] = "application/json";
      }
    }

    if (isFormDataBody) {
      for (const key of Object.keys(headers)) {
        if (key.toLowerCase() === "content-type") delete headers[key];
      }
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch (err) {
    console.error("[ECHLY] API request failed", err);
    throw err;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : API_BASE + path;
  return authFetch(url, options);
}
