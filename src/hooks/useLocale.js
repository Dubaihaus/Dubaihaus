// src/hooks/useLocale.js
'use client';

import { usePathname } from 'next/navigation';

const SUPPORTED_LOCALES = ['en', 'de'];

export function useLocale() {
  const pathname = usePathname() || '/';
  const segments = pathname.split('/');
  const maybeLocale = segments[1];

  return SUPPORTED_LOCALES.includes(maybeLocale) ? maybeLocale : 'en';
}