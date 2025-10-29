import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useMemo, useCallback } from "react";

import { getHandoverLabel } from '../lib/FormatHandover'; // <-- correct path/casing
function fmtLocation(locOrString) {
  // If object: safely build without numeric country ids
  if (locOrString && typeof locOrString === 'object') {
    const { sector, district, city, region, country } = locOrString;
    const countryStr = typeof country === 'string' && !/^\d+$/.test(country) ? country : null;
    const parts = [sector, district, city, region, countryStr].filter(Boolean);
    return parts.join(', ') || 'Unknown location';
  }

  // If string: drop standalone numeric tokens like ", 219"
  const s = String(locOrString || '').trim();
  if (!s) return 'Unknown location';
  return s
    .split(',')
    .map(p => p.trim())
    .filter(p => p && !/^\d+$/.test(p))   // remove numeric-only segments
    .join(', ') || 'Unknown location';
}


function TypeBadges({ types, brRange }) {
  const list = Array.isArray(types) && types.length ? types : null;
  if (!list && !brRange) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {list?.map((t) => (
        <span
          key={t}
          className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
        >
          {t}
        </span>
      ))}
      {brRange && (
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
          {brRange}
        </span>
      )}
    </div>
  );
}

  export default function PropertyCard({ property, currency, selectedUnitType }) {
const router = useRouter();
  const coverPhoto =
    property.coverPhoto ||
    property?.media?.photos?.[0] ||
    property?.cover_image?.url ||
    property?.rawData?.cover_image?.url ||
    "/project_detail_images/building.jpg";

  const status = property.status || property.sale_status || "For Sale";
const rawPrice = property.price ?? property.minPrice ?? property.min_price ?? null;

// currency conversion first, then round to nearest integer
let converted = rawPrice;
if (currency === "EUR" && rawPrice != null) converted = rawPrice * 0.25;
else if (currency === "USD" && rawPrice != null) converted = rawPrice * 0.27;

// remove any decimals — ensure integer
const price = converted != null ? Math.round(Number(converted)) : null;


  const shownCurrency = currency || property.priceCurrency || property.price_currency || "AED";
const locationLabel = fmtLocation(property.locationObj || property.rawData?.location || property.location);
  const developer = property.developer || "N/A";

  const handover = getHandoverLabel(property);

  // Multi-type support from normalizer
  const types = property.propertyTypes || (property.propertyType ? [property.propertyType] : []);
  const brRange = property.bedroomsRange || null;
  const categoryBadge = types[0] || "Property";

  const queryParams = {};
  if (selectedUnitType) queryParams.unit_type = selectedUnitType;
  // Build an href STRING for router.prefetch (Link can still use object)
  const href = useMemo(() => {
    const pathname = `/ui/project_details/${property.id}`;
    const search = new URLSearchParams(queryParams).toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [property.id, queryParams]);

  const prefetchDetail = useCallback(() => {
    // Prefetch the route so data & bundle are warm on click
    router.prefetch(href);
  }, [router, href]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition transform hover:-translate-y-1" dir="ltr">
      {/* <Link href={{ pathname: `/ui/project_details/${property.id}`, query: queryParams }}> */}
      <Link
        href={{ pathname: `/ui/project_details/${property.id}`, query: queryParams }}
        prefetch
        onMouseEnter={prefetchDetail}
        onFocus={prefetchDetail}
        onTouchStart={prefetchDetail}
      >
        {/* Image */}
        <div className="relative">
          <img src={coverPhoto} alt={property.title || property.name} className="w-full h-64 object-cover" />
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded">
            {categoryBadge}
          </span>
          <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded">
            {status}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <p className="font-bold text-lg mb-2" style={{ color: '#00C6FF' }}>
  from {shownCurrency} {price?.toLocaleString() ?? "—"}
</p>

          <h3 className="text-gray-800 font-semibold text-lg mb-1 line-clamp-2">
            {property.title || property.name}
          </h3>

          <p className="text-gray-500 text-sm flex items-center gap-1 mb-1">
            <MapPin size={14} /> {locationLabel}
          </p>

          {/* badges for multiple types + bedrooms range */}
          <TypeBadges types={types} brRange={brRange} />

          <div className="text-sm text-gray-600 space-y-1 mb-5 mt-3">
            <p><span className="font-medium">Developer:</span> {developer}</p>
            <p><span className="font-medium">Handover:</span> {handover}</p>
          </div>

          <Button
  className="mt-auto w-full text-white rounded-lg"
  style={{
    backgroundColor: '#004C99',
  }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#003C7A')}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#004C99')}
>
  Discover more
</Button>
        </div>
      </Link>
    </div>
  );
}
