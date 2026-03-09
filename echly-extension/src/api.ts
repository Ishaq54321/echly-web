/**
 * API client for production backend.
 * Automatically attaches Authorization: Bearer <firebase-id-token> to every request.
 */
import { ECHLY_DEBUG } from "../../lib/utils/logger";
import { auth } from "./firebase";

const API_BASE = "http://localhost:3000";
if (ECHLY_DEBUG) console.log("[EXTENSION] Using API_BASE:", API_BASE);

export { API_BASE };

export type ApiFetchOptions = RequestInit & {
  /** If true, do not attach Authorization header (e.g. public endpoints). Default false. */
  skipAuth?: boolean;
};

/**
 * Fetch helper that:
 * - Calls API_BASE (e.g. http://localhost:3000 for debugging)
 * - Attaches Authorization: Bearer <firebase-id-token> from auth.currentUser.getIdToken()
 * - Throws if not logged in (unless skipAuth: true)
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

  if (!skipAuth) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Not signed in. Sign in with Google to use this feature.");
    }
    const token = await user.getIdToken();
    headersRecord["Authorization"] = `Bearer ${token}`;
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  return fetch(url, {
    ...rest,
    headers: headersRecord,
  });
}
