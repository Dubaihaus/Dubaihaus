// components/legal/Terms.jsx
import LegalDoc from './_shared/LegalDoc';

export default function Terms({ lang = 'en' }) {
  const src = lang === 'de'
    ? '/legal/terms-de.html'
    : '/legal/terms-en.html';

  return (
    <LegalDoc
      src={src}
      title={lang === 'de' ? 'Allgemeine Nutzungsbedingungen' : 'Terms & Conditions'}
      type="terms"
      lang={lang}
    />
  );
}