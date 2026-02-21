import AreasPageClient from "@/components/areas/AreasPageClient";
import { generateStandardMetadata } from '@/lib/seo';

import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations({ namespace: 'seo.areas' });
  return generateStandardMetadata({
    pathname: 'areas',
    title: t('title'),
    description: t('description'),
  });
}

export default function AreasPage() {
  return (
    <>
      <AreasPageClient />
    </>
  );
}