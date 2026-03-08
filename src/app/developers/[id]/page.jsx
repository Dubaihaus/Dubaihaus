import { getDeveloperById } from "@/lib/reellyApi";
import { getCachedProjects } from "@/lib/projectService";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { generateStandardMetadata, getBreadcrumbSchema } from '@/lib/seo';

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { id: developerId } = await params;
  const developer = await getDeveloperById(developerId);
  const t = await getTranslations({ namespace: 'seo.developerDetail' });

  if (!developer) {
    return { title: t('fallbackTitle') };
  }

  const whitelistedSlugs = ['emaar', 'damac', 'sobha', 'nakheel', 'aldar'];
  let title, description, keywords;

  if (whitelistedSlugs.includes(developerId.toLowerCase())) {
    const dt = await getTranslations({ namespace: `seo.developers.${developerId.toLowerCase()}` });
    title = dt('title');
    description = dt('description');
    keywords = dt('keywords');
  } else {
    title = t('title', { name: developer.name });
    description = t('description', { name: developer.name });
    keywords = t('keywords'); // Fallback keywords from seo.developerDetail
  }

  return generateStandardMetadata({
    pathname: `developers/${developerId}`,
    title,
    description,
    keywords,
    images: developer.logoUrl ? [developer.logoUrl] : []
  });
}

export default async function DeveloperDetailPage({ params, searchParams }) {
  const { id: developerId } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page || 1);

  const developer = await getDeveloperById(developerId);

  if (!developer) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)] text-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <p className="text-xs text-slate-500">
            <Link
              href="/developers"
              className="text-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)]"
            >
              ← Back to all developers
            </Link>
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Developer not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t find this developer.
          </p>
        </div>
      </main>
    );
  }

  // ✅ IMPORTANT: DB has developerName, not developerId
  const PAGE_SIZE = 20;
  const properties = await getCachedProjects({
    page,
    pageSize: PAGE_SIZE,
    developer: developer.name, // match by name (contains, insensitive)
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const items = properties?.results || [];
  const total = properties?.total ?? items.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.dubaihaus.com" },
    { name: "Developers", item: "https://www.dubaihaus.com/developers" },
    { name: developer.name, item: `https://www.dubaihaus.com/developers/${developerId}` }
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [getBreadcrumbSchema(breadcrumbItems)]
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
              {total}
            </span>{" "}
            {total === 1 ? "property" : "properties"}
          </span>
          {totalPages > 1 && (
            <span>
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
            No properties found for this developer yet.
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

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
            {page > 1 && (
              <Link
                href={`/developers/${developerId}?page=${page - 1}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:border-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)] transition"
              >
                ← Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-xs text-slate-400">…</span>
                ) : (
                  <Link
                    key={item}
                    href={`/developers/${developerId}?page=${item}`}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition ${item === page
                      ? 'bg-[var(--color-brand-sky)] text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)]'
                      }`}
                  >
                    {item}
                  </Link>
                )
              )}
            {page < totalPages && (
              <Link
                href={`/developers/${developerId}?page=${page + 1}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:border-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)] transition"
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
