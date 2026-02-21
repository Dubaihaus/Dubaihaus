import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  const h = await headers();
  const headerLocale = h.get('x-next-locale');

  // Define supported locales and default
  const supportedLocales = ['en', 'de'];
  const defaultLocale = 'en';

  // Read locale from our custom middleware header first, fallback to next-intl built-in, then default
  const resolvedLocale = headerLocale || requestLocale || defaultLocale;
  const validLocale = supportedLocales.includes(resolvedLocale) ? resolvedLocale : defaultLocale;

  // Load translation messages
  const messages = (await import(`@/i18n/${validLocale}.json`)).default;

  return {
    locale: validLocale,
    messages,
  };
});