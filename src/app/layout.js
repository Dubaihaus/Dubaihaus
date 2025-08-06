import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { headers } from 'next/headers';

async function getMessages(locale) {
  try {
    return (await import(`@/i18n/${locale}.json`)).default;
  } catch {
    return (await import('@/i18n/en.json')).default;
  }
}

export default async function RootLayout({ children }) {
  const headerStore =  await headers();
  const locale = headerStore.get('x-locale') || 'en'; // set by middleware
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
