/**
 * authFetch for content script: proxies requests through background (no Firebase in content).
 * Re-exports from content/contentAuth for backward compatibility.
 */
import { createApiClient } from "./content/contentAuth";
const client = createApiClient();
export const apiFetch = client.apiFetch;
export const authFetch = client.authFetch;
export const clearAuthTokenCache = client.clearAuthTokenCache;
