'use client';
import React from "react";

const BuildingInformation = ({ property }) => {
    const building = property.building_info || {};
    return (
        <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Building Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-700">
                <div>
                    <strong className="block text-gray-600">Building Name</strong>
                    {building.name || "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Total Parking Spaces</strong>
                    {building.total_parking_space || "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Total Floors</strong>
                    {building.floors || "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Total Building Area</strong>
                    {building.total_building_area ? `${building.total_building_area.toLocaleString()} sqft` : "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Retail Centres</strong>
                    {building.shops || "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Elevators</strong>
                    {building.elevators || "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Swimming Pools</strong>
                    {building.swimming_pools || "N/A"}
                </div>
            </div>
        </section>
    );
};

export default BuildingInformation;
