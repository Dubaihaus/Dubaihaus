// src/lib/locale-client.js
export function getClientLocale() {
  if (typeof window === 'undefined') return 'en';
  const match = document.cookie.match(/NEXT_LOCALE=(\w+)/);
  return match ? match[1] : 'en';
}
