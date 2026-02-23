import { prisma } from "@/lib/prisma";
import PropertyCard from "@/components/PropertyCard";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { hydrateProjectsBatch } from "@/lib/projectDataHydration";

export const dynamic = "force-dynamic";

function normalizeManualProperty(p) {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    priceCurrency: "AED",
    location: p.location,
    coverPhoto: p.images?.[0]?.url || "/project_detail_images/building.jpg",
    propertyType: "Property",
    bedroomsRange: p.bedrooms ? `${p.bedrooms} BR` : null,
    developer: "Private",
    handoverDate: null,
    city: p.location?.toLowerCase().includes("abu dhabi") ? "Abu Dhabi" : "Dubai",
    source: "ADMIN",
  };
}

function normalizeReellyProject(p) {
  let city = (p.city || "").trim();

  if (!city || /^\d+$/.test(city) || city.length < 3) {
    const textToInspect = [
      p.locationString || "",
      p.region || "",
      p.district || "",
      p.area || ""
    ].join(" ").toLowerCase();

    if (textToInspect.includes("abu dhabi")) {
      city = "Abu Dhabi";
    } else if (textToInspect.includes("dubai")) {
      city = "Dubai";
    } else if (textToInspect.includes("sharjah")) {
      city = "Sharjah";
    } else if (textToInspect.includes("ras al khaimah") || textToInspect.includes("rak")) {
      city = "Ras Al Khaimah";
    } else if (textToInspect.includes("ajman")) {
      city = "Ajman";
    } else {
      city = "Other";
    }
  }

  // Safety net
  if (!city || /^\d+$/.test(city)) {
    city = "Other";
  }

  const rawPropertyTypes = Array.isArray(p.propertyTypes) ? p.propertyTypes : [];
  const propertyTypeNames = Array.from(
    new Set(
      rawPropertyTypes.map((pt) => {
        const raw = pt.rawData || {};
        return pt.type || raw.unit_category || raw.unit_type || raw.name || raw.unitCategory || null;
      }).filter((v) => typeof v === "string" && v.trim())
    )
  );

  return {
    id: p.id,
    title: p.title,
    price: p.priceFrom ? parseFloat(p.priceFrom) : null,
    priceCurrency: p.currency || "AED",
    location: p.locationString || `${p.city || ""}${p.area ? `, ${p.area}` : ""}`,
    coverPhoto: p.mainImageUrl || "/project_detail_images/building.jpg",
    propertyTypes: propertyTypeNames,
    paymentPlans: Array.isArray(p.paymentPlans) ? p.paymentPlans.map((pp) => pp.rawData || pp) : [],
    bedroomsRange:
      p.bedroomsMin && p.bedroomsMax
        ? `${p.bedroomsMin}-${p.bedroomsMax} BR`
        : p.bedroomsMin
          ? `${p.bedroomsMin} BR`
          : null,
    developer: p.developerName || null,
    handoverDate: p.handoverDate || p.completionDate || null,
    city: city,
    source: "REELLY",
  };
}

export default async function FeaturedPropertiesPage() {
  const locale = headers().get("x-next-locale") || "en";

  // ✅ Correct next-intl usage
  const t = await getTranslations({ locale, namespace: "featuredProperties" });

  const [manualProps, reellyProjects] = await Promise.all([
    prisma.property.findMany({
      where: { featured: true },
      include: { images: true },
    }),
    prisma.reellyProject.findMany({
      where: { isFeatured: true },
      include: {
        paymentPlans: true,
        propertyTypes: true,
      },
    }),
  ]);

  let normalizedReelly = reellyProjects.map(normalizeReellyProject);
  try {
    normalizedReelly = await hydrateProjectsBatch(normalizedReelly, "AED", 5);
  } catch (err) {
    console.warn("Hydration failed for featured properties:", err);
  }

  const allItems = [
    ...manualProps.map(normalizeManualProperty),
    ...normalizedReelly,
  ];

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
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {cityKeys.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            {t("empty")}
          </div>
        )}

        {cityKeys.map((city) => (
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
