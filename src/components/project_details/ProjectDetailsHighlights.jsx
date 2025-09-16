'use client';
import Image from 'next/image';

const ProjectDetailsHighlights = ({ property }) => {
    const location = property.area || "Dubai";
    const propertyTypes = property.unit_blocks?.map(block => block.unit_type).join(", ") || "Apartments";
    const description = property.overview || "";
    const completionDate = property.completion_datetime
        ? new Date(property.completion_datetime).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "TBA";
    const price = property.min_price_aed ? `AED ${property.min_price_aed.toLocaleString()}` : "Price on request";

    return (
        <>
            {/* Section 1: Project Highlights */}
            <section className="bg-white py-12 px-4 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6 order-2 md:order-1">
                        <h2 className="text-2xl font-bold text-gray-900">🏗️ Project Highlights</h2>

                        <ul className="list-disc pl-5 space-y-2 text-base text-gray-800">
                            <li><strong>Location:</strong> {location}</li>
                            <li><strong>Property Types:</strong> {propertyTypes}</li>
                            <li><strong>Starting Price:</strong> {price}</li>
                            <li><strong>Completion Due Date:</strong> {completionDate}</li>
                            <li><strong>Ownership:</strong> 100% Foreign Ownership</li>
                            <li><strong>Commission:</strong> No commission, direct from developer</li>
                            <li><strong>ROI:</strong> High return on investment</li>
                        </ul>

                        {/* Amenities */}
                        {property.facilities && property.facilities.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold mt-6 mb-2">🌟 Exclusive Amenities</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                    {property.facilities.slice(0, 6).map((facility, index) => (
                                        <li key={index}>{facility.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Location Access */}
                        {property.map_points && property.map_points.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold mt-6 mb-2">📍 Prime Location Access</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                    {property.map_points.slice(0, 5).map((point, index) => (
                                        <li key={index}>{point.name} ({point.distance_km} km)</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Brochure Button */}
                        {property.brochure_url && (
                            <div>
                                <a
                                    href={property.brochure_url}
                                    className="inline-block mt-4 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md transition-all"
                                >
                                    📄 Download Free PDF Brochure
                                </a>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="order-1 md:order-2">
                        <div className="bg-gray-100 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">💎 Why Choose {property.name}?</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                <li>New Launch – Be the first to own</li>
                                <li>Freehold Property</li>
                                <li>Direct from the Developer</li>
                                <li>Ideal for both investors & residents</li>
                                {property.has_escrow && <li>Escrow Account Protection</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProjectDetailsHighlights;