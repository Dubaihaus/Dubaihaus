"use client";

import { createBlog, updateBlog } from "@/app/(admin)/admin/blog/actions";
import { useState } from "react";

export default function BlogForm({ initialData, properties = [] }) {
  const [submitting, setSubmitting] = useState(false);

  const action = initialData
    ? updateBlog.bind(null, initialData.id)
    : createBlog;

  const defaultSlug = initialData?.seo?.slug || "";
  const defaultMetaTitle =
    initialData?.seo?.metaTitle || initialData?.title || "";
  const defaultMetaDesc = initialData?.seo?.metaDesc || "";

  const defaultSelectedProps =
    initialData?.featuredProperties?.map((fp) => fp.propertyId) ?? [];

  return (
    <form
      action={action}
      onSubmit={() => setSubmitting(true)}
      className="space-y-8 bg-white p-6 shadow rounded-lg max-w-3xl"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        {initialData ? "Edit Blog Post" : "New Blog Post"}
      </h3>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          name="title"
          required
          defaultValue={initialData?.title}
          className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Slug (URL, e.g. exclusive-off-plan-developments-dubai-2025)
        </label>
        <input
          name="slug"
          defaultValue={defaultSlug}
          className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Used as <code>/blog/&lt;slug&gt;</code>. If left with spaces we will
          automatically convert it to a SEO-friendly slug.
        </p>
      </div>

      {/* Featured image */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Hero Image URL (optional)
        </label>
        <input
          name="featuredImg"
          type="url"
          defaultValue={initialData?.featuredImg || ""}
          className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          name="content"
          required
          rows={14}
          defaultValue={initialData?.content || ""}
          className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm font-mono"
        />
        <p className="mt-1 text-xs text-gray-500">
          You can paste formatted text or simple markdown. We’ll compute reading
          time automatically.
        </p>
      </div>

      {/* Attach properties */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">
          Projects mentioned in this article (optional)
        </h4>

        <label className="block text-xs font-medium text-gray-600 mb-1">
          Select one or more properties to feature
        </label>
        <select
          name="propertyIds"
          multiple
          defaultValue={defaultSelectedProps}
          className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm h-40"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} – {p.location}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Hold <strong>Ctrl</strong> (Windows) or <strong>Cmd</strong> (Mac) to
          select multiple. Leave empty for a purely informational blog.
        </p>
      </div>

      {/* SEO fields */}
      <div className="border-t pt-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-800">SEO</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Meta Title (optional)
          </label>
          <input
            name="metaTitle"
            defaultValue={defaultMetaTitle}
            className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Meta Description (optional)
          </label>
          <textarea
            name="metaDesc"
            rows={3}
            defaultValue={defaultMetaDesc}
            className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save post"}
        </button>
      </div>
    </form>
  );
}
