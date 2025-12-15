"use client";
import Link from "next/link";
import { useState } from "react";

export default function PropertyOverview({ property }) {
    const details = property.details || {};
    const overviewTitle = details.overviewTitle || `About ${property.title}`;
    const overviewText = details.overviewText || property.description || "No description available.";

    // Facts list
    const facts = [
        { label: "Starting Price", value: property.price ? `AED ${property.price.toLocaleString()}` : null },
        { label: "Area", value: property.area ? `${property.area} sqft` : null },
        { label: "Bedrooms", value: property.bedrooms ? `${property.bedrooms}` : null },
        { label: "Bathrooms", value: property.bathrooms ? `${property.bathrooms}` : null },
        { label: "Property Type", value: property.types?.length > 0 ? property.types.map(t => t.name).join(", ") : "Residential" },
        { label: "Developer", value: details.developerName },
        { label: "Location", value: property.location },
        { label: "Status", value: details.saleStatus || property.status?.replace("_", " ") },
        { label: "Completion", value: details.completionDate ? new Date(details.completionDate).toLocaleDateString() : null },
    ].filter(f => f.value);

    const [expanded, setExpanded] = useState(false);
    const isLongText = overviewText.length > 400;

    return (
        <section className="bg-white px-4 md:px-12 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">{overviewTitle}</h2>
                <Link
                    href="#contact"
                    className="flex items-center gap-2 text-sky-600 font-medium hover:underline"
                >
                    <span className="inline-flex w-8 h-8 rounded-full bg-sky-600 text-white items-center justify-center">&gt;</span>
                    <span>Enquire Now</span>
                </Link>
            </div>

            <div className="text-gray-700 leading-relaxed space-y-3">
                <p className={`${!expanded && isLongText ? 'line-clamp-5' : ''} whitespace-pre-line`}>
                    {overviewText}
                </p>
                {isLongText && (
                    <button onClick={() => setExpanded(!expanded)} className="text-sky-600 text-sm font-semibold hover:underline">
                        {expanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>

            {facts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
                    {facts.map((f, i) => (
                        <div key={i} className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-lg p-4">
                            <span className="text-sky-600 font-semibold">{f.label}:</span>
                            <span className="text-gray-800">{f.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
