// src/app/layout.js
import './globals.css';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Providers } from './providers';

async function getMessages(locale) {
  try {
    return (await import(`@/i18n/${locale}.json`)).default;
  } catch {
    return (await import('@/i18n/en.json')).default;
  }
}

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const headerLocale = headersList.get('x-next-locale');

  let locale = headerLocale || 'en';
  if (!['en', 'de'].includes(locale)) {
    locale = 'en';
  }

  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        {/* key={locale} ensures a fresh provider for each locale */}
        <NextIntlClientProvider locale={locale} messages={messages} key={locale}>
          <Providers>
            <Navbar />
            {children}
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
