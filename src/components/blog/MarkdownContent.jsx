"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownContent({ content }) {
  const safeContent = content || "";

  if (!safeContent.trim()) {
    return null;
  }

  return (
    <div className="text-[15px] leading-relaxed text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          /* Headings */
          h1: ({ node, ...props }) => (
            <h1
              {...props}
              className="mt-8 mb-4 text-3xl font-bold text-slate-900 leading-tight"
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              {...props}
              className="mt-8 mb-3 text-2xl font-bold text-slate-900 leading-snug"
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              {...props}
              className="mt-6 mb-2 text-xl font-semibold text-slate-900 leading-snug"
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              {...props}
              className="mt-5 mb-2 text-lg font-semibold text-slate-900"
            />
          ),

          /* Paragraphs */
          p: ({ node, ...props }) => (
            <p
              {...props}
              className="my-3 text-[15px] leading-relaxed text-slate-700"
            />
          ),

          /* Lists */
          ul: ({ node, ordered, ...props }) => (
            <ul
              {...props}
              className="my-3 ml-5 list-disc space-y-1 text-[15px] text-slate-700"
            />
          ),
          ol: ({ node, ordered, ...props }) => (
            <ol
              {...props}
              className="my-3 ml-5 list-decimal space-y-1 text-[15px] text-slate-700"
            />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="leading-relaxed" />
          ),

          /* Horizontal rule */
          hr: ({ node, ...props }) => (
            <hr
              {...props}
              className="my-8 border-t border-slate-200"
            />
          ),

          /* Strong text */
          strong: ({ node, ...props }) => (
            <strong
              {...props}
              className="font-semibold text-slate-900"
            />
          ),

          /* Links */
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-[var(--color-brand-sky)] underline-offset-2 hover:underline hover:text-[var(--color-brand-dark)]"
            />
          ),

          /* Images – keeps your nice figure styling */
          img: ({ node, ...props }) => {
            return (
              <figure className="my-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  {...props}
                  className="w-full h-auto rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                  alt={props.alt || "Article image"}
                />
                {props.alt && (
                  <figcaption className="text-center text-sm text-slate-500 mt-3 italic">
                    {props.alt}
                  </figcaption>
                )}
              </figure>
            );
          },

          /* Tables – keeps your previous table styling */
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 border border-slate-200 rounded-lg">
              <table
                {...props}
                className="w-full text-sm text-left border-collapse"
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="bg-slate-50 px-4 py-3 font-semibold text-slate-900 border-b border-slate-200"
            />
          ),
          td: ({ node, ...props }) => (
            <td
              {...props}
              className="px-4 py-3 border-b border-slate-100 last:border-0"
            />
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}
