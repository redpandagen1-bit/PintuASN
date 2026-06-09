import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/blog(.*)',
  '/api/webhooks(.*)',
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
  '/materi(.*)',        // ← ditambahkan: ada di tree tapi tidak di sini
  '/beli-paket(.*)',    // ← ditambahkan
  '/daftar-tryout(.*)', // ← ditambahkan
  '/pembayaran(.*)',    // ← ditambahkan
]);

const isOnboarding = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId } = await auth();

  if (isOnboarding(req)) {
    if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url));
    return;
  }

  if (isProtectedRoute(req) || isAdminRoute(req)) {
    await auth.protect();
  }

  // Onboarding guard — hanya untuk protected routes, bukan admin.
  //
  // OPTIMASI PERFORMA: dulu middleware fetch ke Supabase di SETIAP navigasi
  // protected route (round-trip jaringan di jalur kritis tiap halaman).
  // Sekarang: pakai cookie `pa_onb` berisi userId. Jika cookie cocok dengan
  // userId saat ini → user sudah onboarding, langsung lewat TANPA fetch DB.
  // Cookie di-set sekali (navigasi pertama setelah onboarding) dan diikat ke
  // userId agar aman saat ganti akun di browser yang sama.
  if (userId && isProtectedRoute(req)) {
    const onbCookie = req.cookies.get('pa_onb')?.value;
    if (onbCookie === userId) {
      return; // sudah onboarding (terverifikasi) → tanpa fetch DB
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}&select=onboarding_completed`,
        {
          headers: {
            apikey:        serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            Accept:        'application/json',
          },
        }
      );

      if (res.ok) {
        const rows: { onboarding_completed: boolean }[] = await res.json();
        const done = rows?.[0]?.onboarding_completed;
        if (!done) {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
        // Sudah onboarding → set cookie agar navigasi berikutnya tak fetch DB lagi
        const resp = NextResponse.next();
        resp.cookies.set('pa_onb', userId, {
          httpOnly: true,
          secure:   process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path:     '/',
          maxAge:   60 * 60 * 24 * 365, // 1 tahun (status onboarding permanen)
        });
        return resp;
      }
    } catch {
      // Gagal check → biarkan lewat, jangan block user
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};