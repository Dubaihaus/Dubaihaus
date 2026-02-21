import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { generateStandardMetadata, getBreadcrumbSchema } from '@/lib/seo';
import JsonLd from "@/components/seo/JsonLd";
import PropertyHero from "@/components/properties/PropertyHero";
import PropertyOverview from "@/components/properties/PropertyOverview";
import SignatureFeatures from "@/components/properties/SignatureFeatures";
import PropertyTypes from "@/components/properties/PropertyTypes";
import PhotoGalleryTabs from "@/components/properties/PhotoGalleryTabs";
import PaymentPlanBanner from "@/components/properties/PaymentPlanBanner";
import PropertyDetailsLocation from "@/components/properties/PropertyDetailsLocation";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const numId = Number(id);
    const t = await getTranslations({ namespace: 'seo.propertyDetail' });

    // Fast fetch from our DB instead of slow Reelly API for metadata
    const propertyDb = !isNaN(numId) ? await prisma.reellyProject.findUnique({
        where: { id: numId },
        select: {
            title: true,
            description: true,
            developerName: true,
            city: true,
            mainImageUrl: true
        }
    }) : null;

    let title, description, images = [];

    if (propertyDb) {
        title = t('title', { title: propertyDb.title, city: propertyDb.city || 'Dubai' });
        description = propertyDb.description
            ? propertyDb.description.substring(0, 150)
            : t('descriptionDefault', { title: propertyDb.title, developer: propertyDb.developerName || 'top developers', city: propertyDb.city || 'Dubai' });
        if (propertyDb.mainImageUrl) images = [propertyDb.mainImageUrl];
    } else {
        // Keep optimistic metadata in case layout renders it
        title = t('fallbackTitle');
        description = t('fallbackDescription');
    }

    return generateStandardMetadata({
        pathname: `ui/property_details/${id}`,
        title,
        description,
        images,
    });
}

export default async function PropertyDetailsPage({ params }) {
    const { id } = await params;

    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            images: true,
            amenities: true,
            details: true,
            gallery: { orderBy: { position: 'asc' } },
            types: { orderBy: { position: 'asc' } },
            features: { orderBy: { position: 'asc' } },
            paymentPlans: {
                include: { steps: { orderBy: { position: 'asc' } } }
            }
        }
    });

    if (!property) {
        notFound();
    }

    // JSON-LD Breadcrumb List
    const breadcrumbItems = [
        { name: "Home", item: "https://www.dubaihaus.com" },
        { name: "Properties", item: "https://www.dubaihaus.com/off-plan" }, // Logic: listings
        { name: property.title || "Property Details", item: `https://www.dubaihaus.com/ui/property_details/${id}` }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            getBreadcrumbSchema(breadcrumbItems)
        ]
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <JsonLd data={jsonLd} />
            {/* HERO */}
            <PropertyHero property={property} />

            {/* OVERVIEW */}
            <PropertyOverview property={property} />

            {/* SIGNATURE FEATURES */}
            <SignatureFeatures property={property} />

            {/* TYPES */}
            <PropertyTypes property={property} />

            {/* GALLERY */}
            <PhotoGalleryTabs property={property} />

            {/* PAYMENT PLAN */}
            <PaymentPlanBanner property={property} />

            {/* LOCATION / DETAILS */}
            <PropertyDetailsLocation property={property} />
        </main>
    );
}
