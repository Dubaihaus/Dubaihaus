"use client";

import { createCategory } from "@/app/(admin)/admin/blog/categories/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CategoryForm({ category }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const formData = new FormData(e.target);

        try {
            await createCategory(formData);
            router.push("/admin/blog/categories");
            router.refresh();
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                </label>
                <input
                    type="text"
                    name="name"
                    required
                    defaultValue={category?.name}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                    placeholder="e.g., Market Analysis"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    name="description"
                    rows={3}
                    defaultValue={category?.description}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                    placeholder="Optional description..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order
                    </label>
                    <input
                        type="number"
                        name="order"
                        defaultValue={category?.order || 0}
                        className="w-full rounded border border-gray-300 p-2 text-sm"
                    />
                </div>

                <div className="flex items-center pt-6">
                    <input
                        type="checkbox"
                        name="isFeatured"
                        value="true"
                        defaultChecked={category?.isFeatured}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        id="isFeatured"
                    />
                    <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                        Featured category
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                    {submitting ? "Saving..." : "Save Category"}
                </button>
            </div>
        </form>
    );
}
