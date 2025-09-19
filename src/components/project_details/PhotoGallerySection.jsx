'use client';
import { useState } from 'react';
import Image from 'next/image';

const PhotoGallerySection = ({ property }) => {
    // Get images from Reelly API by category
    const exteriorUrls = (property?.rawData?.architecture || []).map(img => img.url);
const interiorUrls = (property?.rawData?.interior || []).map(img => img.url);
    
    // If no specific category images, use all available images
    const allImages = (property?.media?.photos?.length ? property.media.photos : [
   ...exteriorUrls,
   ...interiorUrls,
   ...(property?.rawData?.lobby || []).map(img => img.url),
   property?.rawData?.cover_image?.url,
 ]).filter(Boolean);

    const hasInterior = interiorUrls.length > 0;
    const hasExterior = exteriorUrls.length > 0;

    const [activeTab, setActiveTab] = useState(hasExterior ? 'exterior' : (hasInterior ? 'interior' : 'all'));
    const [selectedImage, setSelectedImage] = useState(allImages[0] || "/project_detail_images/building.jpg");

    const images = activeTab === 'exterior' ? exteriorUrls : 
                  activeTab === 'interior' ? interiorUrls : 
                  allImages;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const defaultImg = images[0] || "/project_detail_images/building.jpg";
        setSelectedImage(defaultImg);
    };

    return (
        <section className="px-4 py-12 md:px-16 bg-white" dir="ltr">
            {/* Top Title + Tabs */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    Photo Gallery
                </h2>

                {/* Buttons */}
                <div className="flex space-x-2">
                    {hasExterior && (
                        <button
                            onClick={() => handleTabChange('exterior')}
                            className={`px-4 py-1 border rounded-md text-sm font-medium ${activeTab === 'exterior'
                                    ? 'bg-sky-500 text-white'
                                    : 'border-sky-300 text-gray-700'
                                }`}
                        >
                            Exteriors
                        </button>
                    )}
                    {hasInterior && (
                        <button
                            onClick={() => handleTabChange('interior')}
                            className={`px-4 py-1 border rounded-md text-sm font-medium ${activeTab === 'interior'
                                    ? 'bg-sky-500 text-white'
                                    : 'border-sky-300 text-gray-700'
                                }`}
                        >
                            Interiors
                        </button>
                    )}
                    <button
                        onClick={() => handleTabChange('all')}
                        className={`px-4 py-1 border rounded-md text-sm font-medium ${activeTab === 'all'
                                ? 'bg-sky-500 text-white'
                                : 'border-sky-300 text-gray-700'
                            }`}
                    >
                        All Photos
                    </button>
                </div>
            </div>

            {/* Main Large Image */}
            <div className="mb-4">
                <Image
                    src={selectedImage}
                    alt="Selected Gallery"
                    width={1000}
                    height={500}
                    className="w-full h-[400px] md:h-[500px] object-cover rounded-md transition-all duration-300"
                />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto">
                {images.map((img, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        className={`border-2 rounded-md overflow-hidden min-w-[100px] transition-all duration-300 ${selectedImage === img ? 'border-sky-500' : 'border-transparent'
                            }`}
                    >
                        <Image
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            width={120}
                            height={80}
                            className="object-cover w-[100px] h-[70px]"
                        />
                    </button>
                ))}
            </div>
        </section>
    );
};

export default PhotoGallerySection;