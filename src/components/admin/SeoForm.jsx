"use client";

import { updateSEO } from "@/app/(admin)/admin/seo/actions";
import { useState } from "react";
import Link from "next/link";

export default function SeoForm({ initialData }) {
    const [submitting, setSubmitting] = useState(false);
    const action = updateSEO.bind(null, initialData.id);

    return (
        <form action={action} onSubmit={() => setSubmitting(true)} className="space-y-8 divide-y divide-gray-200 bg-white p-6 shadow rounded-lg max-w-2xl">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit SEO</h3>
                </div>

                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL Path)</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="slug"
                            id="slug"
                            required
                            defaultValue={initialData.slug}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">Meta Title</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="metaTitle"
                            id="metaTitle"
                            defaultValue={initialData.metaTitle || ""}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="metaDesc" className="block text-sm font-medium text-gray-700">Meta Description</label>
                    <div className="mt-1">
                        <textarea
                            name="metaDesc"
                            id="metaDesc"
                            rows={3}
                            defaultValue={initialData.metaDesc || ""}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Link
                        href="/admin/seo"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {submitting ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </form>
    );
}
