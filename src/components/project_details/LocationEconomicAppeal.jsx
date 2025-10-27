'use client';
import Image from 'next/image';

function formatAED(n) {
  return n != null ? `AED ${Number(n).toLocaleString()}` : 'Price on request';
}
function formatLocation(loc) {
  if (!loc) return 'Not specified';
  const parts = [loc.sector, loc.district, loc.city, loc.region].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Not specified';
}
function inferPropertyType(p) {
  // Try explicit type; else infer “Apartment” if typical_units exist
  return p?.property_type || (Array.isArray(p?.typical_units) && p.typical_units.length ? 'Apartment' : 'Residence');
}

export default function LocationEconomicAppeal({ property }) {
  const p = property?.rawData ?? property ?? {};

  const appealImages = [
    p.cover_image?.url,
    ...(Array.isArray(p.architecture) ? p.architecture.slice(0, 2).map((img) => img.url) : []),
  ].filter(Boolean);

  const locationAppeal = [
    { title: 'Prime Location', description: formatLocation(p.location) },
    { title: 'Developer', description: p.developer || 'Not specified' },
    { title: 'Completion Date', description: p.completion_date || 'TBA' },
    { title: 'Starting Price', description: formatAED(p.min_price) },
    {
      title: 'Property Type',
      description: inferPropertyType(p),
    },
  ];

  const title = p.name || 'Project';

  return (
    <section className="px-4 py-12 md:px-16 bg-white" dir="ltr">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 md:w-1/2">
          Location and <span className="text-sky-600">Economic Appeal</span> of {title}
        </h2>

        <div className="grid grid-cols-3 gap-2 md:w-1/2">
          {appealImages.map((img, idx) => (
            <Image
              key={idx}
              src={img}
              alt={`Appeal ${idx + 1}`}
              width={100}
              height={100}
              className="rounded-lg object-cover w-full h-24 md:h-28"
            />
          ))}
        </div>
      </div>

      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        {locationAppeal.map((item, idx) => (
          <div key={idx}>
            <h4 className="font-semibold text-base text-gray-800 mb-1">{item.title}</h4>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
