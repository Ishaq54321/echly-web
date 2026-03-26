type CacheEntry = {
  data?: {
    json: any;
    status: number;
    statusText: string;
    ok: boolean;
    url: string;
    headers: [string, string][];
  };
  timestamp: number;
  promise?: Promise<Response>;
};

const cache = new Map<string, CacheEntry>();

function responseLikeFromCached(entry: NonNullable<CacheEntry["data"]>): Response {
  const headers = new Headers(entry.headers);
  const jsonValue = entry.json;

  const resLike: Partial<Response> & {
    json: () => Promise<any>;
    clone: () => Response;
  } = {
    ok: entry.ok,
    status: entry.status,
    statusText: entry.statusText,
    url: entry.url,
    headers,
    json: async () => jsonValue,
    clone: () =>
      new Response(JSON.stringify(jsonValue), {
        status: entry.status,
        statusText: entry.statusText,
        headers,
      }),
  };

  return resLike as Response;
}

/** Default client TTL (seconds-scale); pagination should bypass via `bypassCache`. */
const DEFAULT_CLIENT_CACHE_TTL_MS = 4000;

export async function cachedFetch(
  key: string,
  fetcher: () => Promise<Response>,
  ttl = DEFAULT_CLIENT_CACHE_TTL_MS,
  bypassCache = false
): Promise<Response> {
  if (bypassCache) {
    return fetcher();
  }

  const now = Date.now();
  const existing = cache.get(key);

  // 1. Return cached data if fresh
  if (existing && now - existing.timestamp < ttl && existing.data) {
    console.log("[CLIENT CACHE] HIT", key);
    return responseLikeFromCached(existing.data);
  }

  // 2. If request already in-flight → reuse it
  if (existing?.promise) {
    console.log("[CLIENT CACHE] IN-FLIGHT", key);
    return existing.promise;
  }

  console.log("[CLIENT CACHE] MISS", key);

  const promise = (async () => {
    const res = await fetcher();
    const cloned = res.clone();
    const json = await cloned.json();
    const headers: [string, string][] = [];
    res.headers.forEach((value, name) => {
      headers.push([name, value]);
    });

    const data = {
      json,
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      url: res.url,
      headers,
    };

    cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    return responseLikeFromCached(data);
  })();

  cache.set(key, {
    timestamp: existing?.timestamp ?? 0,
    promise,
  });

  return promise;
}

