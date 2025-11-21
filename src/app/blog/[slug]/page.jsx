// src/app/blog/[slug]/page.jsx

import { BLOG_POSTS } from "@/data/blogPosts";
import Link from "next/link";

function findPost(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}

// Pre-generate static params for all known posts
export function generateStaticParams() {
  return BLOG_POSTS.filter(Boolean).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = findPost(params.slug);

  if (!post) {
    return {
      title: "Article not found | DubaiHaus",
    };
  }

  const baseTitle = `${post.title} | DubaiHaus Insights`;
  return {
    title: baseTitle,
    description: post.excerpt || "",
    openGraph: {
      title: baseTitle,
      description: post.excerpt || "",
      type: "article",
    },
  };
}

export default function BlogDetailPage({ params }) {
  const post = findPost(params.slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)]">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <p className="text-xs text-slate-500 mb-3">
            <Link
              href="/blog"
              className="text-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)]"
            >
              ← Back to all articles
            </Link>
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Article not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The blog post you are looking for doesn&apos;t exist or may have
            been moved.
          </p>
        </div>
      </main>
    );
  }

  const safeTitle = post.title || "Untitled article";
  const safeDate = post.date
    ? new Date(post.date).toLocaleDateString("en-GB")
    : "";
  const safeReadTime = post.readTime || "";
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const blocks = Array.isArray(post.content) ? post.content : [];

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
            {safeDate && <span>{safeDate}</span>}
            {safeReadTime && (
              <>
                <span>•</span>
                <span>{safeReadTime}</span>
              </>
            )}
            {tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 border border-sky-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Hero image – null safe */}
        {post.heroImage ? (
          <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.12)] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.heroImage}
              alt={safeTitle}
              className="w-full h-auto max-h-[420px] object-cover"
            />
          </div>
        ) : null}

        {/* Content */}
        <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-a:text-[var(--color-brand-sky)]">
          {blocks.map((block, idx) => {
            if (!block || typeof block !== "object") return null;

            if (block.type === "heading") {
              return (
                <h2 key={idx} className="mt-6 text-xl font-semibold">
                  {block.text}
                </h2>
              );
            }

            if (block.type === "list" && Array.isArray(block.items)) {
              return (
                <ul key={idx} className="list-disc pl-5 mt-3 space-y-1">
                  {block.items.map((item, ii) => (
                    <li key={ii}>{item}</li>
                  ))}
                </ul>
              );
            }

            // default paragraph
            return (
              <p key={idx} className="mt-3">
                {block.text}
              </p>
            );
          })}
        </div>
      </article>
    </main>
  );
}
