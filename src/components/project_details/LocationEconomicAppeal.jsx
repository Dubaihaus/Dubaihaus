'use client';
import Image from 'next/image';

const LocationEconomicAppeal = ({ property }) => {
    // Use a few photos from the API for the appeal section
    const appealImages = [
        property.cover?.url,
        ...(property.architecture || []).slice(0, 2).map(img => img.url)
    ].filter(Boolean);

    // Construct "location/economic appeal" highlights from Reelly API data
    const locationAppeal = [
        {
            title: "Prime Location",
            description: property.area || "Not specified"
        },
        {
            title: "Developer",
            description: property.developer || "Not specified"
        },
        {
            title: "Completion Date",
            description: property.completion_datetime
                ? new Date(property.completion_datetime).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : "TBA"
        },
        {
            title: "Starting Price",
            description: property.min_price_aed ? `AED ${property.min_price_aed.toLocaleString()}` : "Price on request"
        },
        {
            title: "Property Types",
            description: property.unit_blocks?.map(block => block.unit_type).join(", ") || "Not specified"
        }
    ];

    const title = property.name || "Project";
    return (
        <section className="px-4 py-12 md:px-16 bg-white" dir="ltr">
            {/* Title + Images Row */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
                {/* Heading */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 md:w-1/2">
                    Location and{' '}
                    <span className="text-sky-600">Economic Appeal</span> of {title}
                </h2>

                {/* Images beside title */}
                <div className="grid grid-cols-3 gap-2 md:w-1/2">
                    {appealImages.map((img, idx) => (
                        <Image
                            key={idx}
                            src={img}
                            alt={`Appeal ${idx + 1}`}
                            width={100}
                            height={100}
                            className="rounded-lg object-cover w-full h-24 md:h-28"
                        />
                    ))}
                </div>
            </div>

            {/* Text Content */}
            <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
                {locationAppeal.map((item, idx) => (
                    <div key={idx}>
                        <h4 className="font-semibold text-base text-gray-800 mb-1">
                            {item.title}
                        </h4>
                        <p className="text-gray-600">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default LocationEconomicAppeal;