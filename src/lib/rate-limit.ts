// In-memory sliding-window limiter. Good enough for this deployment: a
// single "app" container per docker-compose.yml, not a multi-instance/edge
// deployment — so a per-process Map is actually shared across all requests
// that matter. If this app is ever scaled horizontally, swap the Map below
// for a shared store (Postgres table or Redis) keyed the same way.
interface Bucket {
  count: number;
  windowStart: number;
  lockedUntil: number | null;
}

const buckets = new Map<string, Bucket>();

// Lazy cleanup — avoid an unbounded Map for long-running processes without
// needing a setInterval timer running forever.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    const stale = (bucket.lockedUntil ?? bucket.windowStart) < now - 60_000;
    if (stale) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/**
 * @param key unique identifier for the thing being limited (e.g. `${ip}:${studentCode}`)
 * @param maxAttempts how many attempts are allowed per window before locking out
 * @param windowMs the sliding window size
 * @param lockoutMs how long to lock out once maxAttempts is exceeded
 */
export function checkRateLimit(
  key: string,
  { maxAttempts, windowMs, lockoutMs }: { maxAttempts: number; windowMs: number; lockoutMs: number },
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);

  if (bucket?.lockedUntil && bucket.lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000) };
  }

  if (!bucket || now - bucket.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now, lockedUntil: null });
    return { allowed: true };
  }

  bucket.count += 1;
  if (bucket.count > maxAttempts) {
    bucket.lockedUntil = now + lockoutMs;
    return { allowed: false, retryAfterSeconds: Math.ceil(lockoutMs / 1000) };
  }

  return { allowed: true };
}

// Called on a SUCCESSFUL login so a legitimate parent isn't left counting
// down a lockout window just because they mistyped the password twice
// before getting it right.
export function clearRateLimit(key: string) {
  buckets.delete(key);
}

export function clientIp(headers: Headers): string {
  // Behind Dokploy/Traefik the real client IP is the first hop in
  // x-forwarded-for. Falling back to a constant is deliberate: it still
  // rate-limits (just coarser, per-studentCode only) rather than throwing.
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
