// src/components/LocaleSwitcher.js (updated)
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLocale = (locale) => {
    if (locale === currentLocale) return;
    
    const parts = pathname.split('/');
    let newPath;

    if (['en', 'de'].includes(parts[1])) {
      parts[1] = locale;
      newPath = parts.join('/') || '/';
    } else {
      parts.splice(1, 0, locale);
      newPath = parts.join('/') || '/';
    }

    // Force full page reload to trigger middleware
    window.location.href = newPath;
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