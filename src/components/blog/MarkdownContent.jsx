"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownContent({ content }) {
    return (
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-[var(--color-brand-sky)] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-md">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
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
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-6 border border-slate-200 rounded-lg">
                            <table {...props} className="w-full text-sm text-left" />
                        </div>
                    ),
                    th: ({ node, ...props }) => (
                        <th {...props} className="bg-slate-50 px-4 py-3 font-semibold text-slate-900 border-b border-slate-200" />
                    ),
                    td: ({ node, ...props }) => (
                        <td {...props} className="px-4 py-3 border-b border-slate-100 last:border-0" />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
