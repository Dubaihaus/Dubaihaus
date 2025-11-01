import './globals.css';
import {headers} from 'next/headers';
import {NextIntlClientProvider} from 'next-intl';
import Navbar from '@/components/navbar';
import { Providers } from './providers';

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
        
        {/* Provide locale and messages to the app */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
         <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
