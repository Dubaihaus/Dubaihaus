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

  // --- NEW STATES ---
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : ""
  );

  const [categories, setCategories] = useState(
    initialData?.categories?.map((c) => c.name) || []
  );
  const [catInput, setCatInput] = useState("");

  const [tags, setTags] = useState(
    initialData?.tags?.map((t) => t.name) || []
  );
  const [tagInput, setTagInput] = useState("");

  const [media, setMedia] = useState(
    initialData?.media?.map((m) => ({
      url: m.url,
      role: m.role || "INLINE",
      alt: m.alt || "",
      caption: m.caption || "",
      position: m.position || 0,
    })) || []
  );

  // Media Inputs
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaRole, setNewMediaRole] = useState("INLINE");

  // --- HANDLERS ---
  const addCategory = () => {
    const val = catInput.trim();
    if (val && !categories.includes(val)) {
      setCategories([...categories, val]);
      setCatInput("");
    }
  };
  const removeCategory = (idx) => {
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setTagInput("");
    }
  };
  const removeTag = (idx) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const addMedia = () => {
    if (newMediaUrl.trim()) {
      setMedia([
        ...media,
        {
          url: newMediaUrl.trim(),
          role: newMediaRole,
          alt: "",
          caption: "",
          position: media.length,
        },
      ]);
      setNewMediaUrl("");
    }
  };
  const removeMedia = (idx) => {
    setMedia(media.filter((_, i) => i !== idx));
  };
  const updateMedia = (idx, field, val) => {
    const newM = [...media];
    newM[idx][field] = val;
    setMedia(newM);
  };

  // Helper to count characters
  const metaDescLen = defaultMetaDesc.length; // Simplified for default, real-time requires state if editable locally

  return (
    <form
      action={action}
      onSubmit={() => setSubmitting(true)}
      className="space-y-8 bg-white p-6 shadow rounded-lg max-w-5xl mx-auto"
    >
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          {initialData ? "Edit Blog Post" : "New Blog Post"}
        </h3>
        <div className="flex gap-2">
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`rounded border p-2 text-sm font-semibold ${status === "PUBLISHED"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Post"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              name="title"
              required
              defaultValue={initialData?.title}
              className="mt-1 block w-full rounded border border-gray-300 p-2 text-base font-medium"
              placeholder="Enter article title..."
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              name="slug"
              defaultValue={defaultSlug}
              className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm bg-gray-50"
              placeholder="auto-generated-from-title"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
            <textarea
              name="content"
              required
              rows={20}
              defaultValue={initialData?.content || ""}
              className="mt-1 block w-full rounded border border-gray-300 p-4 text-sm font-mono leading-relaxed"
              placeholder="# Heading 1&#10;&#10;Write your article here using Markdown..."
            />
            <p className="mt-2 text-xs text-gray-500">
              To insert an image: Upload it to Media Manager, set role to <strong>INLINE</strong>, copy the URL, and use <code>![Alt Text](URL)</code>.
            </p>
          </div>

          {/* Media Manager */}
          <div className="border rounded-lg bg-slate-50 p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <span>Media Manager</span>
              <span className="text-xs font-normal text-gray-500">Add Hero, Inline, or Gallery images</span>
            </h4>

            {/* Add New */}
            <div className="flex flex-col sm:flex-row gap-2 items-end mb-4 border-b border-gray-200 pb-4">
              <div className="flex-1 w-full">
                <label className="text-xs font-medium text-gray-600">Image URL</label>
                <input
                  value={newMediaUrl}
                  onChange={e => setNewMediaUrl(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="text-xs font-medium text-gray-600">Role</label>
                <select
                  value={newMediaRole}
                  onChange={e => setNewMediaRole(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="INLINE">Inline</option>
                  <option value="HERO">Hero</option>
                  <option value="GALLERY">Gallery</option>
                </select>
              </div>
              <button
                type="button"
                onClick={addMedia}
                className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 font-medium"
              >
                Add Image
              </button>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {media.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No media added yet.</p>}
              {media.map((m, i) => (
                <div key={i} className="flex gap-4 items-start bg-white p-3 rounded border shadow-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden shrink-0 relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(m.url)}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs"
                      title="Click to copy URL"
                    >
                      Copy URL
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-3 flex justify-between">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${m.role === 'HERO' ? 'bg-purple-100 text-purple-700' :
                          m.role === 'GALLERY' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                        }`}>{m.role}</span>
                      <button type="button" onClick={() => removeMedia(i)} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                    <input
                      value={m.alt}
                      onChange={e => updateMedia(i, 'alt', e.target.value)}
                      placeholder="Alt Text"
                      className="border rounded p-1.5 text-xs w-full"
                    />
                    <input
                      value={m.caption}
                      onChange={e => updateMedia(i, 'caption', e.target.value)}
                      placeholder="Caption"
                      className="border rounded p-1.5 text-xs w-full sm:col-span-2"
                    />
                    <select
                      value={m.role}
                      onChange={e => updateMedia(i, 'role', e.target.value)}
                      className="border rounded p-1.5 text-xs w-full sm:col-span-1"
                    >
                      <option value="INLINE">Inline</option>
                      <option value="HERO">Hero</option>
                      <option value="GALLERY">Gallery</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Metadata & Settings */}
        <div className="space-y-6">

          {/* Publishing */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">Publishing</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Published Date</label>
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={publishedAt}
                  onChange={e => setPublishedAt(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
                <p className="text-[10px] text-gray-500 mt-1">Leave empty to keep as Draft, or set future date to Schedule.</p>
              </div>
            </div>
          </div>

          {/* Categories & Tags */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">Organization</h4>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Categories</label>
              <div className="flex gap-2">
                <input
                  value={catInput}
                  onChange={e => setCatInput(e.target.value)}
                  className="flex-1 border rounded p-2 text-sm"
                  placeholder="Add category..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                />
                <button type="button" onClick={addCategory} className="bg-gray-100 px-3 rounded border text-gray-600 hover:bg-gray-200">+</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((c, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-blue-100">
                    {c} <button type="button" onClick={() => removeCategory(i)} className="hover:text-blue-900 font-bold">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tags</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  className="flex-1 border rounded p-2 text-sm"
                  placeholder="Add tag..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag} className="bg-gray-100 px-3 rounded border text-gray-600 hover:bg-gray-200">+</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t, i) => (
                  <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-slate-200">
                    {t} <button type="button" onClick={() => removeTag(i)} className="hover:text-slate-900 font-bold">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Related Properties */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2 border-b pb-2">Related Projects</h4>
            <p className="text-xs text-gray-500 mb-2">Select properties mentioned in this article.</p>
            <select
              name="propertyIds"
              multiple
              defaultValue={defaultSelectedProps}
              className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm h-40"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* SEO */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">SEO</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Title</label>
                <input name="metaTitle" defaultValue={defaultMetaTitle} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Description</label>
                <textarea name="metaDesc" rows={3} defaultValue={defaultMetaDesc} className="w-full border rounded p-2 text-sm" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden Serialized Fields */}
      <input type="hidden" name="categories" value={JSON.stringify(categories)} />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />
      <input type="hidden" name="media" value={JSON.stringify(media)} />

    </form>
  );
}
