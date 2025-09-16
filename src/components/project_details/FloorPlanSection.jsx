'use client';
import { useState } from 'react';
import Image from 'next/image';

const FloorPlanSection = ({ property }) => {
    // Get unit blocks from Reelly API
    const unitBlocks = property.unit_blocks || [];
    
    const tabs = unitBlocks.length > 0 ? unitBlocks.map(block => block.name) : ['Floor Plans'];
    const [activeTab, setActiveTab] = useState(tabs[0]);

    const currentBlock = unitBlocks.find(block => block.name === activeTab) || {};
    
    // Try to get image from typical_unit_image_url
    let floorPlanImage = "/project_detail_images/design.jpg";
    try {
        if (currentBlock.typical_unit_image_url) {
            const imageData = JSON.parse(currentBlock.typical_unit_image_url);
            if (Array.isArray(imageData) && imageData.length > 0) {
                floorPlanImage = imageData[0].url;
            }
        }
    } catch (e) {
        console.error("Error parsing floor plan image:", e);
    }

    return (
        <section className="px-4 py-12 md:px-16 bg-white" dir="ltr">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                Floor Plans of {property.name || "Project"}
            </h2>

            {/* Tab Buttons */}
            {tabs.length > 1 && (
                <div className="flex space-x-4 mb-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-md text-sm font-medium border ${activeTab === tab
                                    ? 'bg-sky-500 text-white'
                                    : 'border-sky-300 text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            {/* Card */}
            <div className="bg-white border rounded-xl shadow-md p-6 md:flex gap-6">
                <div className="flex-shrink-0">
                    <Image
                        src={floorPlanImage}
                        alt={`${activeTab} floor plan`}
                        width={300}
                        height={300}
                        className="rounded-md object-contain w-full h-auto"
                    />
                </div>

                <div className="mt-4 md:mt-0 flex flex-col justify-between flex-grow">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">{activeTab}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Price: AED {currentBlock.units_price_from_aed?.toLocaleString() || "N/A"}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        {property.layouts_pdf && (
                            <a
                                href={property.layouts_pdf}
                                target="_blank"
                                className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md text-sm font-medium transition-all text-center"
                            >
                                Open All Floor Plans
                            </a>
                        )}
                        {property.brochure_url && (
                            <a
                                href={property.brochure_url}
                                target="_blank"
                                className="border border-sky-500 hover:bg-sky-100 text-sky-600 px-5 py-2 rounded-md text-sm font-medium transition-all text-center"
                            >
                                Download Brochure
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FloorPlanSection;