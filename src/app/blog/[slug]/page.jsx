// src/app/blog/[slug]/page.jsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getPost(slug) {
  return prisma.blogPost.findFirst({
    where: {
      seo: { slug },
      status: "PUBLISHED",
    },
    include: {
      seo: true,
      featuredProperties: {
        orderBy: { position: "asc" },
        include: { property: true },
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

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const post = await getPost(params.slug);

  if (!post) return notFound();

  const safeTitle = post.title || "Untitled article";
  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB")
    : "";
  const readTime = post.readMinutes ? `${post.readMinutes} min` : "";

  const featuredProps = post.featuredProperties ?? [];

  // Simple paragraph split; later you can switch to react-markdown
  const paragraphs = post.content.split(/\n\s*\n/);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)]">
      <article className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        {/* Back link */}
        <p className="text-xs text-slate-500 mb-4">
          <Link
            href="/blog"
            className="text-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)]"
          >
            ← Back to all articles
          </Link>
        </p>

        {/* Heading */}
        <header className="space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            {safeTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            {published && <span>{published}</span>}
            {readTime && (
              <>
                <span>•</span>
                <span>{readTime} read</span>
              </>
            )}
          </div>
        </header>

        {/* Hero image */}
        {post.featuredImg && (
          <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.12)] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featuredImg}
              alt={safeTitle}
              className="w-full h-auto max-h-[420px] object-cover"
            />
          </div>
        )}

        {/* Main article content */}
        <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-a:text-[var(--color-brand-sky)]">
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Featured projects section */}
        {featuredProps.length > 0 && (
          <section className="mt-12 border-t border-slate-200 pt-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Projects mentioned in this article
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Explore off-plan projects referenced above. Click “Discover
              project” to view full details.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {featuredProps.map((fp) => {
                const p = fp.property;
                if (!p) return null;

                // TODO: adjust href to match your public property detail route
                const href = `/properties/${p.id}`;

                return (
                  <div
                    key={fp.id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col gap-2"
                  >
                    <h3 className="text-sm font-semibold text-slate-900">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500">{p.location}</p>
                    <p className="text-xs text-slate-600">
                      From{" "}
                      <span className="font-semibold">
                        AED {p.price.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {p.bedrooms} BR • {p.bathrooms} bath • {p.area} sq.ft
                    </p>
                    <div className="mt-2">
                      <Link
                        href={href}
                        className="inline-flex items-center rounded-full bg-[var(--color-brand-sky)] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[var(--color-brand-dark)]"
                      >
                        Discover project
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
