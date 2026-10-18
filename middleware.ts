import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Administrative Control Room Route Guard
  if (pathname.startsWith("/admin")) {
    const devSession = req.cookies.get("devyx_dev_admin_session")?.value;
    const hasSupabaseAuthToken = req.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

    const isAuthenticated = devSession === "authenticated" || hasSupabaseAuthToken;

    if (pathname === "/admin/login") {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Public Trilingual Internationalization Routes
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/",
    "/(ar|fr|en)/:path*",
    "/admin/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
