
import { prisma } from "@/lib/prisma";
import PropertyCard from "@/components/PropertyCard";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

function normalizeManualProperty(p) {
    return {
        id: p.id,
        title: p.title,
        price: p.price,
        priceCurrency: "AED", // Manual properties assumed AED
        location: p.location,
        // Handle images: PropertyCard expects coverPhoto or media.photos[0]
        coverPhoto: p.images?.[0]?.url || "/project_detail_images/building.jpg",
        propertyType: "Property", // fallback
        bedroomsRange: p.bedrooms ? `${p.bedrooms} BR` : null,
        developer: "Private", // or Owner
        handoverDate: null,
        // Normalized city for grouping
        city: p.location.toLowerCase().includes("abu dhabi") ? "Abu Dhabi" : "Dubai", // Simple heuristic for manual
        source: 'ADMIN',
    };
}

function normalizeReellyProject(p) {
    return {
        id: p.id, // ID
        title: p.title,
        price: p.priceFrom ? parseFloat(p.priceFrom) : null,
        priceCurrency: p.currency,
        location: p.locationString || `${p.city}, ${p.area}`,
        coverPhoto: p.mainImageUrl || "/project_detail_images/building.jpg",
        propertyTypes: [], // ReellyProject doesn't store simple type string easily accessibly here unless we fetch relation
        bedroomsRange: (p.bedroomsMin && p.bedroomsMax) ? `${p.bedroomsMin}-${p.bedroomsMax} BR` : (p.bedroomsMin ? `${p.bedroomsMin} BR` : null),
        developer: p.developerName,
        handoverDate: p.handoverDate || p.completionDate,
        city: p.city || "Dubai",
        source: 'REELLY',
    };
}

export default async function FeaturedPropertiesPage({ params }) {
    // We need to resolve params if dynamic route, but here it is standard page. 
    // Wait, if it's under [locale], we need locale.
    // The user requirement said: "Route: /featured-properties".
    // Middleware handles rewrite.
    // We need to know locale for getTranslator. 
    // Usually we can get it from headers or params if available.
    // Since we are likely in src/app/featured-properties/page.js, there is no [locale] param unless we passed it.
    // But middleware sets 'x-next-locale' header.

    const headers = await import("next/headers");
    const locale = (await headers.headers()).get("x-next-locale") || "en";
    const t = await getTranslations(locale, "navbar"); // using navbar namespace for title or generic

    const [manualProps, reellyProjects] = await Promise.all([
        prisma.property.findMany({
            where: { featured: true },
            include: { images: true }
        }),
        prisma.reellyProject.findMany({
            where: { isFeatured: true }
        })
    ]);

    const allItems = [
        ...manualProps.map(normalizeManualProperty),
        ...reellyProjects.map(normalizeReellyProject)
    ];

    // Group by City
    const grouped = allItems.reduce((acc, item) => {
        const city = item.city || "Other";
        if (!acc[city]) acc[city] = [];
        acc[city].push(item);
        return acc;
    }, {});

    const cityKeys = Object.keys(grouped).sort();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        {t("featuredProperties")}
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                        Handpicked selection of the best properties and projects.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
                {cityKeys.length === 0 && (
                    <div className="text-center text-gray-500 py-20">
                        No featured properties found.
                    </div>
                )}

                {cityKeys.map(city => (
                    <section key={city}>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
                            {city}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {grouped[city].map((item, idx) => (
                                <PropertyCard
                                    key={`${item.id}-${idx}`}
                                    property={item}
                                    currency={item.priceCurrency}
                                    index={idx}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
