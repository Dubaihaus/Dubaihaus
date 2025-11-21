// src/components/blog/BlogCard.jsx

import Link from "next/link";

export default function BlogCard({ post }) {
  // Hard guard – if something is wrong with the data, don't render the card
  if (!post || typeof post !== "object") {
    return null;
  }

  const {
    slug,
    title,
    excerpt,
    date,
    readTime,
    heroImage,
    tags,
  } = post;

  const safeTitle = title || "Untitled article";
  const safeExcerpt =
    excerpt || "This article will be updated with more information soon.";
  const safeDate = date ? new Date(date).toLocaleDateString("en-GB") : "";
  const safeReadTime = readTime || "";
  const safeSlug = slug || "#";

  return (
    <article
      className="
        group flex flex-col rounded-3xl border border-slate-200 
        bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.10)]
        overflow-hidden transition-transform hover:-translate-y-1 
        hover:shadow-[0_24px_80px_rgba(15,23,42,0.18)]
      "
    >
      {heroImage ? (
        <div className="relative h-48 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={safeTitle}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
          Image coming soon
        </div>
      )}

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
          <span>{safeDate}</span>
          <span>{safeReadTime}</span>
        </div>

        <h2 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug mb-2 line-clamp-2">
          {safeTitle}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-4">
          {safeExcerpt}
        </p>

        {Array.isArray(tags) && tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 border border-sky-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <Link
            href={`/blog/${safeSlug}`}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)]"
          >
            Read article
            <span className="transition-transform group-hover:translate-x-1">
              ↗
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
