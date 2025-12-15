"use client";
import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

export default function SignatureFeatures({ property }) {
    const details = property.details || {};
    const features = property.features || [];
    const images = property.gallery?.filter(img => img.category === "FEATURE" || img.category === "AMENITY") || [];

    // Fallback images from main gallery if no specific feature images
    // Wait, let's just use what we have.
    // If no features and no legacy amenities, return null

    const legacyAmenities = property.amenities || [];

    if (features.length === 0 && legacyAmenities.length === 0) return null;

    const title = details.signatureTitle || "Signature Features & Amenities";
    const subtitle = details.signatureSubtitle || "Experience a lifestyle of luxury and convenience.";

    const [idx, setIdx] = useState(0);
    const hasImages = images.length > 0;

    const next = () => setIdx((i) => (i + 1) % images.length);
    const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

    return (
        <section className="bg-gray-50 py-12">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT: Carousel (Only show if we have images in FEATURE category, or fallback to something) */}
                    <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm">
                        <div className="relative w-full h-[370px] md:h-[420px]">
                            {hasImages ? (
                                <Image
                                    key={idx}
                                    src={images[idx].url}
                                    alt={`Amenity ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                // Fallback to a placeholder or property main image if really needed, or just hide left side? 
                                // Better to show something generic if possible or just the main image.
                                // Let's use property main image if no feature images
                                <Image
                                    src={property.images?.[0]?.url || "/project_detail_images/building.jpg"}
                                    alt="Property Feature"
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        {hasImages && images.length > 1 && (
                            <>
                                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md">‹</button>
                                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md">›</button>
                            </>
                        )}
                    </div>

                    {/* RIGHT: List */}
                    <div>
                        <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 leading-tight">{title}</h2>
                        <p className="text-gray-600 mt-3">{subtitle}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                            {/* New Features */}
                            {features.map((f, i) => (
                                <div key={i} className="flex items-start gap-2 rounded-lg bg-white shadow-sm border border-gray-100 p-3">
                                    <CheckCircle className="mt-0.5 h-5 w-5 text-sky-600 shrink-0" />
                                    <div className="text-sm font-medium text-gray-800">{f.text}</div>
                                </div>
                            ))}
                            {/* Legacy Amenities */}
                            {legacyAmenities.map((a, i) => (
                                <div key={`legacy-${i}`} className="flex items-start gap-2 rounded-lg bg-white shadow-sm border border-gray-100 p-3">
                                    <CheckCircle className="mt-0.5 h-5 w-5 text-sky-600 shrink-0" />
                                    <div className="text-sm font-medium text-gray-800">{a.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
