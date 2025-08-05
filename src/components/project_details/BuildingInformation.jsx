'use client';
import React from "react";

const BuildingInformation = ({ property }) => {
    const building = property.building_info || {};

    const buildingDetails = [
        { label: "Building Name", value: building.name || "N/A", icon: "🏙️" },
        { label: "Total Parking Spaces", value: building.total_parking_space || "N/A", icon: "🚗" },
        { label: "Total Floors", value: building.floors || "N/A", icon: "🏢" },
        {
            label: "Total Building Area",
            value: building.total_building_area
                ? `${building.total_building_area.toLocaleString()} sqft`
                : "N/A",
            icon: "📐"
        },
        { label: "Retail Centres", value: building.shops || "N/A", icon: "🛍️" },
        { label: "Elevators", value: building.elevators || "N/A", icon: "🛗" },
        { label: "Swimming Pools", value: building.swimming_pools || "N/A", icon: "🏊" }
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
