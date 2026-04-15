/**
 * Simple in-memory rate limiter.
 * Cocok untuk single-instance deployment (Vercel serverless per-function instance).
 * Setiap function instance memiliki memory sendiri, sehingga limit bersifat
 * per-instance — masih efektif untuk mencegah abuse dari satu user,
 * tapi tidak 100% akurat di multi-instance environment.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key     Unique key (misal: `payment-charge:userId`)
 * @param limit   Max requests yang diizinkan dalam window
 * @param windowMs Durasi window dalam milidetik
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    // Window baru
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
