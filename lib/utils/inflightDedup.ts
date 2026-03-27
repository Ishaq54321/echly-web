const inFlightRequests = new Map<string, Promise<unknown>>();

export async function dedupedRequest<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  const promise = fn().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);

  return promise;
}
