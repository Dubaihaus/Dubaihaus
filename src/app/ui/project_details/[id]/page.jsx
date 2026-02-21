import { notFound } from 'next/navigation';
import { getPropertyById } from '@/lib/reellyApi';
import { prisma } from '@/lib/prisma';
import { generateStandardMetadata, getBreadcrumbSchema } from '@/lib/seo';

import ProjectHeaderSection from '@/components/project_details/ProjectHeaderSection';
import ProjectDetailsHighlights from '@/components/project_details/ProjectDetailsHighlights';
// import ProjectAboutSection from '@/components/project_details/ProjectAboutSection';
// import LocationEconomicAppeal from '@/components/project_details/LocationEconomicAppeal';
import PhotoGallerySection from '@/components/project_details/PhotoGallerySection';
import FloorPlanSection from '@/components/project_details/FloorPlanSection';
// import PropertyInformation from '@/components/project_details/PropertyInformation';
import BuildingInformation from '@/components/project_details/BuildingInformation';
// import UnitTypesSection from '@/components/project_details/UnitTypesSection';
import PaymentPlanSection from '@/components/project_details/PaymentPlanSection';
// import PointsOfInterestSection from '@/components/project_details/PointsOfIntrest';
import AmenitiesSection from '@/components/project_details/AmenitiesSection';
// import Footer from '@/components/footer';
import ProjectFAQ from '@/components/project_details/ProjectFAQ';

export const dynamic = 'force-dynamic'; // or: export const revalidate = 0;

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const numId = Number(id);
  const t = await getTranslations({ namespace: 'seo.projectDetail' });

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
    // Generic fallback instead of "Not Found" because the real API might resolve it during render
    title = t('fallbackTitle');
    description = t('fallbackDescription');
  }

  return generateStandardMetadata({
    pathname: `ui/project_details/${id}`,
    title,
    description,
    images,
  });
}

export default async function ProjectDetailsPage({ params }) {
  const { id } = await params; // await params in Next 15+
  const property = await getPropertyById(id);

  if (!property) notFound();

  // JSON-LD Breadcrumb List
  const breadcrumbItems = [
    { name: "Home", item: "https://www.dubaihaus.com" },
    { name: "Off-Plan Projects", item: "https://www.dubaihaus.com/off-plan" },
    { name: property.title || "Project Details", item: `https://www.dubaihaus.com/ui/project_details/${id}` }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      getBreadcrumbSchema(breadcrumbItems)
    ]
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProjectHeaderSection property={property} />
      <ProjectDetailsHighlights property={property} />
      <AmenitiesSection property={property} />
      <FloorPlanSection property={property} />
      <PhotoGallerySection property={property} />
      {/* <ProjectAboutSection property={property} /> */}
      {/* <LocationEconomicAppeal property={property} /> */}
      {/* <UnitTypesSection property={property} /> */}
      <PaymentPlanSection property={property} />
      {/* <PointsOfInterestSection property={property} /> */}
      {/* <PropertyInformation property={property} /> */}
      <BuildingInformation property={property} />
      <ProjectFAQ property={property} />

    </main>
  );
}
