import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/reset-password",
  "/pricing",
  "/blog",
  "/help",
  "/legal",
  "/p/",
  "/api/auth",
  "/api/health",
] as const;

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }
  return PUBLIC_PATHS.some((prefix) => prefix !== "/" && pathname.startsWith(prefix));
}

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth?.user?.id;
  const pathname = req.nextUrl.pathname;

  if (!isLoggedIn && !isPublicPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/posts", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
