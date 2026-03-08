import FAQSection from "@/components/FAQSection";
import { generateStandardMetadata } from '@/lib/seo';

import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations({ namespace: 'seo.faq' });
  return generateStandardMetadata({
    pathname: 'faq',
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
  });
}
export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <div className="pt-4 pb-4">
        <FAQSection />
      </div>
    </main>
  );
}
