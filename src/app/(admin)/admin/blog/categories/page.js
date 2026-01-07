import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Star, Edit2, Trash2, Plus } from "lucide-react";
import CategoryForm from "@/components/admin/CategoryForm";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";
import ToggleFeaturedButton from "@/components/admin/ToggleFeaturedButton";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({ searchParams }) {
    const showNew = searchParams?.new === "true";

    const categories = await prisma.blogCategory.findMany({
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

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blog Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage categories used across blog posts
                    </p>
                </div>
                <Link
                    href="/admin/blog/categories?new=true"
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Category
                </Link>
            </div>

            {showNew && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Create New Category
                    </h2>
                    <CategoryForm />
                </div>
            )}

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                                Slug
                            </th>
                            <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                                Featured
                            </th>
                            <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                                Posts
                            </th>
                            <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                                Order
                            </th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-medium text-gray-900">{category.name}</div>
                                        {category.description && (
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {category.description.substring(0, 60)}
                                                {category.description.length > 60 && "..."}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                    {category.slug}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <ToggleFeaturedButton
                                        categoryId={category.id}
                                        isFeatured={category.isFeatured}
                                    />
                                </td>
                                <td className="px-6 py-4 text-center text-gray-700">
                                    <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium">
                                        {category._count.posts}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-500">
                                    {category.order}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3 items-center">
                                        <Link
                                            href={`/admin/blog/categories/edit/${category.id}`}
                                            className="text-gray-600 hover:text-gray-900"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Link>
                                        <DeleteCategoryButton
                                            categoryId={category.id}
                                            postCount={category._count.posts}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-10 text-center text-gray-500 italic"
                                >
                                    No categories yet. Create your first one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
