"use client";

import { createProperty, updateProperty } from "@/app/(admin)/admin/properties/actions";
import { useState } from "react";
import Link from "next/link";
import { Trash, Plus } from "lucide-react";

// Tab Components
function TabButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium border-b-2 focus:outline-none ${active
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
        >
            {label}
        </button>
    );
}

export default function PropertyForm({ initialData }) {
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");

    // Initial State Setup
    const [gallery, setGallery] = useState(initialData?.gallery || []);
    const [types, setTypes] = useState(initialData?.types || []);
    const [features, setFeatures] = useState(initialData?.features || []);

    // Payment Plan (assume single plan for now, as UI only shows one)
    const [paymentPlan, setPaymentPlan] = useState(initialData?.paymentPlans?.[0] || null);

    // Details state (merged from initialData.details)
    const [details, setDetails] = useState(initialData?.details || {});

    // Action Binding
    const action = initialData
        ? updateProperty.bind(null, initialData.id)
        : createProperty;

    const defaultImage = initialData?.images?.[0]?.url || "";
    const defaultAmenities = initialData?.amenities?.map(a => a.name).join(", ") || "";

    // Handlers
    const addGalleryImage = (category) => {
        setGallery([...gallery, { url: "", category, position: gallery.length }]);
    };

    const removeGalleryImage = (index) => {
        setGallery(gallery.filter((_, i) => i !== index));
    };

    const updateGalleryImage = (index, field, value) => {
        const newGallery = [...gallery];
        newGallery[index][field] = value;
        setGallery(newGallery);
    };

    const addType = () => {
        setTypes([...types, { name: "", sizeFrom: "", sizeTo: "", priceFrom: "", position: types.length }]);
    };

    const removeType = (index) => {
        setTypes(types.filter((_, i) => i !== index));
    };

    const updateType = (index, field, value) => {
        const newTypes = [...types];
        newTypes[index][field] = value;
        setTypes(newTypes);
    };

    const addFeature = () => {
        setFeatures([...features, { text: "", position: features.length }]);
    };

    const removeFeature = (index) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const updateFeature = (index, value) => {
        const newFeatures = [...features];
        newFeatures[index].text = value;
        setFeatures(newFeatures);
    };

    // Payment Plan Helpers
    const ensurePaymentPlan = () => {
        if (!paymentPlan) {
            setPaymentPlan({ title: "", subtitle: "", steps: [] });
        }
    };

    const addPaymentStep = () => {
        ensurePaymentPlan();
        setPaymentPlan(prev => ({
            ...prev,
            steps: [...(prev?.steps || []), { percent: "", label: "", position: (prev?.steps?.length || 0) }]
        }));
    };

    const removePaymentStep = (index) => {
        setPaymentPlan(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }));
    };

    const updatePaymentStep = (index, field, value) => {
        const newSteps = [...paymentPlan.steps];
        newSteps[index][field] = value;
        setPaymentPlan({ ...paymentPlan, steps: newSteps });
    };

    return (
        <form
            action={action}
            onSubmit={(e) => {
                setSubmitting(true);
                // We don't prevent default, but we need to inject our JSON fields
                // Wait, React usage of `action` prop handles FormData.
                // But we need to append our JSON data to the formData.
                // The cleanest way in Next.js Server Actions with complex client state 
                // is to use hidden inputs for the JSON strings.
            }}
            className="space-y-8 bg-white p-6 shadow rounded-lg"
        >
            {/* Headers */}
            <div className="border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {initialData ? "Edit Property" : "New Property"}
                </h3>
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    <TabButton active={activeTab === "basic"} label="Basic Info" onClick={() => setActiveTab("basic")} />
                    <TabButton active={activeTab === "details"} label="Details & Overview" onClick={() => setActiveTab("details")} />
                    <TabButton active={activeTab === "features"} label="Amenities & Features" onClick={() => setActiveTab("features")} />
                    <TabButton active={activeTab === "types"} label="Unit Types" onClick={() => setActiveTab("types")} />
                    <TabButton active={activeTab === "payment"} label="Payment Plan" onClick={() => setActiveTab("payment")} />
                    <TabButton active={activeTab === "gallery"} label="Photo Gallery" onClick={() => setActiveTab("gallery")} />
                </nav>
            </div>

            {/* Hidden JSON Inputs for Server Action */}
            <input type="hidden" name="details" value={JSON.stringify(details)} />
            <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
            <input type="hidden" name="types" value={JSON.stringify(types)} />
            <input type="hidden" name="features" value={JSON.stringify(features)} />
            <input type="hidden" name="paymentPlan" value={JSON.stringify(paymentPlan)} />


            {/* 1. BASIC INFO */}
            <div className={activeTab === "basic" ? "block space-y-6" : "hidden"}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" name="title" required defaultValue={initialData?.title} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" rows={4} required defaultValue={initialData?.description} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input type="text" name="location" required defaultValue={initialData?.location} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Price (AED)</label>
                        <input type="number" name="price" required min="0" defaultValue={initialData?.price} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Area (sqft)</label>
                        <input type="number" name="area" required min="0" defaultValue={initialData?.area} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                        <input type="number" name="bedrooms" required min="0" defaultValue={initialData?.bedrooms ?? 1} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                        <input type="number" name="bathrooms" required min="0" defaultValue={initialData?.bathrooms ?? 1} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" required defaultValue={initialData?.status ?? "FOR_SALE"} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                            <option value="FOR_SALE">For Sale</option>
                            <option value="FOR_RENT">For Rent</option>
                            <option value="SOLD">Sold</option>
                        </select>
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700">Main Image URL (Legacy/Cover)</label>
                        <input type="url" name="imageUrl" defaultValue={defaultImage} placeholder="https://..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>
                    <div className="sm:col-span-6">
                        <div className="flex items-center">
                            <input id="featured" name="featured" type="checkbox" defaultChecked={initialData?.featured} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">Featured Property</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. DETAILS */}
            <div className={activeTab === "details" ? "block space-y-6" : "hidden"}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Developer Name</label>
                        <input type="text" value={details.developerName || ""} onChange={e => setDetails({ ...details, developerName: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Overview Section Title</label>
                        <input type="text" value={details.overviewTitle || ""} onChange={e => setDetails({ ...details, overviewTitle: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" placeholder="Overview of ..." />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Overview Text</label>
                        <textarea rows={5} value={details.overviewText || ""} onChange={e => setDetails({ ...details, overviewText: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Construction Status</label>
                        <input type="text" value={details.constructionStatus || ""} onChange={e => setDetails({ ...details, constructionStatus: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" placeholder="Under Construction" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sale Status</label>
                        <input type="text" value={details.saleStatus || ""} onChange={e => setDetails({ ...details, saleStatus: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" placeholder="Selling Out Fast" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Furnishing</label>
                        <input type="text" value={details.furnishing || ""} onChange={e => setDetails({ ...details, furnishing: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" placeholder="Fully Furnished" />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Location Description</label>
                        <textarea rows={3} value={details.locationDescription || ""} onChange={e => setDetails({ ...details, locationDescription: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                    </div>
                </div>
            </div>

            {/* 3. AMENITIES */}
            <div className={activeTab === "features" ? "block space-y-6" : "hidden"}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Legacy Amenities (Comma separated)</label>
                        <input type="text" name="amenities" defaultValue={defaultAmenities} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                        <p className="text-xs text-gray-500 mt-1">These appear as simple tags. Use 'Signature Features' below for the new highlight section.</p>
                    </div>

                    <hr />

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-900">Signature Features (Bullet Points)</label>
                            <button type="button" onClick={addFeature} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                                <Plus className="w-3 h-3 mr-1" /> Add Feature
                            </button>
                        </div>
                        <div className="space-y-2">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={feature.text}
                                        onChange={e => updateFeature(idx, e.target.value)}
                                        placeholder="e.g. Private Beach Access"
                                        className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2"
                                    />
                                    <button type="button" onClick={() => removeFeature(idx)} className="text-red-600 hover:text-red-800 p-2"><Trash className="w-4 h-4" /></button>
                                </div>
                            ))}
                            {features.length === 0 && <p className="text-sm text-gray-500 italic">No features added.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. UNIT TYPES */}
            <div className={activeTab === "types" ? "block space-y-6" : "hidden"}>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Unit Types</h4>
                    <button type="button" onClick={addType} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                        <Plus className="w-3 h-3 mr-1" /> Add Type
                    </button>
                </div>
                <div className="space-y-4">
                    {types.map((type, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-gray-50 p-3 rounded-md">
                            <input type="text" placeholder="Name (e.g. 1BR)" value={type.name} onChange={e => updateType(idx, 'name', e.target.value)} className="block w-full sm:w-1/4 rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                            <input type="text" placeholder="Size From" value={type.sizeFrom || ""} onChange={e => updateType(idx, 'sizeFrom', e.target.value)} className="block w-full sm:w-1/6 rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                            <input type="text" placeholder="Size To" value={type.sizeTo || ""} onChange={e => updateType(idx, 'sizeTo', e.target.value)} className="block w-full sm:w-1/6 rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                            <input type="text" placeholder="Price From" value={type.priceFrom || ""} onChange={e => updateType(idx, 'priceFrom', e.target.value)} className="block w-full sm:w-1/6 rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                            <button type="button" onClick={() => removeType(idx)} className="text-red-600 hover:text-red-800 p-2"><Trash className="w-4 h-4" /></button>
                        </div>
                    ))}
                    {types.length === 0 && <p className="text-sm text-gray-500 italic">No unit types added.</p>}
                </div>
            </div>

            {/* 5. PAYMENT PLAN */}
            <div className={activeTab === "payment" ? "block space-y-6" : "hidden"}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">Plan Title (Banner)</label>
                                {!paymentPlan && (
                                    <button type="button" onClick={() => setPaymentPlan({ title: "Payment Plan", subtitle: "", steps: [] })} className="text-xs text-indigo-600">Create Plan</button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={paymentPlan?.title || ""}
                                onChange={e => { ensurePaymentPlan(); setPaymentPlan({ ...paymentPlan, title: e.target.value }); }}
                                disabled={!paymentPlan}
                                placeholder="e.g. 50/50 Payment Plan"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                            <input
                                type="text"
                                value={paymentPlan?.subtitle || ""}
                                onChange={e => { ensurePaymentPlan(); setPaymentPlan({ ...paymentPlan, subtitle: e.target.value }); }}
                                disabled={!paymentPlan}
                                placeholder="e.g. With 2 years post-handover"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2"
                            />
                        </div>
                    </div>

                    {paymentPlan && (
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium text-gray-900">Payment Steps</h4>
                                <button type="button" onClick={addPaymentStep} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                                    <Plus className="w-3 h-3 mr-1" /> Add Step
                                </button>
                            </div>
                            <div className="space-y-2">
                                {paymentPlan.steps?.map((step, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input type="text" placeholder="20%" value={step.percent} onChange={e => updatePaymentStep(idx, 'percent', e.target.value)} className="w-20 rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                                        <input type="text" placeholder="On Booking" value={step.label} onChange={e => updatePaymentStep(idx, 'label', e.target.value)} className="flex-1 rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                                        <button type="button" onClick={() => removePaymentStep(idx)} className="text-red-600 hover:text-red-800 p-2"><Trash className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 6. PHOTO GALLERY */}
            <div className={activeTab === "gallery" ? "block space-y-6" : "hidden"}>
                {/* Exteriors */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Exteriors</h4>
                        <button type="button" onClick={() => addGalleryImage("EXTERIOR")} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                            <Plus className="w-3 h-3 mr-1" /> Add Image
                        </button>
                    </div>
                    <div className="space-y-2">
                        {gallery.filter(g => g.category === "EXTERIOR").map((img, idx) => {
                            const realIdx = gallery.indexOf(img);
                            return (
                                <div key={realIdx} className="flex gap-2">
                                    <input type="url" placeholder="https://..." value={img.url} onChange={e => updateGalleryImage(realIdx, 'url', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                                    <button type="button" onClick={() => removeGalleryImage(realIdx)} className="text-red-600 hover:text-red-800 p-2"><Trash className="w-4 h-4" /></button>
                                </div>
                            );
                        })}
                        {gallery.filter(g => g.category === "EXTERIOR").length === 0 && <p className="text-sm text-gray-500 italic">No exterior images.</p>}
                    </div>
                </div>

                <hr />

                {/* Interiors */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Interiors</h4>
                        <button type="button" onClick={() => addGalleryImage("INTERIOR")} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                            <Plus className="w-3 h-3 mr-1" /> Add Image
                        </button>
                    </div>
                    <div className="space-y-2">
                        {gallery.filter(g => g.category === "INTERIOR").map((img, idx) => {
                            const realIdx = gallery.indexOf(img);
                            return (
                                <div key={realIdx} className="flex gap-2">
                                    <input type="url" placeholder="https://..." value={img.url} onChange={e => updateGalleryImage(realIdx, 'url', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
                                    <button type="button" onClick={() => removeGalleryImage(realIdx)} className="text-red-600 hover:text-red-800 p-2"><Trash className="w-4 h-4" /></button>
                                </div>
                            );
                        })}
                        {gallery.filter(g => g.category === "INTERIOR").length === 0 && <p className="text-sm text-gray-500 italic">No interior images.</p>}
                    </div>
                </div>
            </div>

            <div className="pt-5 border-t border-gray-200 mt-8">
                <div className="flex justify-end">
                    <Link
                        href="/admin/properties"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                    >
                        {submitting ? "Saving..." : "Save Property"}
                    </button>
                </div>
            </div>
        </form>
    );
}
