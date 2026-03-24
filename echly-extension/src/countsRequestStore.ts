const pendingRequests: Record<string, Promise<unknown>> = {};

export function getPendingRequest(sessionId: string) {
  return pendingRequests[sessionId] || null;
}

export function setPendingRequest(sessionId: string, promise: Promise<unknown>) {
  pendingRequests[sessionId] = promise;
}

export function clearPendingRequest(sessionId: string) {
  delete pendingRequests[sessionId];
}

/**
 * In-flight dedup for counts in the extension (separate JS context from the web app).
 * @param fetchResponse - e.g. () => apiFetch(fullUrl) or () => fetchFn(relativePath)
 */
export async function fetchCountsDedup(
  sessionId: string,
  fetchResponse: () => Promise<Response>
): Promise<unknown> {
  const existing = getPendingRequest(sessionId);
  if (existing) {
    return existing;
  }
  const promise = (async () => {
    try {
      const res = await fetchResponse();
      if (!res.ok) {
        throw new Error("API_ERROR_" + res.status);
      }
      return await res.json();
    } finally {
      clearPendingRequest(sessionId);
    }
  })();
  setPendingRequest(sessionId, promise);
  return promise;
}
