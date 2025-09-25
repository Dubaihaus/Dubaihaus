// src/components/dashboard/PropertiesPerArea.jsx (SERVER COMPONENT)
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import PropertyCard from "@/components/PropertyCard";
import { AREAS } from "@/lib/Areas";

export const revalidate = 300; // cache this section for 5 minutes

async function fetchProjects(filters = {}, { limit = 6 } = {}) {
  const qs = new URLSearchParams({ 
    page: "1", 
    pageSize: String(limit),
    pricedOnly: "false" // Show all properties, even without prices
  });
  
  // Add area filters
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      qs.set(k, String(v));
    }
  });

  // Build absolute URL from request headers
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  try {
    const res = await fetch(`${base}/api/off-plan?${qs.toString()}`, {
      next: { revalidate: 300 },
    });
    
    if (!res.ok) {
      console.error(`API error for ${filters.area}:`, res.status);
      return { results: [], total: 0, error: true };
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Fetch error for ${filters.area}:`, error);
    return { results: [], total: 0, error: true };
  }
}

export default async function AreasShowcase() {
  // Fetch all areas in parallel with error handling
  const areaPromises = AREAS.map(area => 
    fetchProjects(area.filters, { limit: 6 })
  );
  
  const results = await Promise.allSettled(areaPromises);
  
  const lists = results.map(result => 
    result.status === 'fulfilled' ? result.value : { results: [], total: 0, error: true }
  );

  return (
    <section className="px-4 py-16 md:px-16 bg-white" dir="ltr">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Discover Properties by Area
        </h2>
        <p className="text-gray-600 mb-8 max-w-3xl">
          Explore off-plan properties in Dubai's most sought-after neighborhoods. 
          Each area offers unique investment opportunities and lifestyle amenities.
        </p>

        <div className="space-y-16">
          {AREAS.map((area, idx) => {
            const data = lists[idx] || { results: [], total: 0 };
            const loadMoreHref = `/off-plan?${new URLSearchParams(area.filters).toString()}`;

            return (
              <div key={area.slug} className="border-b border-gray-200 pb-12 last:border-b-0">
                {/* Area Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                      {area.title}
                    </h3>
                    <p className="text-gray-600">
                      {data.total > 0 
                        ? `${data.total} properties available` 
                        : 'Exploring investment opportunities'}
                    </p>
                  </div>
                  
                  {data.results.length > 0 && (
                    <Link
                      href={loadMoreHref}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
                    >
                      View all properties
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>

                {/* Properties Grid */}
                {data.error ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Unable to load properties for {area.title} at the moment.</p>
                    <p className="text-sm">Please try again later.</p>
                  </div>
                ) : data.results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.results.map((property) => (
                      <PropertyCard 
                        key={property.id} 
                        property={property} 
                        currency="AED" 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No properties found in {area.title}.</p>
                    <p className="text-sm">Check back soon for new listings.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Call to Action */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Can't find what you're looking for?
          </h3>
          <Link
            href="/off-plan"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Browse All Properties
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}