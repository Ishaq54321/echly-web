import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(input: {
  key: string;
  max: number;
  windowMs: number;
  now?: number;
}): { allowed: boolean; retryAfterSeconds: number } {
  const now = input.now ?? Date.now();
  const existing = buckets.get(input.key);
  if (!existing || now >= existing.resetAt) {
    buckets.set(input.key, { count: 1, resetAt: now + input.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count <= input.max) {
    buckets.set(input.key, existing);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return { allowed: false, retryAfterSeconds };
}

export function clientKeyFromRequest(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  return `${ip}:${ua}`;
}
