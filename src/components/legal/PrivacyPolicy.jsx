// components/legal/PrivacyPolicy.jsx
import LegalDoc from './_shared/LegalDoc';

export default function PrivacyPolicy({ lang = 'en' }) {
  const src = lang === 'de'
    ? '/legal/privacy-de.html'
    : '/legal/privacy-en.html';

  return (
    <LegalDoc
      src={src}
      title={lang === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
      type="privacy"
      lang={lang}
    />
  );
}