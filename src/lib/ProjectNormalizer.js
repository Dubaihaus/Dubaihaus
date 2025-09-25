// src/lib/ProjectNormalizer.js

function cleanup(str) {
  return String(str || '').trim().toLowerCase();
}

function guessTypeFromText(text) {
  const s = cleanup(text);
  if (!s) return null;
  if (/(town\s*house|townhouse|th)\b/.test(s)) return 'Townhouse';
  if (/\bvilla\b/.test(s)) return 'Villa';
  if (/\bpenthouse\b/.test(s)) return 'Penthouse';
  if (/\bloft\b/.test(s)) return 'Loft';
  if (/\bstudio\b/.test(s)) return 'Studio';
  if (/\bduplex\b/.test(s)) return 'Duplex';
  if (/\b(apartment|flat|residence)\b/.test(s)) return 'Apartment';
  return null;
}

function guessTypeFromMetrics(bedrooms, sizeM2, sizeSqft) {
  const br = Number(bedrooms ?? 0);
  const m2 = Number(sizeM2 ?? 0);
  const sqft = Number(sizeSqft ?? 0);
  if (br >= 4 || m2 >= 250 || sqft >= 2700) return 'Villa';
  if (br === 3 && (m2 >= 180 || sqft >= 1900)) return 'Townhouse';
  return 'Apartment';
}

function bedroomsRange(units) {
  const brs = units.map(u => Number(u.bedrooms)).filter(Number.isFinite);
  if (!brs.length) return null;
  const min = Math.min(...brs), max = Math.max(...brs);
  return min === max ? `${min}BR` : `${min}–${max}BR`;
}

export function normalizeProject(project) {
  if (!project) return null;

  const loc = project.location || null;
  const rawLat = loc?.latitude ?? project.location_marker?.latitude ?? null;
  const rawLng = loc?.longitude ?? project.location_marker?.longitude ?? null;
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  // Build per-unit info and infer category
  const unitTypes = (project.typical_units || []).map(u => {
    const layoutName = u?.layout?.[0]?.name || u?.layout?.[0]?.title || null;
    const hinted = guessTypeFromText(u.unitType) || guessTypeFromText(layoutName);
    const derived = hinted || guessTypeFromMetrics(
      u.bedrooms,
      u.from_size_m2 ?? u.to_size_m2,
      u.from_size_sqft ?? u.to_size_sqft
    );
    return {
      bedrooms: u.bedrooms,
      priceFromAED: u.from_price_aed,
      priceToAED: u.to_price_aed,
      priceFromUSD: u.from_price_usd,
      priceToUSD: u.to_price_usd,
      sizeFromSqft: u.from_size_sqft,
      sizeToSqft: u.to_size_sqft,
      sizeFromM2: u.from_size_m2,
      sizeToM2: u.to_size_m2,
      layouts: u.layout || [],
      unitCategory: derived,
    };
  });

  const propertyTypes = [...new Set(unitTypes.map(u => u.unitCategory).filter(Boolean))];
  const brRange = bedroomsRange(unitTypes);

  const locationStr = loc
    ? [loc.sector, loc.district, loc.region].filter(Boolean).join(', ')
    : 'Location not specified';

  return {
    id: project.id,
    title: project.name,
    name: project.name,
    developer: project.developer,
    constructionStatus: project.construction_status,
    saleStatus: project.sale_status,
    description: project.description ?? project.short_description ?? null,
    completionDate: project.completion_date ?? project.completion_datetime ?? null,

    // Location for UI + Map
    location: locationStr,
    locationObj: loc,
    lat: hasCoords ? lat : null,
    lng: hasCoords ? lng : null,

    // Prices and sizes
    minPrice: project.min_price ?? null,
    maxPrice: project.max_price ?? null,
    minSize: project.min_size ?? null,
    maxSize: project.max_size ?? null,
    priceCurrency: project.price_currency || 'AED',
    areaUnit: project.area_unit || 'm2',

    // Media
    coverImage: project.cover_image?.url || null,
    architectureImages: project.architecture || [],
    interiorImages: project.interior || [],
    lobbyImages: project.lobby || [],
    generalPlan: project.general_plan || null,

    // Amenities etc.
    amenities: (project.project_amenities || []).map(a => ({
      id: a.id, name: a.amenity?.name, icon: a.icon?.url
    })),
    pointsOfInterest: project.project_map_points || [],
    paymentPlans: project.payment_plans || [],
    buildings: project.buildings || [],
    parking: project.parkings || [],
    serviceCharge: project.service_charge ?? null,
    furnishing: project.furnishing ?? null,
    depositDescription: project.deposit_description ?? null,
    escrowNumber: project.escrow_number ?? null,
    marketingBrochure: project.marketing_brochure ?? null,
    unitsCount: project.units_count ?? null,

    // Derived
    unitTypes,
    propertyTypes,
    propertyType: propertyTypes[0] || 'Property',
    bedroomsRange: brRange,

    rawData: project,
  };
}
