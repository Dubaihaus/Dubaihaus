'use client';
import React from "react";

const PropertyInformation = ({ property }) => {
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-700">
                <div>
                    <strong className="block text-gray-600">Type</strong>
                    {property.type?.sub || "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Furnishing</strong>
                    {property.details?.is_furnished ? "Furnished" : "Unfurnished"}
                </div>
                <div>
                    <strong className="block text-gray-600">Purpose</strong>
                    {property.purpose ? property.purpose.replace("-", " ") : "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">TruCheck™ on</strong>
                    {property.verification?.truchecked_at ? new Date(property.verification.truchecked_at).toLocaleDateString() : "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Reference no.</strong>
                    {property.reference_number || "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Added on</strong>
                    {property.meta?.created_at ? new Date(property.meta.created_at).toLocaleDateString() : "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Completion</strong>
                    {property.details?.completion_status || "N/A"}
                </div>
                <div>
                    <strong className="block text-gray-600">Handover date</strong>
                    {property.details?.completion_details?.completion_date ?
                        new Date(property.details.completion_details.completion_date).toLocaleString('default', { month: 'short', year: 'numeric' }) : "N/A"}
                </div>
            </div>
        </section>
    );
};

export default PropertyInformation;
