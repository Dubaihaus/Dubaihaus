'use client';
import React from "react";

const BuildingInformation = ({ property }) => {
    const buildingDetails = [
        { label: "Building Name", value: property.title || property?.rawData?.name || "N/A", icon: "🏙️" },
        { label: "Developer", value: property.developer || "N/A", icon: "🏢" },
        { label: "Completion Date", value: property.completion_date 
            ? new Date(property.completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : "N/A", icon: "📅" },
        { label: "Area", value: property.location || "N/A", icon: "📍" },
        { label: "Status", value: property.construction_status || "N/A", icon: "📊" },
        {  label: "Furnishing", value: property?.rawData?.furnishing || "N/A",  icon: "🛋️" },
        { label: "Service Charge", value: property?.rawData?.service_charge || "N/A", icon: "💰" }
    ];

    return (
        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">🏢 Building Information</h2>

            <ul className="space-y-5">
                {buildingDetails.map((item, index) => (
                    <li
                        key={index}
                        className="flex items-start gap-5 bg-gray-50 rounded-md p-4 hover:bg-gray-100 transition-all duration-200"
                    >
                        <div className="text-3xl">{item.icon}</div>
                        <div>
                            <p className="text-base font-semibold text-gray-700">{item.label}</p>
                            <p className="text-lg font-medium text-gray-900">{item.value}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default BuildingInformation;