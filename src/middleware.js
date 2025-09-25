// /src/middleware.js
import { NextResponse } from "next/server";
// import { withAuth } from "next-auth/middleware";

const LOCALES = ["en", "de"];
const DEFAULT_LOCALE = "en";

// Wrap withAuth to protect /admin (except /admin/login)
export default withAuth(
  async function middleware(request) {
    const { pathname } = request.nextUrl;

    // --- Locale logic for non-static/non-API requests ---
    if (!/(\.\w+$|_next|api)/i.test(pathname)) {
      const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
      const headerLang = request.headers.get("accept-language")?.split(",")[0];
      const browserLocale = headerLang?.split("-")[0];

      const locale = LOCALES.includes(cookieLocale)
        ? cookieLocale
        : LOCALES.includes(browserLocale)
        ? browserLocale
        : DEFAULT_LOCALE;

      const headers = new Headers(request.headers);
      headers.set("x-locale", locale);

      const response = NextResponse.next({ request: { headers } });

      if (!cookieLocale) {
        response.cookies.set("NEXT_LOCALE", locale, {
          path: "/",
          maxAge: 365 * 24 * 60 * 60, // 1 year
          sameSite: "lax",
        });
      }

      return response;
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only allow access to admin pages if user is ADMIN
      async authorized({ token }) {
        return !!token && token.role === "ADMIN";
      },
    },
    pages: {
      signIn: "/admin/login", // Redirect unauthorized users
    },
  }
);

// Only protect /admin routes except /admin/login
export const config = {
  matcher: ["/admin((?!/login).*)"],
};
