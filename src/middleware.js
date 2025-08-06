import { NextResponse } from 'next/server';

const LOCALES = ['en', 'de'];
const DEFAULT_LOCALE = 'en';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip static files and API routes
  if (/(\.\w+$|_next|api)/i.test(pathname)) {
    return NextResponse.next();
  }

  // Check existing cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  
  // Get browser preference
  const headerLang = request.headers.get('accept-language')?.split(',')[0];
  const browserLocale = headerLang?.split('-')[0];
  
  // Determine final locale
  const locale = LOCALES.includes(cookieLocale) 
    ? cookieLocale
    : LOCALES.includes(browserLocale)
    ? browserLocale
    : DEFAULT_LOCALE;

  // Clone request headers
  const headers = new Headers(request.headers);
  headers.set('x-locale', locale);

  const response = NextResponse.next({ request: { headers } });
  
  // Set cookie if not present
  if (!cookieLocale) {
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'lax'
    });
  }
  
  return response;
}