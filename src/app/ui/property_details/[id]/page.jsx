import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PropertyHero from "@/components/properties/PropertyHero";
import PropertyOverview from "@/components/properties/PropertyOverview";
import SignatureFeatures from "@/components/properties/SignatureFeatures";
import PropertyTypes from "@/components/properties/PropertyTypes";
import PhotoGalleryTabs from "@/components/properties/PhotoGalleryTabs";
import PaymentPlanBanner from "@/components/properties/PaymentPlanBanner";
import PropertyDetailsLocation from "@/components/properties/PropertyDetailsLocation";

export async function generateMetadata({ params }) {
     const { id } = params;
    const property = await prisma.property.findUnique({
        where: { id },
    });

    if (!property) return { title: "Property Not Found" };

    return {
        title: `${property.title} - DubaiHaus`,
        description: property.description?.substring(0, 160),
    };
}

export default async function PropertyDetailsPage({ params }) {
     const { id } = params;

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

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
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
