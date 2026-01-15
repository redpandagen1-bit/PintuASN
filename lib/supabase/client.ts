import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@clerk/nextjs';

export function createClient() {
  const { getToken } = useAuth();
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        async fetch(url, options = {}) {
          const clerkToken = await getToken(); // ✅ BENAR - tanpa template
          const headers = new Headers(options?.headers);
          
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }
          
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}