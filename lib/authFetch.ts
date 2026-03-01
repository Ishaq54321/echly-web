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

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await getCachedIdToken(user);

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(resolveInput(input), {
    ...init,
    headers,
  });
}
