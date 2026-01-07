"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slugify";

/**
 * Create a new blog category
 */
export async function createCategory(formData) {
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const isFeatured = formData.get("isFeatured") === "true";
    const order = parseInt(formData.get("order") || "0", 10);

    if (!name) {
        throw new Error("Category name is required");
    }

    const slug = slugify(name);

    // Check if slug already exists
    const existing = await prisma.blogCategory.findUnique({
        where: { slug },
    });

    if (existing) {
        throw new Error(`Category with slug "${slug}" already exists`);
    }

    await prisma.blogCategory.create({
        data: {
            name,
            slug,
            description,
            isFeatured,
            order,
        },
    });

    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");
}

/**
 * Update existing blog category
 */
export async function updateCategory(id, formData) {
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const isFeatured = formData.get("isFeatured") === "true";
    const order = parseInt(formData.get("order") || "0", 10);

    if (!name) {
        throw new Error("Category name is required");
    }

    const slug = slugify(name);

    // Check if changing slug would conflict
    const existing = await prisma.blogCategory.findUnique({
        where: { slug },
    });

    if (existing && existing.id !== id) {
        throw new Error(`Another category with slug "${slug}" already exists`);
    }

    await prisma.blogCategory.update({
        where: { id },
        data: {
            name,
            slug,
            description,
            isFeatured,
            order,
        },
    });

    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");
}

/**
 * Delete a blog category
 * Only allowed if no posts are using it
 */
export async function deleteCategory(id) {
    // Check if any posts use this category
    const postsCount = await prisma.blogPostCategory.count({
        where: { categoryId: id },
    });

    if (postsCount > 0) {
        throw new Error(
            `Cannot delete category. It is used by ${postsCount} post(s). Please reassign or remove those posts first.`
        );
    }

    await prisma.blogCategory.delete({
        where: { id },
    });

    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");
}

/**
 * Reorder categories (batch update)
 */
export async function reorderCategories(orderedIds) {
    // Update order for each category
    const updates = orderedIds.map((id, index) =>
        prisma.blogCategory.update({
            where: { id },
            data: { order: index },
        })
    );

    await prisma.$transaction(updates);

    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");
}

/**
 * Toggle featured status
 */
export async function toggleFeatured(id) {
    const category = await prisma.blogCategory.findUnique({
        where: { id },
        select: { isFeatured: true },
    });

    if (!category) {
        throw new Error("Category not found");
    }

    await prisma.blogCategory.update({
        where: { id },
        data: { isFeatured: !category.isFeatured },
    });

    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");
}
