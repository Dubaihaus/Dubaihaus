'use client';
import Image from 'next/image';

const ProjectDetailsHighlights = ({ property }) => {
    const location = property?.location?.community?.name || "Dubai";
    const propertyTypes = property?.type?.sub || "Apartments";
    const description = property?.description || "";
    const size = property?.area?.built_up ? `${property.area.built_up} ${property.area.unit}` : "Size TBA";
    const completionDate = property?.details?.completion_details?.completion_date
        ? new Date(property.details.completion_details.completion_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "TBA";
    const price = property?.price ? `AED ${property.price.toLocaleString()}` : "Price on request";

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
                            <li><strong>Average Size:</strong> {size}</li>
                            <li><strong>Starting Price:</strong> {price}</li>
                            <li><strong>Completion Due Date:</strong> {completionDate}</li>
                            <li><strong>Ownership:</strong> 100% Foreign Ownership</li>
                            <li><strong>Commission:</strong> No commission, direct from developer</li>
                            <li><strong>ROI:</strong> High return on investment</li>
                        </ul>

                        {/* Amenities */}
                        <div>
                            <h3 className="text-xl font-semibold mt-6 mb-2">🌟 Exclusive Amenities</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                <li>Basketball Court</li>
                                <li>Kid's Play Area</li>
                                <li>Outdoor Pool Deck</li>
                                <li>Outdoor Fitness Area</li>
                                <li>Yoga Area</li>
                                <li>Outdoor Seating Area</li>
                            </ul>
                        </div>

                        {/* Location Access */}
                        <div>
                            <h3 className="text-xl font-semibold mt-6 mb-2">📍 Prime Location Access</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                <li>3 mins from Dubai Hills Mall</li>
                                <li>12 mins from Dubai Hills Golf Club</li>
                                <li>12 mins from Al Barsha Mall</li>
                                <li>15 mins from Mall of the Emirates</li>
                                <li>20 mins from Dubai Mall</li>
                            </ul>
                        </div>

                        {/* Brochure Button */}
                        <div>
                            <a
                                href={property?.meta?.url || "#"}
                                className="inline-block mt-4 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md transition-all"
                            >
                                📄 Download Free PDF Brochure
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="order-1 md:order-2">
                        <div className="bg-gray-100 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">💎 Why Choose Binghatti Hillviews?</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                <li>New Launch – Be the first to own</li>
                                <li>Freehold Property</li>
                                <li>Upcoming Metro line nearby</li>
                                <li>Direct from the Developer</li>
                                <li>Ideal for both investors & residents</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProjectDetailsHighlights;
