'use client';
import React from "react";

const PropertyInformation = ({ property }) => {
    const info = [
        {
            label: "Type",
            value: property.type?.sub || "N/A",
            icon: "🏢"
        },
        {
            label: "Furnishing",
            value: property.details?.is_furnished ? "Furnished" : "Unfurnished",
            icon: "🛋️"
        },
        {
            label: "Purpose",
            value: property.purpose ? property.purpose.replace("-", " ") : "N/A",
            icon: "🎯"
        },
        {
            label: "TruCheck™ on",
            value: property.verification?.truchecked_at
                ? new Date(property.verification.truchecked_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : "N/A",
            icon: "✅"
        },
        {
            label: "Reference no.",
            value: property.reference_number || "N/A",
            icon: "🔖"
        },
        {
            label: "Added on",
            value: property.meta?.created_at
                ? new Date(property.meta.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : "N/A",
            icon: "📅"
        },
        {
            label: "Completion",
            value: property.details?.completion_status || "N/A",
            icon: "🏗️"
        },
        {
            label: "Handover date",
            value: property.details?.completion_details?.completion_date
                ? new Date(property.details.completion_details.completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                : "N/A",
            icon: "📦"
        }
    ];

    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Property Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-gray-700">
                {info.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-gray-50 p-4 rounded-md hover:bg-gray-100 transition">
                        <div className="text-xl">{item.icon}</div>
                        <div>
                            <p className="text-gray-600 font-medium">{item.label}</p>
                            <p className="text-gray-900">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PropertyInformation;
