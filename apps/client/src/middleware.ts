// Temporarily disabled while fixing Clerk custom domain issue
// Will re-enable after creating new Clerk application
// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
// const isPublicRoute = createRouteMatcher([
//   '/',
//   '/sign-in(.*)',
//   '/sign-up(.*)',
//   '/products(.*)',
//   '/api/webhooks(.*)',
// ]);

// export default clerkMiddleware(async (auth, request) => {
//   // Protect all routes except public ones
//   if (!isPublicRoute(request)) {
//     await auth.protect();
//   }
// });

export default function middleware() {
  // Temporarily disabled - Clerk custom domain issue
  return;
}

export const config = {
  matcher: [],
  // matcher: [
  //   // Skip Next.js internals and all static files, unless found in search params
  //   '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  //   // Always run for API routes
  //   '/(api|trpc)(.*)',
  // ],
};