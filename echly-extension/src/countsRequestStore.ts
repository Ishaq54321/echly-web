/**
 * Always executes a fresh counts request in the extension.
 * @param fetchResponse - e.g. () => apiFetch(fullUrl) or () => fetchFn(relativePath)
 */
export async function fetchCountsDedup(
  _sessionId: string,
  fetchResponse: () => Promise<Response>
): Promise<unknown> {
  const res = await fetchResponse();
  if (!res.ok) {
    throw new Error("API_ERROR_" + res.status);
  }
  return await res.json();
}
