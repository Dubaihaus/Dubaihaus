'use client';
import { useState } from 'react';
import Image from 'next/image';

const ProjectAboutSection = ({ property }) => {
    // Get all images from Reelly API
    const allImages = [
        ...(property.architecture || []).map(img => img.url),
        ...(property.interior || []).map(img => img.url),
        ...(property.lobby || []).map(img => img.url),
        property.cover?.url
    ].filter(Boolean);

    const title = property.name || "the Project";
    const description = property.overview || "No detailed description available.";

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showImages = allImages.slice(0, 7); // show first 7
    const remainingImages = allImages.slice(7); // for popover
    const hasMoreImages = allImages.length > 8;

    return (
        <section className="bg-white px-4 md:px-12 py-12" dir="ltr">

            {/* Title + CTA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
                    About {title}
                </h2>
                <div className="flex items-center gap-2 text-sky-600 font-medium cursor-pointer hover:underline">
                    <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center">
                        &gt;
                    </div>
                    <span>Request Available Units & Prices</span>
                </div>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {showImages.map((img, idx) => (
                    <Image
                        key={idx}
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        width={400}
                        height={300}
                        className="rounded-lg object-cover w-full h-52"
                    />
                ))}

                {hasMoreImages && (
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className="relative cursor-pointer rounded-lg overflow-hidden group"
                    >
                        <Image
                            src={allImages[7]}
                            alt="See more"
                            width={400}
                            height={300}
                            className="object-cover w-full h-52 group-hover:brightness-75 transition-all"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold text-lg">
                            +{remainingImages.length} More
                        </div>
                    </div>
                )}
            </div>

            {/* Popover Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 text-black text-xl font-bold hover:text-red-500"
                        >
                            ×
                        </button>
                        <h3 className="text-xl font-semibold mb-4">Gallery</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {remainingImages.map((img, idx) => (
                                <Image
                                    key={idx}
                                    src={img}
                                    alt={`Extra Image ${idx + 1}`}
                                    width={400}
                                    height={300}
                                    className="rounded-lg object-cover w-full h-48"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProjectAboutSection;