// src/app/(admin)/admin/blog/edit/[id]/page.js
import { prisma } from "@/lib/prisma";
import BlogForm from "@/components/admin/BlogForm";

export default async function AdminEditBlogPage({ params }) {
  const { id } = params;

  const blog = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      seo: true,
      featuredProperties: true,
      media: true,
      categories: true,
      tags: true,
    },
  });

  if (!blog) {
    return <div>Blog not found</div>;
  }

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, location: true },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <BlogForm initialData={blog} properties={properties} />
    </div>
  );
}
