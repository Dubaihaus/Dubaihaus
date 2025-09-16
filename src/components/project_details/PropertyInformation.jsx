'use client';
import React from "react";

const PropertyInformation = ({ property }) => {
    const info = [
        {
            label: "Type",
            value: property.unit_blocks?.[0]?.unit_type || "N/A",
            icon: "🏢"
        },
        {
            label: "Furnishing",
            value: property.furnishing || "N/A",
            icon: "🛋️"
        },
        {
            label: "Status",
            value: property.status || "N/A",
            icon: "🎯"
        },
        {
            label: "Sale Status",
            value: property.sale_status || "N/A",
            icon: "✅"
        },
        {
            label: "Reference no.",
            value: property.id || "N/A",
            icon: "🔖"
        },
        {
            label: "Completion Date",
            value: property.completion_datetime
                ? new Date(property.completion_datetime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : "N/A",
            icon: "📅"
        },
        {
            label: "Area",
            value: property.area || "N/A",
            icon: "🏗️"
        },
        {
            label: "Service Charge",
            value: property.service_charge || "N/A",
            icon: "💰"
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