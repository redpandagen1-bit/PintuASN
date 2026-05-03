/**
 * Distributed rate limiter berbasis Supabase.
 * Bekerja lintas semua Vercel serverless instances karena state disimpan
 * di database, bukan in-memory (yang terpisah per instance).
 *
 * Trade-off: sedikit lebih lambat (~1 DB round-trip) dibanding in-memory,
 * tapi akurat di lingkungan multi-instance seperti Vercel.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number;
}

/**
 * @param key      Unique key (mis: `payment-charge:userId`)
 * @param limit    Max requests dalam satu window
 * @param windowMs Durasi window dalam milidetik
 */
export async function rateLimit(
  key:      string,
  limit:    number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now         = Date.now();
  const windowStart = new Date(now - windowMs).toISOString();
  const resetAt     = now + windowMs;

  try {
    const { data } = await supabase
      .from('rate_limits')
      .select('count, window_start')
      .eq('key', key)
      .maybeSingle();

    // Tidak ada entri ATAU window sudah kedaluwarsa → reset
    if (!data || data.window_start < windowStart) {
      await supabase.from('rate_limits').upsert({
        key,
        count:        1,
        window_start: new Date(now).toISOString(),
      });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    // Dalam window yang sama — sudah melebihi limit
    if (data.count >= limit) {
      const existingReset = new Date(data.window_start).getTime() + windowMs;
      return { allowed: false, remaining: 0, resetAt: existingReset };
    }

    // Dalam window — masih boleh, increment
    await supabase
      .from('rate_limits')
      .update({ count: data.count + 1 })
      .eq('key', key);

    const existingReset = new Date(data.window_start).getTime() + windowMs;
    return { allowed: true, remaining: limit - (data.count + 1), resetAt: existingReset };

  } catch (err) {
    // Fail open: kalau DB error, tetap izinkan request agar pembayaran tidak
    // terblokir oleh masalah di rate limiter. Error di-log untuk monitoring.
    console.error('[rate-limit] DB error, failing open:', err);
    return { allowed: true, remaining: limit, resetAt };
  }
}
