"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/slugify";

/**
 * Map plain text content to read time in minutes
 */
function calculateReadMinutes(content) {
  if (!content) return null;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200)); // ~200 wpm
}

export async function createBlog(formData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const featuredImg = formData.get("featuredImg")?.toString().trim() || null;

  const rawSlug = formData.get("slug")?.toString().trim() || title;
  const slug = slugify(rawSlug);

  const metaTitle =
    formData.get("metaTitle")?.toString().trim() || title;
  const metaDesc =
    formData.get("metaDesc")?.toString().trim() || "";

  const excerpt = content ? content.slice(0, 260) : null;
  const readMinutes = calculateReadMinutes(content);

  // propertyIds comes from <select multiple name="propertyIds">
  const propertyIds = formData.getAll("propertyIds").map(String).filter(Boolean);

  const status = formData.get("status") || "DRAFT";
  const publishedAtStr = formData.get("publishedAt");
  const publishedAt = publishedAtStr ? new Date(publishedAtStr) : null;

  // JSON fields
  const categories = JSON.parse(formData.get("categories") || "[]"); // array of strings
  const tags = JSON.parse(formData.get("tags") || "[]"); // array of strings
  const mediaItems = JSON.parse(formData.get("media") || "[]"); // array of objects

  // Helper: Sync featuredImg if a HERO media exists
  const hero = mediaItems.find(m => m.role === "HERO");
  const finalFeaturedImg = hero ? hero.url : featuredImg;

  // 1) Create SEO row
  const seo = await prisma.sEO.create({
    data: {
      slug,
      metaTitle,
      metaDesc,
    },
  });

  // 2) Create blog with all relations
  await prisma.blogPost.create({
    data: {
      title,
      content,
      excerpt,
      featuredImg: finalFeaturedImg,
      readMinutes,
      status,
      publishedAt,
      seo: { connect: { id: seo.id } },

      // Relations
      featuredProperties: {
        create: propertyIds.map((propertyId, index) => ({
          property: { connect: { id: propertyId } },
          position: index,
        })),
      },
      categories: {
        create: categories.map(name => ({ name }))
      },
      tags: {
        create: tags.map(name => ({ name }))
      },
      media: {
        create: mediaItems.map(m => ({
          url: m.url,
          type: "IMAGE", // default
          role: m.role || "INLINE",
          alt: m.alt,
          caption: m.caption,
          position: m.position || 0
        }))
      }
    },
  });

  // 3) Revalidate pages
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");

  redirect("/admin/blog");
}

export async function updateBlog(id, formData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const featuredImg = formData.get("featuredImg")?.toString().trim() || null;

  const rawSlug = formData.get("slug")?.toString().trim() || title;
  const slug = slugify(rawSlug);

  const metaTitle =
    formData.get("metaTitle")?.toString().trim() || title;
  const metaDesc =
    formData.get("metaDesc")?.toString().trim() || "";

  const excerpt = content ? content.slice(0, 260) : null;
  const readMinutes = calculateReadMinutes(content);

  const propertyIds = formData.getAll("propertyIds").map(String).filter(Boolean);

  const status = formData.get("status") || "DRAFT";
  const publishedAtStr = formData.get("publishedAt");
  const publishedAt = publishedAtStr ? new Date(publishedAtStr) : null;

  // JSON fields
  const categories = JSON.parse(formData.get("categories") || "[]");
  const tags = JSON.parse(formData.get("tags") || "[]");
  const mediaItems = JSON.parse(formData.get("media") || "[]");

  // Sync featuredImg
  const hero = mediaItems.find(m => m.role === "HERO");
  const finalFeaturedImg = hero ? hero.url : featuredImg;

  // Find existing blog including SEO
  const existing = await prisma.blogPost.findUnique({
    where: { id },
    include: { seo: true },
  });

  if (!existing) {
    throw new Error("Blog post not found");
  }

  // Update or create SEO
  let seoId = existing.seoId;
  if (seoId) {
    await prisma.sEO.update({
      where: { id: seoId },
      data: { slug, metaTitle, metaDesc },
    });
  } else {
    const seo = await prisma.sEO.create({
      data: { slug, metaTitle, metaDesc },
    });
    seoId = seo.id;
  }

  // Replace related data (Delete All -> Create All pattern)
  // 1. Featured Properties
  await prisma.blogPostProperty.deleteMany({ where: { blogId: id } });

  // 2. Categories & Tags
  await prisma.blogCategory.deleteMany({ where: { blogId: id } });
  await prisma.blogTag.deleteMany({ where: { blogId: id } });

  // 3. Media (safe to replace since no external FKs usually point to Blog Media)
  await prisma.media.deleteMany({ where: { blogId: id } });

  await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      content,
      excerpt,
      featuredImg: finalFeaturedImg,
      readMinutes,
      status,
      publishedAt, // Can be null now
      seo: seoId ? { connect: { id: seoId } } : undefined,

      featuredProperties: {
        create: propertyIds.map((propertyId, index) => ({
          property: { connect: { id: propertyId } },
          position: index,
        })),
      },
      categories: {
        create: categories.map(name => ({ name }))
      },
      tags: {
        create: tags.map(name => ({ name }))
      },
      media: {
        create: mediaItems.map(m => ({
          url: m.url,
          type: "IMAGE",
          role: m.role || "INLINE",
          alt: m.alt,
          caption: m.caption,
          position: m.position || 0
        }))
      }
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");

  redirect("/admin/blog");
}

export async function deleteBlog(id) {
  const blog = await prisma.blogPost.findUnique({
    where: { id },
    include: { seo: true },
  });

  if (!blog) return;

  await prisma.blogPostProperty.deleteMany({
    where: { blogId: id },
  });

  if (blog.seoId) {
    await prisma.sEO.delete({ where: { id: blog.seoId } }).catch(() => { });
  }

  await prisma.blogPost.delete({ where: { id } });

  revalidatePath("/blog");
  if (blog.seo?.slug) revalidatePath(`/blog/${blog.seo.slug}`);
  revalidatePath("/admin/blog");
}
