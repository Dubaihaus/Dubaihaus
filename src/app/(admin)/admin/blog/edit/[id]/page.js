// src/app/(admin)/admin/blog/edit/[id]/page.js
import { prisma } from "@/lib/prisma";
import BlogForm from "@/components/admin/BlogForm";
import { getAllCategories, getAllTags } from "@/lib/blog-helpers";

export default async function AdminEditBlogPage({ params }) {
  const { id } = params;

  const [blog, properties, categories, tags] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id },
      include: {
        seo: true,
        featuredProperties: true,
        media: true,
        categoryLinks: {
          include: { category: true },
        },
        tagLinks: {
          include: { tag: true },
        },
      },
    }),
    prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, location: true },
    }),
    getAllCategories(),
    getAllTags(),
  ]);

  if (!blog) {
    return <div>Blog not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <BlogForm
        initialData={blog}
        properties={properties}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
