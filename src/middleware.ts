import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define Route Matchers
const isAdminRoute = createRouteMatcher(["/admin(.*)"]); 
const isPublicRoute = createRouteMatcher([
  "/",
  "/products(.*)",
  "/about",
  "/contact",
  "/wishlist",
  "/cart(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/upload-image(.*)",
  "/api/products(.*)",
  "/api/search(.*)",    
  "/api/seed(.*)",
  "/api/wishlist(.*)",
  "/api/cart",
  "/api/cart/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn, sessionClaims } = await auth();

  // 2. Protect Authenticated Routes
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn();
  }

  // 3. Protect Admin Routes
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