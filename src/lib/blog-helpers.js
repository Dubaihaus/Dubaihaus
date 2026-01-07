import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

/**
 * Calculate read time in minutes from content
 * @param {string} content - The blog post content
 * @returns {number|null} - Estimated read time in minutes
 */
export function calculateReadMinutes(content) {
    if (!content) return null;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200)); // ~200 wpm
}

/**
 * Find or create a blog category by name
 * @param {string} name - Category name
 * @returns {Promise<object>} - The category object with id
 */
export async function findOrCreateCategory(name) {
    if (!name || typeof name !== "string") {
        throw new Error("Category name must be a non-empty string");
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);

    // Try to find existing category by slug
    let category = await prisma.blogCategory.findUnique({
        where: { slug },
    });

    // Create if doesn't exist
    if (!category) {
        category = await prisma.blogCategory.create({
            data: {
                name: trimmedName,
                slug,
            },
        });
    }

    return category;
}

/**
 * Find or create a blog tag by name
 * @param {string} name - Tag name
 * @returns {Promise<object>} - The tag object with id
 */
export async function findOrCreateTag(name) {
    if (!name || typeof name !== "string") {
        throw new Error("Tag name must be a non-empty string");
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);

    // Try to find existing tag by slug
    let tag = await prisma.blogTag.findUnique({
        where: { slug },
    });

    // Create if doesn't exist
    if (!tag) {
        tag = await prisma.blogTag.create({
            data: {
                name: trimmedName,
                slug,
            },
        });
    }

    return tag;
}

/**
 * Normalize a blog post from DB for public consumption
 * @param {object} post - Raw post from database
 * @returns {object} - Normalized post object
 */
export function normalizePostForPublic(post) {
    if (!post) return null;

    return {
        ...post,
        categories: post.categoryLinks?.map((link) => link.category) || [],
        tags: post.tagLinks?.map((link) => link.tag) || [],
        heroImage: post.media?.find((m) => m.role === "HERO")?.url || post.featuredImg,
        galleryImages: post.media?.filter((m) => m.role === "GALLERY") || [],
    };
}

/**
 * Get all categories for admin dropdown/selection
 * @returns {Promise<Array>} - List of all categories
 */
export async function getAllCategories() {
    return prisma.blogCategory.findMany({
        orderBy: [
            { isFeatured: "desc" },
            { order: "asc" },
            { name: "asc" },
        ],
        include: {
            _count: {
                select: { posts: true },
            },
        },
    });
}

/**
 * Get all tags for autocomplete
 * @returns {Promise<Array>} - List of all tags
 */
export async function getAllTags() {
    return prisma.blogTag.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: { posts: true },
            },
        },
    });
}

/**
 * Get featured categories for public display
 * @param {number} limit - Maximum number to return
 * @returns {Promise<Array>} - List of featured categories
 */
export async function getFeaturedCategories(limit = 8) {
    return prisma.blogCategory.findMany({
        where: { isFeatured: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        take: limit,
        include: {
            _count: {
                select: { posts: true },
            },
        },
    });
}
