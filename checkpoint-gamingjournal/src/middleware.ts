import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "./app/utils/auth";

// Routes that do not require authentication
const authRoutes = [
  "/auth/signin",
  "/auth/signup",
];

// Routes that require authentication
const loggedInRoutes = [
  "/dashboard",
  "/my-games",
  "/journal",
  "/stats",
  "/profile",
];

export const runtime = 'nodejs';

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathname);
  const isLoggedInRoute = loggedInRoutes.includes(pathname);

  console.log("🌍 Middleware triggered on:", request.nextUrl.pathname);

  // Fetch the session to check if the user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("Session:", session);
  console.log("Session:", session?.user?.email ?? "Not authenticated");

  // If the user is not authenticated
  if (!session) {
    // Allow access to authentication routes (e.g., signin, signup)
    if (isAuthRoute) {
      return NextResponse.next();
    }
    // Redirect unauthenticated users trying to access protected routes to the signin page
    if (isLoggedInRoute) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // If the user is authenticated
  if (session) {
    // Redirect authenticated users trying to access signin or signup routes to the dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Allow access to protected routes
    if (isLoggedInRoute) {
      return NextResponse.next();
    }
  }

  // Default: Allow access to other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-games/:path*",
    "/journal/:path*",
    "/stats/:path*",
    "/profile/:path*",
  ],
};