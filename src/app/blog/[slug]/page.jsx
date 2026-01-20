// src/app/blog/[slug]/page.jsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/blog/MarkdownContent";
import PropertyCard from "@/components/PropertyCard";
import GalleryPreviewGrid from "@/components/blog/GalleryPreviewGrid";
import HeroImagePreview from "@/components/blog/HeroImagePreview";

// Normalize property for card (simplified version of what's in FeaturedProperties)
function normalizePropertyForCard(p) {
  return {
    ...p,
    source: "ADMIN", // Since it's from the Property model
    coverPhoto: p.images?.[0]?.url || "/project_detail_images/building.jpg",
    priceCurrency: "AED",
    bedroomsRange: p.bedrooms ? `${p.bedrooms} BR` : null,
    // Card expects 'city' sometimes?
    city: p.location.split(",").pop().trim(),
  };
}

async function getPost(slug) {
  return prisma.blogPost.findFirst({
    where: {
      seo: { slug },
      status: "PUBLISHED",
    },
    include: {
      seo: true,
      categoryLinks: {
        include: { category: true },
      },
      tagLinks: {
        include: { tag: true },
      },
      media: true,
      featuredProperties: {
        orderBy: { position: "asc" },
        include: {
          property: {
            include: { images: true },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    return { title: "Article not found | DubaiHaus" };
  }

  const metaTitle =
    post.seo?.metaTitle || `${post.title} | DubaiHaus Insights`;
  const metaDesc =
    post.seo?.metaDesc || post.excerpt || post.content.slice(0, 150);

  const hero =
    post.media?.find((m) => m.role === "HERO") || { url: post.featuredImg };

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: "article",
      images: hero.url ? [{ url: hero.url }] : [],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const post = await getPost(params.slug);

  if (!post) return notFound();

  const safeTitle = post.title || "Untitled article";
  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const readTime = post.readMinutes ? `${post.readMinutes} min read` : "";

  const featuredProps = post.featuredProperties ?? [];

  // Determine Media
  const heroImage =
    post.media?.find((m) => m.role === "HERO")?.url || post.featuredImg;
  const galleryImages =
    post.media?.filter((m) => m.role === "GALLERY") || [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var white_0,_#F5F7FB_55%,_white_100%)]">
      {/* Progress Bar (simple implementation - sticky top) */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-100 z-50">
        <div
          className="h-full bg-[var(--color-brand-sky)] w-0"
          id="scroll-progress"
        ></div>
        {/* Note: Real scroll progress needs client-side JS. Skipping complex scroll listener for now to keep it server-rendered clean. */}
      </div>

      <article className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        {/* Back link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/blog"
            className="text-xs font-semibold text-slate-500 hover:text-[var(--color-brand-sky)] flex items-center gap-1 transition"
          >
            ← Back to all articles
          </Link>

          {/* Categories */}
          <div className="flex gap-2">
            {post.categoryLinks?.map((cl) => (
              <Link
                key={cl.id}
                href={`/blog?cat=${encodeURIComponent(cl.category.slug)}`}
                className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-sky)] bg-sky-50 px-2 py-1 rounded-md hover:bg-sky-100"
              >
                {cl.category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Heading */}
        <header className="space-y-6 mb-10 text-center mx-auto max-w-7xl">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
            {safeTitle}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
            {published && <span>{published}</span>}
            {readTime && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{readTime}</span>
              </>
            )}
          </div>
        </header>

        {/* Hero image */}
  {heroImage && <HeroImagePreview url={heroImage} title={safeTitle} />}


        {/* Main Content */}
        <div className="bg-white rounded-[32px] p-6 md:p-12 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <MarkdownContent content={post.content || ""} />

          {/* Tags */}
          {post.tagLinks?.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Tags:
              </span>
              <div className="flex flex-wrap gap-2">
                {post.tagLinks.map((tl) => (
                  <Link
                    key={tl.id}
                    href={`/blog?tag=${encodeURIComponent(tl.tag.slug)}`}
                    className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition"
                  >
                    #{tl.tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gallery Section (UPDATED: now with Preview + full screen modal) */}
        {galleryImages.length > 0 && (
          <section className="mt-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Gallery
            </h3>

            {/* Client component handles hover + modal preview */}
            <GalleryPreviewGrid images={galleryImages} />
          </section>
        )}

        {/* Featured projects section */}
        {featuredProps.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Projects mentioned in this article
              </h2>
              <p className="text-slate-500 text-sm">
                Explore the properties referenced in this guide.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 justify-center">
              {featuredProps.map((fp) => {
                const p = fp.property;
                if (!p) return null;
                const normalized = normalizePropertyForCard(p);

                return <PropertyCard key={p.id} property={normalized} />;
              })}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
