// src/app/contact/page.js
import { getTranslations } from 'next-intl/server';
import ContactSection from "@/components/ContactSection";
import AboutUsSection from "@/components/AboutUsSection";

export async function generateMetadata({ params }) {
  const t = await getTranslations('contact.metadata');
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(','),
    alternates: {
      canonical: "https://dubaihaus.com/contact",
    },
    openGraph: {
      title: t('og.title'),
      description: t('og.description'),
      url: "https://dubaihaus.com/contact",
      siteName: "DubaiHaus",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t('twitter.title'),
      description: t('twitter.description'),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
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