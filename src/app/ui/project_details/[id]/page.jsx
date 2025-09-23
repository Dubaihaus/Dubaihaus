// Server Component page (no 'use client')
import { notFound } from 'next/navigation';
import { getPropertyById } from '@/lib/reellyApi';

import ProjectHeaderSection from '@/components/project_details/ProjectHeaderSection';
import ProjectDetailsHighlights from '@/components/project_details/ProjectDetailsHighlights';
import ProjectAboutSection from '@/components/project_details/ProjectAboutSection';
import LocationEconomicAppeal from '@/components/project_details/LocationEconomicAppeal';
import PhotoGallerySection from '@/components/project_details/PhotoGallerySection';
import FloorPlanSection from '@/components/project_details/FloorPlanSection';
import PropertyInformation from '@/components/project_details/PropertyInformation';
import BuildingInformation from '@/components/project_details/BuildingInformation';
import UnitTypesSection from '@/components/project_details/UnitTypesSection';
import PaymentPlanSection from '@/components/project_details/PaymentPlanSection';
import PointsOfInterestSection from '@/components/project_details/PointsOfIntrest'; // ensure filename matches
import AmenitiesSection from '@/components/project_details/AmenitiesSection';
import Footer from '@/components/footer';

export const dynamic = 'force-dynamic'; // or: export const revalidate = 0;

export default async function ProjectDetailsPage({ params }) {
  const { id } = await params; // <-- await params
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <ProjectHeaderSection property={property} />
      <ProjectDetailsHighlights property={property} />
      <AmenitiesSection property={property} />
      <ProjectAboutSection property={property} />
      <LocationEconomicAppeal property={property} />
      <PhotoGallerySection property={property} />
      <FloorPlanSection property={property} />
      <UnitTypesSection property={property} />
      <PaymentPlanSection property={property} />
      <PointsOfInterestSection property={property} />
      <PropertyInformation property={property} />
      <BuildingInformation property={property} />
      <Footer />
    </main>
  );
}
