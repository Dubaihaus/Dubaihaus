// src/app/developers/page.jsx
import { listDevelopers } from "@/lib/reellyApi";
import DevelopersHero from "@/components/developers/DevelopersHero";
import DevelopersGrid from "@/components/developers/DevelopersGrid";

export const metadata = {
  title: "UAE Property Developers | DubaiHaus",
  description:
    "Explore top real estate developers in Dubai and Abu Dhabi. Discover projects from Emaar, Damac, Sobha, Aldar and more on DubaiHaus.",
  openGraph: {
    title: "Dubai Property Developers | DubaiHaus",
    description:
      "Browse leading property developers and their projects in Dubai and Abu Dhabi.",
    type: "website",
  },
};

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
