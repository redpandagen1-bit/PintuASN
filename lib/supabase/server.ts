import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

// ✅ Cache client (service role, TANPA cookies/headers).
// Aman dipakai di dalam unstable_cache() karena tidak menyentuh request scope.
let _cacheClient: ReturnType<typeof createSupabaseClient> | null = null;
export function createCacheClient() {
  if (_cacheClient) return _cacheClient;
  _cacheClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return _cacheClient;
}

// ✅ Regular client (dengan RLS) - token di-resolve sekali di luar fetch callback
export async function createClient() {
  const cookieStore = await cookies();
  const clerkToken = await (await auth()).getToken();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore - called from Server Component
          }
        },
      },
      global: {
        fetch(url, options = {}) {
          const headers = new Headers(options?.headers);
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }
          return fetch(url, { ...options, headers });
        },
      },
    }
  );
}

// ✅ Admin client (bypass RLS) — pakai createClient langsung, tidak perlu cookies
export async function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

// lib/supabase/server.ts — tambahkan fungsi ini

export function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}