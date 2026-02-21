import { listDevelopers } from "@/lib/reellyApi";
import DevelopersHero from "@/components/developers/DevelopersHero";
import DevelopersGrid from "@/components/developers/DevelopersGrid";
import { generateStandardMetadata } from '@/lib/seo';

import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations({ namespace: 'seo.developers' });
  return generateStandardMetadata({
    pathname: 'developers',
    title: t('title'),
    description: t('description'),
  });
}

export const dynamic = "force-dynamic";

export default async function DevelopersPage() {
  const developers = await listDevelopers({ limit: 200, offset: 0 });

  return (
    <main
      className="
        min-h-screen
        bg-[radial-gradient(circle_at_top,_white_0,_#F5F7FB_55%,_var(--color-brand-sky)_100%)]
        text-slate-900
      "
    >
      <DevelopersHero total={developers.length} />
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <DevelopersGrid initialDevelopers={developers} />
      </section>
    </main>
  );
}
