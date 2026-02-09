import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define Route Matchers
const isAdminRoute = createRouteMatcher(["/admin(.*)"]); // Update this if your admin route is different
const isPublicRoute = createRouteMatcher(["/", "/products(.*)", "/about", "/contact","/sign-in(.*)", "/sign-up(.*)", "/api/webhooks/clerk(.*)", "/api/upload-image(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Fetch all auth data at once
  const { userId, redirectToSignIn, sessionClaims } = await auth();

  // 2. Protect Authenticated Routes
  // If the user is NOT signed in and the route is NOT public, redirect to sign-in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn();
  }

  // 3. Protect Admin Routes (New Logic)
  // If the user IS trying to access an admin route, but their role is NOT "admin", redirect to home
  if (
    isAdminRoute(req) &&
    sessionClaims?.metadata?.role !== "admin"
  ) {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }
});



export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};