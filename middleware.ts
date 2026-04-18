import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/blog(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/exam(.*)',
  '/profile(.*)',
  '/history(.*)',
  '/statistics(.*)',
  '/packages(.*)',
  '/roadmap(.*)',
  '/materi(.*)',
  '/beli-paket(.*)',
  '/pembayaran(.*)',
  '/daftar-tryout(.*)',
  '/events-promo(.*)',
]);

const isOnboarding = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // ── 1. Lewati semua public route ──────────────────────────────
  if (isPublicRoute(req)) {
    return;
  }

  const { userId, sessionId } = await auth();

  // ── 2. Onboarding butuh login tapi tidak pakai auth.protect() ─
  if (isOnboarding(req)) {
    if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url));
    return;
  }

  // ── 3. Paksa login untuk protected & admin routes ─────────────
  if (isProtectedRoute(req) || isAdminRoute(req)) {
    await auth.protect();
  }

  // ── 4. Single Active Session + Onboarding check ───────────────
  //
  // Hanya berjalan untuk:
  // - User yang sudah login (userId ada)
  // - Halaman protected atau admin (bukan API route)
  // - Bukan route onboarding itu sendiri (cegah redirect loop)
  //
  // Keduanya (session check + onboarding check) digabung dalam
  // SATU fetch ke Supabase agar tidak ada overhead performa.
  //
  // Safety rules yang mencegah false positive:
  // [A] Jika fetch gagal (network error, DB down) → allow through
  // [B] Jika profile tidak ditemukan (user baru) → allow through
  // [C] Jika active_session_id di DB masih NULL → allow through
  //     (webhook session.created mungkin belum fire / user lama)
  // [D] Hanya kick jika active_session_id ada DAN tidak cocok
  //     dengan sessionId dari Clerk
  // ─────────────────────────────────────────────────────────────

  const isApiRoute = req.nextUrl.pathname.startsWith('/api/');

  if (userId && (isProtectedRoute(req) || isAdminRoute(req)) && !isApiRoute) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      // Jika env tidak ada, skip check daripada salah block user
      if (!supabaseUrl || !serviceKey) {
        console.error('Middleware: Missing Supabase env vars, skipping session check');
        return;
      }

      const res = await fetch(
        // Satu query untuk dua keperluan: session check + onboarding check
        `${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}&select=onboarding_completed,active_session_id`,
        {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            Accept: 'application/json',
            // Cache-Control: no-store memastikan kita selalu dapat data terbaru
            // penting untuk session check yang harus real-time
            'Cache-Control': 'no-store',
          },
        }
      );

      // [A] Jika fetch gagal → allow through (jangan block user)
      if (!res.ok) {
        console.error('Middleware: Supabase fetch failed', res.status);
        return;
      }

      const rows: Array<{
        onboarding_completed: boolean;
        active_session_id: string | null;
      }> = await res.json();

      const profile = rows?.[0];

      // [B] Profile tidak ditemukan → allow through
      // Ini bisa terjadi jika user.created webhook sedang diproses
      if (!profile) {
        return;
      }

      // [D] Session check — hanya kick jika SEMUA kondisi terpenuhi:
      //   - active_session_id di DB sudah terisi (bukan NULL)
      //   - sessionId dari Clerk tersedia
      //   - keduanya tidak cocok
      //
      // [C] Jika active_session_id NULL → skip, allow through
      if (
        profile.active_session_id !== null &&
        profile.active_session_id !== undefined &&
        sessionId !== null &&
        sessionId !== undefined &&
        profile.active_session_id !== sessionId
      ) {
        console.warn('Middleware: Session mismatch detected, redirecting to sign-in', {
          userId,
          // Jangan log session ID di production untuk keamanan,
          // hapus baris di bawah ini jika sudah stable
          storedSession: profile.active_session_id?.slice(0, 8) + '...',
          currentSession: sessionId?.slice(0, 8) + '...',
        });

        const signInUrl = new URL('/sign-in', req.url);
        // Parameter ini bisa dipakai di halaman sign-in untuk
        // menampilkan pesan: "Akun Anda masuk dari perangkat lain"
        signInUrl.searchParams.set('reason', 'session_replaced');
        return NextResponse.redirect(signInUrl);
      }

      // Onboarding check — hanya untuk protected routes, bukan admin
      if (isProtectedRoute(req) && !profile.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
    } catch (error) {
      // [A] Jika ada exception apapun → allow through
      // Lebih baik user bisa akses daripada salah di-block
      console.error('Middleware: Unexpected error during checks, allowing through', error);
      return;
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};