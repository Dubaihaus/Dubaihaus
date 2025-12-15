import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Edit } from "lucide-react";
import DeleteBlogButton from "@/components/admin/DeleteBlogButton";

export const dynamic = "force-dynamic";

export default async function AdminBlogListPage({ searchParams }) {
  const statusFilter = searchParams?.status;

  const where = {};
  if (statusFilter === "DRAFT") where.status = "DRAFT";
  if (statusFilter === "PUBLISHED") where.status = "PUBLISHED";

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { publishedAt: "desc" }, // Sort by published (or scheduled) date
    include: { seo: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <div className="flex gap-2 mt-2 text-sm">
            <Link href="/admin/blog" className={`px-2 py-0.5 rounded ${!statusFilter ? 'bg-gray-200 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>All</Link>
            <Link href="/admin/blog?status=PUBLISHED" className={`px-2 py-0.5 rounded ${statusFilter === 'PUBLISHED' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>Published</Link>
            <Link href="/admin/blog?status=DRAFT" className={`px-2 py-0.5 rounded ${statusFilter === 'DRAFT' ? 'bg-gray-200 text-gray-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>Drafts</Link>
          </div>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => {
              const isScheduled = post.status === 'PUBLISHED' && post.publishedAt && new Date(post.publishedAt) > new Date();

              return (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {post.title}
                    <div className="text-xs text-gray-400 font-normal">{post.seo?.slug || "No slug"}</div>
                  </td>
                  <td className="px-6 py-4">
                    {isScheduled ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Scheduled
                      </span>
                    ) : post.status === 'PUBLISHED' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {post.publishedAt ? (
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("en-GB")}
                        <br />
                        <span className="text-xs">{new Date(post.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unscheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      <Link
                        href={`/blog/${post.seo?.slug || ""}`}
                        target="_blank"
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/blog/edit/${post.id}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4 inline" />
                      </Link>
                      <DeleteBlogButton id={post.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-gray-500 italic"
                >
                  No posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
