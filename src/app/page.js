// src/app/page.js
import { getTranslations } from 'next-intl/server';
import HomeClient from "@/components/dashboard/HomeClient";
import JsonLd from "@/components/seo/JsonLd";
import { getFilterOptions } from "@/lib/offplanFilters";
import { generateStandardMetadata, getOrganizationSchema, getWebSiteSchema } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const t = await getTranslations({ namespace: 'seo.home' });
  return generateStandardMetadata({
    pathname: '',
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
  });
}

export default async function Home() {
  const filterOptions = await getFilterOptions();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebSiteSchema()
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeClient filterOptions={filterOptions} />



    </>
  );
}
