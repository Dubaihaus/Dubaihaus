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
  const headerStore = await headers();
  const locale = headerStore.get('x-locale') || 'en';
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* React Query provider MUST wrap anything that uses useQuery */}
          <Providers>
            <Navbar />
            {children}
            <Footer />   {/* now inside QueryClientProvider */}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
