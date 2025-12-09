// src/app/blog/page.jsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DubaiHaus Insights | Guides & Articles",
  description:
    "Read guides about buying off-plan, investing in Dubai & Abu Dhabi, payment plans, community overviews and more.",
  openGraph: {
    title: "DubaiHaus Insights | Guides & Articles",
    description:
      "Stay informed with curated articles about UAE property, off-plan projects and investment strategy.",
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { seo: true },
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)]">
      {/* Hero (reuse your existing layout) */}
          
  {/* Hero */}
      <section className="relative w-full py-16 md:py-20 px-4 border-b border-sky-100/60">
        {/* floating blobs */}
        <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-[var(--color-brand-sky)] blur-3xl opacity-30" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-[var(--color-brand-dark)] blur-3xl opacity-20" />

        <div className="relative z-10 mx-auto max-w-6xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
            DubaiHaus insights
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Practical guides for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-sky)] to-[var(--color-brand-dark)]">
                buying and investing
              </span>{" "}
              in Dubai &amp; Abu Dhabi.
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              Short, no-nonsense articles to help you understand off-plan vs
              ready, payment plans, communities, and what to look out for before
              you sign anything.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Trusted information curated by DubaiHaus
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
              Focused on real buyer questions, not marketing fluff
            </span>
          </div>
        </div>
      </section>

      {/* Blog list */}
      <section className="py-10 md:py-14 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Latest articles
            </h2>
            <p className="text-xs text-slate-500">
              {posts.length} article{posts.length !== 1 ? "s" : ""} for now –
              content will expand over time.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.seo?.slug}`}
                className="group rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
              >
                {post.featuredImg && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.featuredImg}
                    alt={post.title}
                    className="h-44 w-full object-cover group-hover:scale-[1.02] transition-transform"
                  />
                )}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <p className="text-[11px] text-slate-500">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString(
                          "en-GB"
                        )
                      : ""}
                    {post.readMinutes && (
                      <>
                        {" "}
                        • {post.readMinutes} min read
                      </>
                    )}
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[var(--color-brand-sky)]">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-slate-600 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
