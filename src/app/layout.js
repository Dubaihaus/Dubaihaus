// src/app/layout.js
import './globals.css';
import { headers } from 'next/headers';
import "react-phone-number-input/style.css";
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

export const metadata = {
  metadataBase: new URL('https://www.dubaihaus.com'),
   verification: {

  },
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const headerLocale = headersList.get('x-next-locale');
    const hideChrome = headersList.get("x-hide-chrome") === "1";

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
          {!hideChrome && <Navbar />}
            {children}
            {!hideChrome && <Footer />}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
