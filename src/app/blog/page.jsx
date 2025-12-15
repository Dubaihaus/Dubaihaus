import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search } from "lucide-react";

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

export default async function BlogPage({ searchParams }) {
  // Use await for searchParams (Next.js 15 requirement, good practice for future)
  // But strictly this looks like Next.js 13/14 pattern where props are objects. 
  // Safety check: if searchParams is a promise (Next 15), await it.  
  // Assuming Next 14 based on usage elsewhere, but let's be safe if possible.
  // Actually, standard destructuring works in 14.
  const { cat, tag, q } = searchParams || {};

  const where = { status: "PUBLISHED" };
  if (cat) where.categories = { some: { name: cat } };
  if (tag) where.tags = { some: { name: tag } };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    include: { seo: true, categories: true, tags: true },
  });

  // Fetch top categories (naive grouping)
  const allCats = await prisma.blogCategory.groupBy({
    by: ["name"],
    _count: { name: true },
    orderBy: { _count: { name: "desc" } },
    take: 8,
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)]">

      {/* Hero */}
      <section className="relative w-full py-16 md:py-20 px-4 border-b border-sky-100/60">
        <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-[var(--color-brand-sky)] blur-3xl opacity-30" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-[var(--color-brand-dark)] blur-3xl opacity-20" />

        <div className="relative z-10 mx-auto max-w-6xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
            DubaiHaus insights
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Practical guides for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-sky)] to-[var(--color-brand-dark)]">
                  buying and investing
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
                Market analysis, community guides, and expert advice for Dubai Real Estate.
              </p>
            </div>

            {/* Search Box */}
            <form className="w-full md:w-auto relative" action="/blog">
              <input
                name="q"
                defaultValue={q || ""}
                placeholder="Search articles..."
                className="pl-10 pr-4 py-3 rounded-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-[var(--color-brand-sky)] focus:border-transparent outline-none w-full md:w-80 text-sm"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </form>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Link
              href="/blog"
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${!cat && !tag ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
              All
            </Link>
            {allCats.map(c => (
              <Link
                key={c.name}
                href={`/blog?cat=${encodeURIComponent(c.name)}`}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${cat === c.name ? 'bg-[var(--color-brand-sky)] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog list */}
      <section className="py-10 md:py-14 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              {q ? `Search results for "${q}"` : (cat ? `Category: ${cat}` : (tag ? `Tag: ${tag}` : "Latest articles"))}
            </h2>
            <p className="text-xs text-slate-500">
              {posts.length} article{posts.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500">No articles found matching your criteria.</p>
              <Link href="/blog" className="text-[var(--color-brand-sky)] text-sm font-medium mt-2 inline-block hover:underline">Clear filters</Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.seo?.slug}`}
                  className="group rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  <div className="aspect-[16/9] w-full relative bg-slate-100 overflow-hidden">
                    {post.featuredImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.featuredImg}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                    {/* Categoriy Badge */}
                    {post.categories.length > 0 && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm">
                        {post.categories[0].name}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })
                        : "Draft"}
                      {post.readMinutes && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{post.readMinutes} min read</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[var(--color-brand-sky)] leading-tight transition-colors">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="mt-auto pt-4 flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map(t => (
                        <span key={t.name} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px]">#{t.name}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
