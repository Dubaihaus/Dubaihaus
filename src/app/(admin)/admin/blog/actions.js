"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/slugify";
import { findOrCreateCategory, findOrCreateTag, calculateReadMinutes } from "@/lib/blog-helpers";
import cloudinary from "@/lib/cloudinary";

export async function createBlog(formData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const featuredImg = formData.get("featuredImg")?.toString().trim() || null;

  const rawSlug = formData.get("slug")?.toString().trim() || title;
  const slug = slugify(rawSlug);

  const metaTitle = formData.get("metaTitle")?.toString().trim() || title;
  const metaDesc = formData.get("metaDesc")?.toString().trim() || "";

  const excerpt = formData.get("excerpt")?.toString().trim() || (content ? content.slice(0, 300) : null);
  const readMinutes = calculateReadMinutes(content);

  // propertyIds comes from <select multiple name="propertyIds">
  const propertyIds = formData.getAll("propertyIds").map(String).filter(Boolean);

  const status = formData.get("status") || "DRAFT";
  const publishedAtStr = formData.get("publishedAt");
  const publishedAt = publishedAtStr ? new Date(publishedAtStr) : null;

  // JSON fields - now containing category/tag IDs or names
  const categoryData = JSON.parse(formData.get("categories") || "[]"); // array of {id?, name}
  const tagData = JSON.parse(formData.get("tags") || "[]"); // array of {id?, name}
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

  // 2) Resolve category IDs (find or create)
  const categoryIds = [];
  for (const cat of categoryData) {
    if (cat.id) {
      categoryIds.push(cat.id);
    } else if (cat.name) {
      const category = await findOrCreateCategory(cat.name);
      categoryIds.push(category.id);
    }
  }

  // 3) Resolve tag IDs (find or create)
  const tagIds = [];
  for (const tag of tagData) {
    if (tag.id) {
      tagIds.push(tag.id);
    } else if (tag.name) {
      const tagEntity = await findOrCreateTag(tag.name);
      tagIds.push(tagEntity.id);
    }
  }

  // 4) Create blog with all relations
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

      // Relations using new join tables
      featuredProperties: {
        create: propertyIds.map((propertyId, index) => ({
          property: { connect: { id: propertyId } },
          position: index,
        })),
      },
      categoryLinks: {
        create: categoryIds.map((categoryId, index) => ({
          category: { connect: { id: categoryId } },
          position: index,
        })),
      },
      tagLinks: {
        create: tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      },
      media: {
        create: mediaItems.map(m => ({
          url: m.url,
          publicId: m.publicId || null,
          type: "IMAGE", // default
          role: m.role || "INLINE",
          alt: m.alt,
          caption: m.caption,
          position: m.position || 0
        }))
      }
    },
  });

  // 5) Revalidate pages
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

  const metaTitle = formData.get("metaTitle")?.toString().trim() || title;
  const metaDesc = formData.get("metaDesc")?.toString().trim() || "";

  const excerpt = formData.get("excerpt")?.toString().trim() || (content ? content.slice(0, 300) : null);
  const readMinutes = calculateReadMinutes(content);

  const propertyIds = formData.getAll("propertyIds").map(String).filter(Boolean);

  const status = formData.get("status") || "DRAFT";
  const publishedAtStr = formData.get("publishedAt");
  const publishedAt = publishedAtStr ? new Date(publishedAtStr) : null;

  // JSON fields
  const categoryData = JSON.parse(formData.get("categories") || "[]");
  const tagData = JSON.parse(formData.get("tags") || "[]");
  const mediaItems = JSON.parse(formData.get("media") || "[]");

  // Sync featuredImg
  const hero = mediaItems.find(m => m.role === "HERO");
  const finalFeaturedImg = hero ? hero.url : featuredImg;

  // Find existing blog including SEO and Media
  const existing = await prisma.blogPost.findUnique({
    where: { id },
    include: { seo: true, media: true },
  });

  if (!existing) {
    throw new Error("Blog post not found");
  }

  // --- CLEANUP LOGIC ---
  // Identify media that was present but is now missing (removed by user)
  const incomingPublicIds = new Set(mediaItems.map(m => m.publicId).filter(Boolean));

  // Find media in DB that have publicId but are NOT in incoming list
  const mediaToDelete = existing.media.filter(m => m.publicId && !incomingPublicIds.has(m.publicId));

  // Execute cleanup in background (non-blocking best effort)
  if (mediaToDelete.length > 0) {
    const publicIdsToDelete = mediaToDelete.map(m => m.publicId);
    console.log("Cleaning up Cloudinary images:", publicIdsToDelete);
   await cloudinary.api.delete_resources(publicIdsToDelete, { resource_type: "image" }).catch(err => {
      console.error("Failed to cleanup Cloudinary images:", err);
    });
  }
  // ---------------------

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

  // Resolve category IDs
  const categoryIds = [];
  for (const cat of categoryData) {
    if (cat.id) {
      categoryIds.push(cat.id);
    } else if (cat.name) {
      const category = await findOrCreateCategory(cat.name);
      categoryIds.push(category.id);
    }
  }

  // Resolve tag IDs
  const tagIds = [];
  for (const tag of tagData) {
    if (tag.id) {
      tagIds.push(tag.id);
    } else if (tag.name) {
      const tagEntity = await findOrCreateTag(tag.name);
      tagIds.push(tagEntity.id);
    }
  }

  // Replace related data (Delete All -> Create All pattern)
  // 1. Featured Properties
  await prisma.blogPostProperty.deleteMany({ where: { blogId: id } });

  // 2. Category Links
  await prisma.blogPostCategory.deleteMany({ where: { blogId: id } });

  // 3. Tag Links
  await prisma.blogPostTag.deleteMany({ where: { blogId: id } });

  // 4. Media (safe to replace since no external FKs usually point to Blog Media)
  await prisma.media.deleteMany({ where: { blogId: id } });

  // Update blog post
  await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      content,
      excerpt,
      featuredImg: finalFeaturedImg,
      readMinutes,
      status,
      publishedAt,
      seo: seoId ? { connect: { id: seoId } } : undefined,

      featuredProperties: {
        create: propertyIds.map((propertyId, index) => ({
          property: { connect: { id: propertyId } },
          position: index,
        })),
      },
      categoryLinks: {
        create: categoryIds.map((categoryId, index) => ({
          category: { connect: { id: categoryId } },
          position: index,
        })),
      },
      tagLinks: {
        create: tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      },
      media: {
        create: mediaItems.map(m => ({
          url: m.url,
          publicId: m.publicId || null,
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
    include: { seo: true, media: true },
  });

  if (!blog) return;

  // 1) Delete Cloudinary images
  const splitMedia = (blog.media || []).reduce((acc, m) => {
    if (m.publicId) acc.cloud.push(m.publicId);
    return acc;
  }, { cloud: [] });

  if (splitMedia.cloud.length > 0) {
    console.log("Deleting Cloudinary images for blog:", id, splitMedia.cloud);
    cloudinary.api.delete_resources(splitMedia.cloud).catch(err => {
      console.error("Failed to delete Cloudinary images:", err);
    });
  }

  // 2) delete db rows
  await prisma.blogPostProperty.deleteMany({ where: { blogId: id } });
  await prisma.blogPostCategory.deleteMany({ where: { blogId: id } });
  await prisma.blogPostTag.deleteMany({ where: { blogId: id } });
  await prisma.media.deleteMany({ where: { blogId: id } });

  if (blog.seoId) {
    await prisma.sEO.delete({ where: { id: blog.seoId } }).catch(() => { });
  }

  await prisma.blogPost.delete({ where: { id } });

  revalidatePath("/blog");
  if (blog.seo?.slug) revalidatePath(`/blog/${blog.seo.slug}`);
  revalidatePath("/admin/blog");
}

