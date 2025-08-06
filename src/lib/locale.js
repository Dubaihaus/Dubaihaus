// src/lib/locale.js - Simplify to single implementation
import { cookies } from 'next/headers';

export async function getLocale() {
  const cookieStore = cookies();
  return cookieStore.get('NEXT_LOCALE')?.value || 'en';
}