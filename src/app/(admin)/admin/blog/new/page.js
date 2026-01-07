// src/app/(admin)/admin/blog/new/page.js
import BlogForm from "@/components/admin/BlogForm";
import { prisma } from "@/lib/prisma";
import { getAllCategories, getAllTags } from "@/lib/blog-helpers";

export default async function AdminNewBlogPage() {
  const [properties, categories, tags] = await Promise.all([
    prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, location: true },
    }),
    getAllCategories(),
    getAllTags(),
  ]);

  return (
    <div className="max-w-7xl mx-auto py-6">
      <BlogForm properties={properties} categories={categories} tags={tags} />
    </div>
  );
}
