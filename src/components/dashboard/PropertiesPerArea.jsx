// src/components/dashboard/AreasShowcaseClient.jsx
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AREAS } from "@/lib/Areas";
import PropertyCard from "@/components/PropertyCard";

const PLACEHOLDER = "/project_detail_images/building.jpg";

function ImgFallback({ src, alt, className, sizes }) {
  const [err, setErr] = useState(false);
  const safe = err || !src ? PLACEHOLDER : src;
  return (
    <Image
      src={safe}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      onError={() => setErr(true)}
    />
  );
}

export default function AreasShowcaseClient() {
  const [areaData, setAreaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.all(
          AREAS.map(async (area) => {
            const qs = new URLSearchParams({
              page: "1",
              pageSize: "6",
              pricedOnly: "false",
              ...area.filters,
            });
            const r = await fetch(`/api/off-plan?${qs.toString()}`, { cache: "no-store" });
            const data = r.ok ? await r.json() : { results: [], total: 0 };
            return { area, data };
          })
        );
        setAreaData(results);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="px-4 py-20 text-center text-gray-500">
        <p>Loading areas...</p>
      </section>
    );
  }

  return (
    <section className="px-4 py-16 md:px-16 bg-gray-50" dir="ltr">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
          Best Real Estate Areas in Dubai
        </h2>
        <p className="text-gray-600 mb-10 max-w-3xl mx-auto text-center">
          Discover Dubai’s top property destinations — from luxury beachfronts to urban communities.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {areaData.map(({ area, data }) => {
            const first = data?.results?.[0];
            // ✅ Correct normalized image chain
            const imageSrc =
              first?.coverImage ||
              first?.cover_image?.url ||
              first?.rawData?.cover_image?.url ||
              area.image ||
              null;

            const loadMoreHref = `/off-plan?${new URLSearchParams(area.filters).toString()}`;

            return (
              <div
                key={area.slug}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 overflow-hidden flex flex-col"
              >
                <div className="relative h-56">
                  <ImgFallback
                    src={imageSrc}
                    alt={area.title}
                    className="object-cover"
                    sizes="400px"
                  />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{area.title}</h3>
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                    {area.description ||
                      "Explore premium off-plan developments in this sought-after Dubai community."}
                  </p>

                  <Button asChild className="mt-auto "
                    style={{
    backgroundColor: '#004C99',
  }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#003C7A')}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#004C99')}
>
                    <Link href={loadMoreHref}>Load more</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Can’t find your preferred area?</h3>
          <Link
            href="/off-plan"
            className="inline-flex items-center text-white px-6 py-3 rounded-lg  font-medium"
              style={{
    backgroundColor: '#004C99',
  }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#003C7A')}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#004C99')}
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
