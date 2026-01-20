// // src/middleware.js
// import { NextResponse } from 'next/server';
// // import { withAuth } from 'next-auth/middleware';

// const LOCALES = ['en', 'de'];
// const DEFAULT_LOCALE = 'en';
// const PUBLIC_FILE = /\.(.*)$/;

// function baseMiddleware(req) {
//   const { pathname } = req.nextUrl;

//   // Skip static files, Next internals and all /api routes
//   if (
//     pathname.startsWith('/_next') ||
//     pathname.startsWith('/api') ||
//     PUBLIC_FILE.test(pathname)
//   ) {
//     return NextResponse.next();
//   }

//   // ---- Locale handling with URL prefix (/en, /de) ----
//   const segments = pathname.split('/'); // ["", "en", "off-plan"]
//   const maybeLocale = segments[1];

//   const isSupportedLocale = LOCALES.includes(maybeLocale);

//   // If no locale prefix -> redirect to default (/en/...)
//   if (!isSupportedLocale) {
//     const url = req.nextUrl.clone();
//     url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
//     return NextResponse.redirect(url);
//   }

//   const locale = maybeLocale;

//   // Strip locale for internal routing
//   const internalPath = '/' + segments.slice(2).join('/');
//   const finalPath =
//     internalPath === '//' || internalPath === '/' ? '/' : internalPath;

//   const url = req.nextUrl.clone();
//   url.pathname = finalPath;

//   const res = NextResponse.rewrite(url);

//   // Persist locale in cookie
//   res.cookies.set('NEXT_LOCALE', locale, {
//     path: '/',
//     maxAge: 60 * 60 * 24 * 365, // 1 year
//     sameSite: 'lax'
//   });

//   // Pass locale to server components
//   res.headers.set('x-locale', locale);

//   return res;
// }

// // Wrap with next-auth to protect /admin
// export default withAuth(baseMiddleware, {
//   callbacks: {
//     authorized({ req, token }) {
//       const pathname = req.nextUrl.pathname;

//       // Login page is always allowed
//       const loginRegex = /^\/(en|de)\/admin\/login\/?$|^\/admin\/login\/?$/;
//       if (loginRegex.test(pathname)) return true;

//       // Admin routes (with or without locale prefix)
//       const adminRegex = /^\/(en|de)\/admin(\/|$)|^\/admin(\/|$)/;
//       const isAdminPath = adminRegex.test(pathname);

//       if (!isAdminPath) {
//         // Public route: always allowed
//         return true;
//       }

//       // Admin route: require ADMIN role
//       return !!token && token.role === 'ADMIN';
//     }
//   },
//   pages: {
//     signIn: '/admin/login' // will be auto-redirected to /en/admin/login by middleware
//   }
// });

// // Apply middleware almost everywhere (except static files)
// export const config = {
//   matcher: ['/((?!_next|.*\\..*).*)']
// };
// src/middleware.js
// src/middleware.js
// src/middleware.js
// src/middleware.js
import { NextResponse } from 'next/server';

const LOCALES = ['en', 'de'];
const DEFAULT_LOCALE = 'en';
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Skip static files, Next internals and ALL API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 0) Redirect www to non-www
  const { host } = req.nextUrl;
  if (host.startsWith('www.')) {
    const url = req.nextUrl.clone();
    url.hostname = host.replace('www.', '');
    return NextResponse.redirect(url, 308); // 308 Permanent Redirect
  }

  const segments = pathname.split('/'); // ["", "en", "off-plan"]
  const maybeLocale = segments[1];
  const isSupportedLocale = LOCALES.includes(maybeLocale);

  // 1) No locale in URL -> redirect to default locale
  if (!isSupportedLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 2) Has locale -> rewrite path internally and set cookie + request header
  const locale = maybeLocale;

  // Strip locale for internal routing
  const internalPath = '/' + segments.slice(2).join('/');
  const finalPath =
    internalPath === '//' || internalPath === '/' ? '/' : internalPath;

  const url = req.nextUrl.clone();
  url.pathname = finalPath;
  url.search = search; // keep query params

  // IMPORTANT: attach locale to the *request* that reaches RSC
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-next-locale', locale);

  const res = NextResponse.rewrite(url, {
    request: { headers: requestHeaders }
  });

  // Optional: cookie (nice for debugging / analytics)
  res.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  });

  return res;
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)']
};
