// src/components/dashboard/PropertiesPerArea.jsx
'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AREAS } from "@/lib/Areas";
import { useAreaProperties } from "@/hooks/useProperties";

const PLACEHOLDER = "/project_detail_images/building.jpg";

function AreaCard({ area }) {
  const { data, isLoading, error } = useAreaProperties(area.slug, area.filters);

  const firstProperty = data?.results?.[0];
  const imageSrc = firstProperty?.coverImage || area.image || PLACEHOLDER;
  const loadMoreHref = `/off-plan?${new URLSearchParams(area.filters).toString()}`;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col animate-pulse">
        <div className="relative h-56 bg-gray-200" />
        <div className="p-6 flex flex-col flex-1">
          <div className="h-6 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-4" />
          <div className="h-10 bg-gray-200 rounded mt-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
        <div className="relative h-56 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">Failed to load</span>
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{area.title}</h3>
          <p className="text-gray-600 text-sm mb-5">Error loading properties</p>
          <Button asChild className="mt-auto">
            <Link href={loadMoreHref}>Try Again</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 overflow-hidden flex flex-col">
      <div className="relative h-56">
        <Image
          src={imageSrc}
          alt={area.title}
          fill
          className="object-cover"
          sizes="400px"
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{area.title}</h3>
        <p className="text-gray-600 text-sm mb-5 line-clamp-2">
          {area.description || "Explore premium off-plan developments in this sought-after Dubai community."}
        </p>

        <Button asChild className="mt-auto"
          style={{ backgroundColor: '#00C6FF' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#003C7A')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00C6FF')}
        >
          <Link href={loadMoreHref}>Load more</Link>
        </Button>
      </div>
    </div>
  );
}

export default function AreasShowcaseClient() {
  return (
    <section className="px-4 py-16 md:px-16 bg-gray-50" dir="ltr">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
          Best Real Estate Areas in Dubai
        </h2>
        <p className="text-gray-600 mb-10 max-w-3xl mx-auto text-center">
          Discover Dubai's top property destinations — from luxury beachfronts to urban communities.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {AREAS.map((area) => (
            <AreaCard key={area.slug} area={area} />
          ))}
        </div>

        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Can't find your preferred area?</h3>
          <Link
            href="/off-plan"
            className="inline-flex items-center text-white px-6 py-3 rounded-lg font-medium"
            style={{ backgroundColor: '#00C6FF' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#003C7A')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00C6FF')}
          >
            Explore All Properties
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}