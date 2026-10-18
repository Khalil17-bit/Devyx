import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for:
  // - /api routes
  // - /admin routes (CMS rendered strictly in English LTR)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - Static files (e.g. /favicon.ico, /images/*, etc.)
  matcher: [
    "/",
    "/(ar|fr|en)/:path*",
    "/((?!api|_next|_vercel|admin|.*\\..*).*)",
  ],
};
