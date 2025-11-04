// Auth removed - all routes are now public for easier deployment
// If you need auth later, you can re-enable Clerk middleware here

export default function middleware() {
  // No auth checks - all routes are public
  return;
}

export const config = {
  matcher: [
    // Skip all routes - no auth needed
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
