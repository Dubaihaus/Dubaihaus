// src/components/LocaleSwitcher.js
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';
import { useLocale } from 'next-intl';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLocale = (locale) => {
    setCookie('NEXT_LOCALE', locale, { 
      path: '/', 
      maxAge: 365 * 24 * 60 * 60 
    });
    router.refresh(); // Important: Triggers server re-render
  };

  return (
    <div className="flex gap-2">
      <button
        className={currentLocale === 'en' ? 'font-bold' : 'opacity-70'}
        onClick={() => switchLocale('en')}
      >
        EN
      </button>
      <span>|</span>
      <button
        className={currentLocale === 'de' ? 'font-bold' : 'opacity-70'}
        onClick={() => switchLocale('de')}
      >
        DE
      </button>
    </div>
  );
}