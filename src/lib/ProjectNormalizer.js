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

// SIMPLE COORDINATE EXTRACTION - GUARANTEED TO WORK
function extractCoordinates(project) {
  console.log('🔍 EXTRACTING COORDINATES FOR PROJECT:', project?.id, project?.name);
  
  if (!project) {
    console.log('❌ No project provided');
    return { lat: null, lng: null };
  }

  // METHOD 1: Check location object (THIS IS WHERE YOUR DATA IS!)
  if (project.location && project.location.latitude !== undefined && project.location.longitude !== undefined) {
    const lat = parseFloat(project.location.latitude);
    const lng = parseFloat(project.location.longitude);
    console.log('✅ FOUND COORDINATES in location:', lat, lng);
    return { lat, lng };
  }

  // METHOD 2: Check raw coordinates
  if (project.latitude !== undefined && project.longitude !== undefined) {
    const lat = parseFloat(project.latitude);
    const lng = parseFloat(project.longitude);
    console.log('✅ FOUND COORDINATES in root:', lat, lng);
    return { lat, lng };
  }

  // METHOD 3: Check location marker
  if (project.location_marker && project.location_marker.latitude !== undefined && project.location_marker.longitude !== undefined) {
    const lat = parseFloat(project.location_marker.latitude);
    const lng = parseFloat(project.location_marker.longitude);
    console.log('✅ FOUND COORDINATES in location_marker:', lat, lng);
    return { lat, lng };
  }

  console.log('❌ NO COORDINATES FOUND in any field');
  console.log('📍 Available location data:', {
    hasLocation: !!project.location,
    locationKeys: project.location ? Object.keys(project.location) : 'none',
    hasLatLng: project.location ? {
      hasLat: 'latitude' in project.location,
      hasLng: 'longitude' in project.location,
      latValue: project.location.latitude,
      lngValue: project.location.longitude
    } : 'no location'
  });

  return { lat: null, lng: null };
}

function detectPropertyType(project) {
  console.log('🏠 Detecting property type for:', project?.name);
  
  // Check parking allocations
  if (project.parkings && project.parkings.length > 0) {
    const unitTypes = project.parkings.map(p => p.unit_type).filter(Boolean);
    console.log('📦 Parking unit types:', unitTypes);
    
    if (unitTypes.includes('villa')) return 'Villa';
    if (unitTypes.includes('townhouse')) return 'Townhouse';
    if (unitTypes.includes('apartment')) return 'Apartment';
  }

  // Check building count
  if (project.building_count > 1) return 'Residential Complex';
  if (project.building_count === 1) return 'Apartment Building';

  // Check name
  const name = (project.name || '').toLowerCase();
  if (name.includes('villa')) return 'Villa';
  if (name.includes('townhouse') || name.includes('town house')) return 'Townhouse';
  if (name.includes('residence') || name.includes('apartment')) return 'Apartment';

  return 'Property';
}

export function normalizeProject(project) {
  console.log('🔄 STARTING NORMALIZATION FOR:', project?.id, project?.name);
  
  if (!project) {
    console.log('❌ normalizeProject: No project data');
    return null;
  }

  // EXTRACT COORDINATES - THIS IS THE MOST IMPORTANT PART
  const { lat, lng } = extractCoordinates(project);
  const hasCoords = lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng);
  
  console.log('📍 COORDINATE RESULT:', {
    projectId: project.id,
    projectName: project.name,
    hasCoords,
    lat,
    lng,
    locationData: project.location
  });

  const loc = project.location || null;
  
  // Build unit types
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
  const detectedType = detectPropertyType(project);

  const locationStr = loc
    ? [loc.sector, loc.district, loc.region, loc.country].filter(Boolean).join(', ')
    : 'Location not specified';

  const normalizedProject = {
    id: project.id,
    title: project.name,
    name: project.name,
    developer: project.developer,
    constructionStatus: project.construction_status,
    saleStatus: project.sale_status,
    description: project.description ?? project.short_description ?? null,
     updatedAt: project.updated_at,
    completionDate: project.completion_date ?? project.completion_datetime ?? null,

    // LOCATION DATA - CRITICAL FOR MAP
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
      id: a.id, 
      name: a.amenity?.name, 
      icon: a.icon?.url
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
    propertyType: propertyTypes[0] || detectedType,
    bedroomsRange: brRange,

    rawData: project,
  };

  // console.log('✅ NORMALIZATION COMPLETE:', {
  //   id: normalizedProject.id,
  //   name: normalizedProject.name,
  //   hasCoordinates: !!normalizedProject.lat && !!normalizedProject.lng,
  //   coordinates: { lat: normalizedProject.lat, lng: normalizedProject.lng },
  //   propertyType: normalizedProject.propertyType
  // });

  return normalizedProject;
}