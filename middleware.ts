import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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
  '/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all dashboard routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  
  // Protect admin routes (basic auth check)
  // Admin role check will be done at layout level (server component)
  // because we need to query database for role
  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};