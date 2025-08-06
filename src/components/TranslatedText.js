// src/components/TranslatedText.js
'use client';
import { useTranslations } from 'next-intl';

export default function TranslatedText({ 
  namespace, 
  translationKey,
  components = [],
  values = {}
}) {
  const t = useTranslations(namespace);
  
  if (!translationKey) return null;
  
  // Handle interpolated values
  if (Object.keys(values).length > 0) {
    return t.rich(translationKey, { ...values, ...components });
  }
  
  return t(translationKey);
}