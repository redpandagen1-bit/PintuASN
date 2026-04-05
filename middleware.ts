import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
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
]);

const isOnboarding = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Skip public routes
  if (isPublicRoute(req)) {
    return;
  }

  const { userId, getToken } = await auth();

  // /onboarding requires login but not auth.protect() (no redirect loop)
  if (isOnboarding(req)) {
    if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url));
    return;
  }

  // Protect dashboard + admin routes
  if (isProtectedRoute(req) || isAdminRoute(req)) {
    await auth.protect();
  }

  // Onboarding guard — only for logged-in users on non-public, non-admin routes
  if (userId && (isProtectedRoute(req))) {
    try {
      const token = await getToken();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}&select=full_name`,
        {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            Accept: 'application/json',
          },
        }
      );

      if (res.ok) {
        const rows: { full_name: string | null }[] = await res.json();
        const fullName = rows?.[0]?.full_name;
        if (!fullName || fullName.trim() === '') {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      }
    } catch {
      // If check fails, allow through — don't block the user
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};