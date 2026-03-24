/**
 * API client for extension. Proxies all requests through background (echly-api).
 * Background attaches Authorization: Bearer <extensionToken> from POST /api/extension/session.
 */
import { ECHLY_DEBUG } from "../../lib/utils/logger";
import { API_BASE } from "../config";

if (ECHLY_DEBUG) console.log("[EXTENSION] Using API_BASE:", API_BASE);

export { API_BASE };

/** Enforce HTTP safety before reading bodies; use at call sites (not all routes use res.ok === true semantics). */
export function throwIfHttpError(res: Response, context?: string): void {
  if (!res.ok) {
    const suffix = context ? ` ${context}` : "";
    throw new Error("API_ERROR_" + res.status + suffix);
  }
}

export type ApiFetchOptions = RequestInit & {
  /** If true, do not attach Authorization header (e.g. public endpoints). Default false. */
  skipAuth?: boolean;
};

function hasHeaderCaseInsensitive(headers: Record<string, string>, headerName: string): boolean {
  const target = headerName.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === target);
}

function omitHeaderCaseInsensitive(headers: Record<string, string>, headerName: string): Record<string, string> {
  const target = headerName.toLowerCase();
  return Object.fromEntries(
    Object.entries(headers).filter(([key]) => key.toLowerCase() !== target)
  );
}

/**
 * Fetch helper: sends request to background via echly-api message.
 * Background adds Bearer token. No Firebase.
 */
export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const headersRecord: Record<string, string> =
    headers instanceof Headers
      ? Object.fromEntries(headers)
      : Array.isArray(headers)
        ? Object.fromEntries(headers)
        : { ...headers };

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const method = (rest.method as string) || "GET";
  const body = rest.body ?? null;
  const isFormDataBody = typeof FormData !== "undefined" && body instanceof FormData;

  // FormData must bypass message-based body transformations so browser can set multipart boundary.
  if (isFormDataBody) {
    const token = skipAuth
      ? null
      : await new Promise<string | null>((resolve) => {
          chrome.runtime.sendMessage(
            { type: "ECHLY_GET_EXTENSION_TOKEN" },
            (res: { token?: string | null } | undefined) => resolve(res?.token ?? null)
          );
        });

    const formHeaders = omitHeaderCaseInsensitive(headersRecord, "Content-Type");
    if (!skipAuth && token) {
      formHeaders.Authorization = `Bearer ${token}`;
    }

    /** FormData: return raw Response so callers can read error bodies on !ok (e.g. transcribe NO_SPEECH_DETECTED). */
    return fetch(url, {
      ...rest,
      method,
      body,
      credentials: "include",
      headers: formHeaders,
    });
  }

  // JSON fallback: set explicit content type only for non-FormData request bodies.
  if (body != null && !hasHeaderCaseInsensitive(headersRecord, "Content-Type")) {
    headersRecord["Content-Type"] = "application/json";
  }

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "echly-api", url, method, headers: headersRecord, body },
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
