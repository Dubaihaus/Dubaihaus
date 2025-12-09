
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Edit } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SeoListPage() {
    const seoEntries = await prisma.sEO.findMany({
        orderBy: { slug: "asc" },
        include: {
            property: { select: { title: true } },
            blog: { select: { title: true } }
        }
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">SEO Management</h1>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attached To</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {seoEntries.map((seo) => (
                            <tr key={seo.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{seo.slug}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{seo.metaTitle || "-"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {seo.property ? `Property: ${seo.property.title}` : seo.blog ? `Blog: ${seo.blog.title}` : "Unattached"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/admin/seo/${seo.id}`} className="text-indigo-600 hover:text-indigo-900">
                                        <Edit className="h-4 w-4 inline" /> Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {seoEntries.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No SEO entries found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
