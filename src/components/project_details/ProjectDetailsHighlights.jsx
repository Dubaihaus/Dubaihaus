'use client';
import Image from 'next/image';

function formatAED(n) {
  if (n == null) return null;
  try {
    return `AED ${Number(n).toLocaleString()}`;
  } catch {
    return `AED ${n}`;
  }
}

// Try to extract a sortable bedroom number from names like
// "1 bedroom Apartments - Sol Luxe", "2,5 bedroom Apartments - Sol Luxe", etc.
function extractBedrooms(name) {
  if (!name || typeof name !== 'string') return null;
  const m = name.match(/(\d+(?:[.,]\d+)?)(?=\s*bed)/i);
  if (!m) return null;
  // accept comma as decimal separator
  return parseFloat(m[1].replace(',', '.'));
}

export default function ProjectDetailsHighlights({ property }) {
 const location = property.location || "Dubai";

  const propertyTypes = (property?.rawData?.unit_blocks || [])
  .map(b => b?.unit_type).filter(Boolean).join(", ") || "Apartments";

 const completionDate = property.completionDate ? new Date(property.completionDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "TBA";

  const startingPrice = property.price != null
   ? `${property.priceCurrency || 'AED'} ${Number(property.price).toLocaleString()}`
  : "Price on request";

  // Build a clean list of unit options (name + price)
  const unitBlocks = Array.isArray(property?.rawData?.unit_blocks) ? property.rawData.unit_blocks : [];
 const unitOptions = unitBlocks.map((b) => ({
      name: b?.name || b?.unit_type || "Unit",
      unitType: b?.unit_type || null,
      priceFromAED: b?.units_price_from_aed ?? null,
      bedrooms: extractBedrooms(u?.name),
    }))
    // remove rows with no meaningful info
    .filter((u) => u.name && (u.priceFromAED != null || u.unitType))
    // sort by bedrooms (if detected), else by name
    .sort((a, b) => {
      const ax = a.bedrooms ?? Infinity;
      const bx = b.bedrooms ?? Infinity;
      if (ax === bx) return a.name.localeCompare(b.name);
      return ax - bx;
    });

  return (
    <>
      {/* Section 1: Project Highlights */}
      <section className="bg-white py-12 px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT COLUMN */}
          <div className="space-y-6 order-2 md:order-1">
            <h2 className="text-2xl font-bold text-gray-900">🏗️ Project Highlights</h2>

            <ul className="list-disc pl-5 space-y-2 text-base text-gray-800">
              <li><strong>Location:</strong> {location}</li>
              <li><strong>Property Types:</strong> {propertyTypes}</li>
              <li><strong>Starting Price:</strong> {startingPrice}</li>
              <li><strong>Completion Due Date:</strong> {completionDate}</li>
              <li><strong>Ownership:</strong> 100% Foreign Ownership</li>
              <li><strong>Commission:</strong> No commission, direct from developer</li>
              <li><strong>ROI:</strong> High return on investment</li>
            </ul>

            {/* Amenities */}
            {Array.isArray(property.project_amenities) && property.project_amenities.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mt-6 mb-2">🌟 Exclusive Amenities</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {property.project_amenities.slice(0, 6).map((amenity, index) => (
                    <li key={index}>{amenity?.amenity?.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Location Access */}
            {Array.isArray(property.project_map_points) && property.project_map_points.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mt-6 mb-2">📍 Prime Location Access</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {property.project_map_points.slice(0, 5).map((point, index) => (
                    <li key={index}>
                      {point?.map_point_name} {point?.distance != null ? `(${point.distance} km)` : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Brochure Button */}
            {property.marketing_brochure && (
              <div>
                <a
                  href={property.marketing_brochure}
                  className="inline-block mt-4 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md transition-all"
                  target="_blank"
                  rel="noreferrer"
                >
                  📄 Download Free PDF Brochure
                </a>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="order-1 md:order-2 space-y-6">
            {/* Why Choose */}
            <div className="bg-gray-100 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">💎 Why Choose {property.name}?</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>New Launch – Be the first to own</li>
                <li>Freehold Property</li>
                <li>Direct from the Developer</li>
                <li>Ideal for both investors & residents</li>
                {property.escrow_number && <li>Escrow Account Protection</li>}
              </ul>
            </div>

            {/* NEW: Available Units & Prices */}
            {unitOptions.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  🏠 Available Units & Prices
                </h3>

                <div className="space-y-3">
                  {unitOptions.map((u, idx) => (
                    <div
                      key={`${u.name}-${idx}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {u.name}
                        </div>
                        {u.unitType && (
                          <div className="text-xs text-gray-500">
                            {u.unitType}
                          </div>
                        )}
                      </div>
                      <div className="text-sky-600 font-bold whitespace-nowrap">
                        {u.priceFromAED != null ? `from ${formatAED(u.priceFromAED)}` : 'Price on request'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional CTAs below the list */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  {property.floor_plans && property.floor_plans.length > 0 && (
                    <a
                      href={property.floor_plans[0]?.file}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md text-sm font-medium transition-all text-center"
                    >
                      Open All Floor Plans
                    </a>
                  )}
                  {property.marketing_brochure && (
                    <a
                      href={property.marketing_brochure}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-sky-500 hover:bg-sky-50 text-sky-600 px-5 py-2 rounded-md text-sm font-medium transition-all text-center"
                    >
                      Download Brochure
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}