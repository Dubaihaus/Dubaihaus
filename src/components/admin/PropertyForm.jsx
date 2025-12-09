"use client";

import { createProperty, updateProperty } from "@/app/(admin)/admin/properties/actions";
import DeletePropertyButton from "@/components/admin/DeletePropertyButton";
import { useState } from "react";
import Link from "next/link";

export default function PropertyForm({ initialData }) {
    const [submitting, setSubmitting] = useState(false);

    // If initialData exists, we are editing.
    const action = initialData
        ? updateProperty.bind(null, initialData.id)
        : createProperty;

    // Simple image preview logic if needed, but for now just input
    // initialData.images is array, we focus on first one for simple input
    const defaultImage = initialData?.images?.[0]?.url || "";
    // amenities array -> comma separated string
    const defaultAmenities = initialData?.amenities?.map(a => a.name).join(", ") || "";

    return (
        <form action={action} onSubmit={() => setSubmitting(true)} className="space-y-8 divide-y divide-gray-200 bg-white p-6 shadow rounded-lg">
            <div className="space-y-8 divide-y divide-gray-200">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {initialData ? "Edit Property" : "New Property"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Fill in the details for the property listing.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                        <div className="sm:col-span-4">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    required
                                    defaultValue={initialData?.title}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <div className="mt-1">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    required
                                    defaultValue={initialData?.description}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (e.g. Dubai Marina)</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="location"
                                    id="location"
                                    required
                                    defaultValue={initialData?.location}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (AED)</label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="price"
                                    id="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    defaultValue={initialData?.price}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="area" className="block text-sm font-medium text-gray-700">Area (sqft)</label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="area"
                                    id="area"
                                    required
                                    min="0"
                                    step="0.01"
                                    defaultValue={initialData?.area}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Bedrooms</label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="bedrooms"
                                    id="bedrooms"
                                    required
                                    min="0"
                                    defaultValue={initialData?.bedrooms ?? 1}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Bathrooms</label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="bathrooms"
                                    id="bathrooms"
                                    required
                                    min="0"
                                    defaultValue={initialData?.bathrooms ?? 1}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <div className="mt-1">
                                <select
                                    id="status"
                                    name="status"
                                    required
                                    defaultValue={initialData?.status ?? "FOR_SALE"}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                >
                                    <option value="FOR_SALE">For Sale</option>
                                    <option value="FOR_RENT">For Rent</option>
                                    <option value="SOLD">Sold</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Main Image URL</label>
                            <div className="mt-1">
                                <input
                                    type="url"
                                    name="imageUrl"
                                    id="imageUrl"
                                    placeholder="https://example.com/image.jpg"
                                    defaultValue={defaultImage}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">Provide a direct link to an image.</p>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">Amenities</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="amenities"
                                    id="amenities"
                                    placeholder="Pool, Gym, Balcony"
                                    defaultValue={defaultAmenities}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">Comma-separated list.</p>
                        </div>

                        <div className="sm:col-span-6">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="featured"
                                        name="featured"
                                        type="checkbox"
                                        defaultChecked={initialData?.featured}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="featured" className="font-medium text-gray-700">Featured Property</label>
                                    <p className="text-gray-500">Show this property on the Featured Properties page.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="pt-5">
                    <div className="flex justify-end">
                        <Link
                            href="/admin/properties"
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
            </div>
        </form>
    );
}
