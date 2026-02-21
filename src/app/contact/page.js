import { getTranslations } from 'next-intl/server';
import ContactSection from "@/components/ContactSection";
import AboutUsSection from "@/components/AboutUsSection";
import { generateStandardMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const t = await getTranslations('contact.metadata');

  return generateStandardMetadata({
    pathname: 'contact',
    title: t('title'),
    description: t('description'),
  });
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <div className="pt-4 pb-10">
        <ContactSection />
        <AboutUsSection />
      </div>
    </main>
  );
}