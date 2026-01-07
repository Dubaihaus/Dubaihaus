"use client";

import { createBlog, updateBlog } from "@/app/(admin)/admin/blog/actions";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Upload, Image as ImageIcon, X, Plus, GripVertical } from "lucide-react";

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function BlogForm({ initialData, properties = [], categories = [], tags = [] }) {
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");

  const action = initialData ? updateBlog.bind(null, initialData.id) : createBlog;

  const defaultSlug = initialData?.seo?.slug || "";
  const defaultMetaTitle = initialData?.seo?.metaTitle || initialData?.title || "";
  const defaultMetaDesc = initialData?.seo?.metaDesc || "";

  const defaultSelectedProps = initialData?.featuredProperties?.map((fp) => fp.propertyId) ?? [];

  // --- STATES ---
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : ""
  );

  // Categories - store as {id, name} objects
  const [selectedCategories, setSelectedCategories] = useState(
    initialData?.categoryLinks?.map((link) => ({
      id: link.category.id,
      name: link.category.name,
    })) || []
  );
  const [categorySearch, setCategorySearch] = useState("");

  // Tags - store as {id, name} objects
  const [selectedTags, setSelectedTags] = useState(
    initialData?.tagLinks?.map((link) => ({
      id: link.tag.id,
      name: link.tag.name,
    })) || []
  );
  const [tagInput, setTagInput] = useState("");

  // Media
  const [media, setMedia] = useState(
    initialData?.media?.map((m) => ({
      url: m.url,
      role: m.role || "INLINE",
      alt: m.alt || "",
      caption: m.caption || "",
      position: m.position || 0,
    })) || []
  );
  const [uploading, setUploading] = useState(false);

  // Auto-fill excerpt from content
  const handleAutoFillExcerpt = () => {
    if (content) {
      const plainText = content.replace(/[#*\[\]()]/g, "").trim();
      const snippet = plainText.slice(0, 300);
      setExcerpt(snippet);
    }
  };

  // Upload image handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await res.json();

      // Add to media list
      setMedia([
        ...media,
        {
          url: data.url,
          role: "INLINE",
          alt: "",
          caption: "",
          position: media.length,
        },
      ]);

      alert("Image uploaded successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Add category
  const handleAddCategory = (cat) => {
    if (!selectedCategories.find((c) => c.id === cat.id)) {
      setSelectedCategories([...selectedCategories, cat]);
    }
    setCategorySearch("");
  };

  // Remove category
  const handleRemoveCategory = (id) => {
    setSelectedCategories(selectedCategories.filter((c) => c.id !== id));
  };

  // Add tag
  const handleAddTag = () => {
    const name = tagInput.trim();
    if (!name) return;

    // Check if exists in global tags
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    const tagToAdd = existing || { name, id: null }; // null id means create new

    if (!selectedTags.find((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setSelectedTags([...selectedTags, tagToAdd]);
    }
    setTagInput("");
  };

  // Remove tag
  const handleRemoveTag = (name) => {
    setSelectedTags(selectedTags.filter((t) => t.name !== name));
  };

  // Update media
  const updateMedia = (idx, field, val) => {
    const newM = [...media];
    newM[idx][field] = val;
    setMedia(newM);
  };

  // Remove media
  const removeMedia = (idx) => {
    setMedia(media.filter((_, i) => i !== idx));
  };

  // Insert image markdown into editor
  const insertImageToEditor = (url, alt = "") => {
    const markdown = `![${alt}](${url})`;
    setContent((prev) => prev + "\n\n" + markdown);
  };

  // Filtered categories for dropdown
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filtered tags for autocomplete
  const filteredTags = tags.filter(
    (tag) =>
      tagInput &&
      tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.find((st) => st.id === tag.id)
  );

  return (
    <form
      action={action}
      onSubmit={() => setSubmitting(true)}
      className="space-y-8 bg-white p-6 shadow rounded-lg max-w-6xl mx-auto"
    >
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          {initialData ? "Edit Blog Post" : "New Blog Post"}
        </h3>
        <div className="flex gap-2 items-center">
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
            <label className="block text-sm font-medium text-gray-700">Title *</label>
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
            <p className="text-xs text-gray-500 mt-1">
              Preview URL: <code className="bg-gray-100 px-1 rounded">/blog/[slug]</code>
            </p>
          </div>

          {/* Rich Markdown Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content (Markdown) *
            </label>
            <div data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={500}
                preview="edit"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Use the toolbar above or write markdown directly. Upload images below and insert them.
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Excerpt</label>
              <button
                type="button"
                onClick={handleAutoFillExcerpt}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Auto-fill from content
              </button>
            </div>
            <textarea
              name="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 p-2 text-sm"
              placeholder="Short summary for blog cards and meta description..."
            />
            <p className="text-xs text-gray-500 mt-1">{excerpt.length} / 300 characters</p>
          </div>

          {/* Media Manager */}
          <div className="border rounded-lg bg-slate-50 p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Media Manager
              </span>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 font-medium">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </h4>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {media.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  No media added yet. Upload images above.
                </p>
              )}
              {media.map((m, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start bg-white p-3 rounded border shadow-sm"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden shrink-0 relative group">
                    <img src={m.url} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => insertImageToEditor(m.url, m.alt)}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-medium"
                      title="Insert into editor"
                    >
                      Insert
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-3 flex justify-between">
                      <select
                        value={m.role}
                        onChange={(e) => updateMedia(i, "role", e.target.value)}
                        className="text-xs font-bold px-2 py-0.5 rounded border"
                      >
                        <option value="INLINE">Inline</option>
                        <option value="HERO">Hero</option>
                        <option value="GALLERY">Gallery</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="text-red-500 text-xs hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                    <input
                      value={m.alt}
                      onChange={(e) => updateMedia(i, "alt", e.target.value)}
                      placeholder="Alt Text"
                      className="border rounded p-1.5 text-xs w-full"
                    />
                    <input
                      value={m.caption}
                      onChange={(e) => updateMedia(i, "caption", e.target.value)}
                      placeholder="Caption"
                      className="border rounded p-1.5 text-xs w-full sm:col-span-2"
                    />
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
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Published Date/Time
                </label>
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  {!publishedAt
                    ? "Leave empty for Draft"
                    : new Date(publishedAt) > new Date()
                      ? "🗓️ Scheduled for future"
                      : "✅ Published"}
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">Categories</h4>

            <div className="mb-3">
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full border rounded p-2 text-sm"
              />
              {categorySearch && filteredCategories.length > 0 && (
                <div className="mt-1 border rounded bg-white shadow-lg max-h-40 overflow-y-auto">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleAddCategory(cat)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((c) => (
                <span
                  key={c.id || c.name}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-blue-100"
                >
                  {c.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(c.id)}
                    className="hover:text-blue-900 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">Tags</h4>

            <div className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type and press Enter..."
                  className="w-full border rounded p-2 text-sm pr-8"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {filteredTags.length > 0 && (
                <div className="mt-1 border rounded bg-white shadow-lg max-h-32 overflow-y-auto">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setSelectedTags([...selectedTags, tag]);
                        setTagInput("");
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-xs"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedTags.map((t, i) => (
                <span
                  key={i}
                  className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-slate-200"
                >
                  #{t.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t.name)}
                    className="hover:text-slate-900 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Related Properties */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2 border-b pb-2">Related Projects</h4>
            <p className="text-xs text-gray-500 mb-2">
              Select properties mentioned in this article.
            </p>
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
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Meta Title
                </label>
                <input
                  name="metaTitle"
                  defaultValue={defaultMetaTitle}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Defaults to post title"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Meta Description
                </label>
                <textarea
                  name="metaDesc"
                  rows={3}
                  defaultValue={defaultMetaDesc}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Defaults to excerpt"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Serialized Fields */}
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="excerpt" value={excerpt} />
      <input type="hidden" name="categories" value={JSON.stringify(selectedCategories)} />
      <input type="hidden" name="tags" value={JSON.stringify(selectedTags)} />
      <input type="hidden" name="media" value={JSON.stringify(media)} />
    </form>
  );
}
