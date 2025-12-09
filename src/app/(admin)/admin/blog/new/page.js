// src/app/(admin)/admin/blog/new/page.js
import BlogForm from "@/components/admin/BlogForm";
import { prisma } from "@/lib/prisma";

export default async function AdminNewBlogPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, location: true },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <BlogForm properties={properties} />
    </div>
  );
}
