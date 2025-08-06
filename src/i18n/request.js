// src/i18n/request.js
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Define supported locales and default
  const supportedLocales = ['en', 'de'];
  const defaultLocale = 'en';

  // Ensure locale is valid; fallback to default if undefined or invalid
  const validLocale = supportedLocales.includes(locale) ? locale : defaultLocale;

  // Load translation messages
  const messages = (await import(`@/i18n/${validLocale}.json`)).default;

  return {
    locale: validLocale,
    messages,
  };
});