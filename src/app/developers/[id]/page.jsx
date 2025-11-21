// src/app/developers/[id]/page.jsx

import { getDeveloperById, searchProperties } from "@/lib/reellyApi";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";

export async function generateMetadata({ params }) {
  const developer = await getDeveloperById(params.id);

  if (!developer) {
    return {
      title: "Developer not found | DubaiHaus",
    };
  }

  const baseTitle = `${developer.name} Properties in Dubai | DubaiHaus`;
  const description = `Explore off-plan and ready properties by ${developer.name} in Dubai and Abu Dhabi on DubaiHaus.`;

  return {
    title: baseTitle,
    description,
    openGraph: {
      title: baseTitle,
      description,
      type: "website",
    },
  };
}

export default async function DeveloperDetailPage({ params, searchParams }) {
  const developerId = params.id;
  const page = Number(searchParams?.page || 1);

  const developer = await getDeveloperById(developerId);

  if (!developer) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)] text-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <p className="text-xs text-slate-500">
            <Link href="/developers" className="text-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)]">
              ← Back to all developers
            </Link>
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Developer not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t find this developer. It may have been removed or is not available yet.
          </p>
        </div>
      </main>
    );
  }

  const properties = await searchProperties({
    page,
    pageSize: 12,
    developer: developerId,
    pricedOnly: true,
    includeAllData: false,
  });

  const items = properties?.results || [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)] text-slate-900">
      {/* Hero */}
      <section className="border-b border-sky-100/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-10 pt-16 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4 sm:flex-1">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.15)]">
              {developer.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={developer.logoUrl}
                  alt={developer.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-base font-semibold text-[var(--color-brand-sky)]">
                  {String(developer.name || "NA").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-sky-600/80">
                Developer profile
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                {developer.name}
              </h1>
              {developer.website && (
                <a
                  href={developer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex text-xs text-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)]"
                >
                  Visit website ↗
                </a>
              )}
            </div>
          </div>

          <div className="sm:text-right sm:flex-1">
            <p className="text-xs text-slate-500">
              Showing off-plan & ready projects from this developer.
            </p>
            <p className="mt-2 text-xs">
              <Link
                href="/developers"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)]"
              >
                ← Back to all developers
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Properties list */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Found{" "}
            <span className="font-semibold text-[var(--color-brand-sky)]">
              {properties?.total ?? items.length}
            </span>{" "}
            {items.length === 1 ? "property" : "properties"}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
            No properties found for this developer yet. Please check back soon or
            explore other developers.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((project, index) => (
              <PropertyCard
                key={project.id}
                property={project}
                currency="AED"
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
