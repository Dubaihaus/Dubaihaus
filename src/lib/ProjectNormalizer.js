
// src/lib/ProjectNormalizer.js

function cleanup(str) {
  return String(str || "").trim().toLowerCase();
}

function guessTypeFromText(text) {
  const s = cleanup(text);
  if (!s) return null;
  if (/(town\s*house|townhouse|th)\b/.test(s)) return "Townhouse";
  if (/\bvilla\b/.test(s)) return "Villa";
  if (/\bpenthouse\b/.test(s)) return "Penthouse";
  if (/\bloft\b/.test(s)) return "Loft";
  if (/\bstudio\b/.test(s)) return "Studio";
  if (/\bduplex\b/.test(s)) return "Duplex";
  if (/\b(apartment|flat|residence)\b/.test(s)) return "Apartment";
  return null;
}

function guessTypeFromMetrics(bedrooms, sizeM2, sizeSqft) {
  const br = Number(bedrooms ?? 0);
  const m2 = Number(sizeM2 ?? 0);
  const sqft = Number(sizeSqft ?? 0);

  if (br >= 4 || m2 >= 250 || sqft >= 2700) return "Villa";
  if (br === 3 && (m2 >= 180 || sqft >= 1900)) return "Townhouse";
  return "Apartment";
}

function bedroomsRange(units) {
  const brs = units
    .map((u) => Number(u.bedrooms))
    .filter((n) => Number.isFinite(n));

  if (!brs.length) return null;
  const min = Math.min(...brs);
  const max = Math.max(...brs);
  return min === max ? `${min}BR` : `${min}–${max}BR`;
}

function safeNumber(...candidates) {
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n !== 0) return n;
  }
  return null;
}

// ---- COORDINATES (location + project_map_points + fallbacks) ----
function extractCoordinates(project) {
  if (!project) return { lat: null, lng: null };

  // 1) location object (ListProject/RetrieveProject)
  if (
    project.location &&
    project.location.latitude !== undefined &&
    project.location.longitude !== undefined
  ) {
    const lat = parseFloat(project.location.latitude);
    const lng = parseFloat(project.location.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  // 2) project_map_points (new API)
  if (Array.isArray(project.project_map_points) && project.project_map_points.length > 0) {
    const point = project.project_map_points[0];
    if (point.latitude !== undefined && point.longitude !== undefined) {
      const lat = parseFloat(point.latitude);
      const lng = parseFloat(point.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
  }

  // 3) root-level lat/lng
  if (project.latitude !== undefined && project.longitude !== undefined) {
    const lat = parseFloat(project.latitude);
    const lng = parseFloat(project.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  // 4) location_marker (if present)
  if (
    project.location_marker &&
    project.location_marker.latitude !== undefined &&
    project.location_marker.longitude !== undefined
  ) {
    const lat = parseFloat(project.location_marker.latitude);
    const lng = parseFloat(project.location_marker.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  return { lat: null, lng: null };
}

// ---- PROPERTY TYPE DETECTION (buildings + parkings + name) ----
function detectPropertyType(project) {
  // 1) buildings.building_type
  if (Array.isArray(project.buildings) && project.buildings.length > 0) {
    const buildingTypes = project.buildings
      .map((b) => (b.building_type || "").toLowerCase())
      .filter(Boolean);

    if (buildingTypes.some((t) => t === "villa" || t === "villas")) return "Villa";
    if (
      buildingTypes.some((t) => t === "townhouse" || t === "townhouses")
    )
      return "Townhouse";
    if (
      buildingTypes.some((t) => t === "apartment" || t === "apartments")
    )
      return "Apartment";
    if (buildingTypes.some((t) => t === "duplex")) return "Duplex";
  }

  // 2) parkings.unit_type
  if (Array.isArray(project.parkings) && project.parkings.length > 0) {
    const unitTypes = project.parkings
      .map((p) => (p.unit_type || "").toLowerCase())
      .filter(Boolean);

    if (unitTypes.some((t) => t === "villa" || t === "villas")) return "Villa";
    if (
      unitTypes.some((t) => t === "townhouse" || t === "townhouses")
    )
      return "Townhouse";
    if (
      unitTypes.some((t) => t === "apartment" || t === "apartments")
    )
      return "Apartment";
  }

  // 3) building_count
  if (project.building_count > 1) return "Residential Complex";
  if (project.building_count === 1) return "Apartment Building";

  // 4) name
  const name = (project.name || "").toLowerCase();
  if (name.includes("villa")) return "Villa";
  if (name.includes("townhouse") || name.includes("town house"))
    return "Townhouse";
  if (name.includes("residence") || name.includes("apartment"))
    return "Apartment";
  if (name.includes("duplex")) return "Duplex";

  return "Property";
}

// ---- UNIT TYPES (typical_units + legacy) ----
function extractUnitTypes(rawTypicalUnits = []) {
  return rawTypicalUnits.map((u) => {
    const bedrooms =
      u.bedrooms ?? u.unit_bedrooms ?? u.bedroom ?? null;

    const sizeFromM2 = safeNumber(
      u.size_from_m2,
      u.from_size_m2,
      u.min_size_m2,
      u.size_m2
    );
    const sizeToM2 = safeNumber(
      u.size_to_m2,
      u.to_size_m2,
      u.max_size_m2
    );

    const sizeFromSqft = safeNumber(
      u.size_from_sqft,
      u.from_size_sqft,
      u.min_size_sqft,
      u.size_sqft
    );
    const sizeToSqft = safeNumber(
      u.size_to_sqft,
      u.to_size_sqft,
      u.max_size_sqft
    );

    const priceFromAED = safeNumber(
      u.price_from_aed,
      u.from_price_aed,
      u.min_price_aed,
      u.price_aed
    );
    const priceToAED = safeNumber(
      u.price_to_aed,
      u.to_price_aed,
      u.max_price_aed
    );

    const priceFromUSD = safeNumber(
      u.price_from_usd,
      u.from_price_usd,
      u.min_price_usd,
      u.price_usd
    );
    const priceToUSD = safeNumber(
      u.price_to_usd,
      u.to_price_usd,
      u.max_price_usd
    );

    const layouts = u.layout || u.layouts || [];
    const layoutName =
      layouts?.[0]?.name ||
      layouts?.[0]?.title ||
      u.unit_type ||
      u.unit_category ||
      u.name ||
      null;

    const hinted =
      guessTypeFromText(u.unit_type) ||
      guessTypeFromText(layoutName) ||
      guessTypeFromText(u.unit_category);
    const derived =
      hinted || guessTypeFromMetrics(bedrooms, sizeFromM2 ?? sizeToM2, sizeFromSqft ?? sizeToSqft);

    return {
      bedrooms,
      priceFromAED,
      priceToAED,
      priceFromUSD,
      priceToUSD,
      sizeFromSqft,
      sizeToSqft,
      sizeFromM2,
      sizeToM2,
      layouts,
      unitCategory: derived,
      unitType: u.unit_type,
      status: u.status,
    };
  });
}
// Add this helper near the top (optional)
function extractDeveloper(project) {
  const devObj = project?.developer_obj || project?.developerObj || null;

  const name =
    devObj?.name ||
    (typeof project?.developer === "object" ? project.developer?.name : null) ||
    (typeof project?.developer === "string" ? project.developer : null) ||
    project?.developer_name ||
    null;

  const id =
    devObj?.id ||
    (typeof project?.developer === "number" ? project.developer : null) ||
    null;

  return { id, name };
}

export function normalizeProject(project) {
  if (!project) return null;

  // optional debug
  if (process.env.NODE_ENV !== "production") {
    // console.log("🔄 Normalizing project:", project.id, project.name);
  }

  const { lat, lng } = extractCoordinates(project);
  const hasCoords =
    lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng);

  const loc = project.location || null;

  // typical_units (new) with legacy fallbacks
  const rawTypicalUnits =
    project.typical_units ||
    project.unit_types ||
    project.units ||
    [];

  const unitTypes = extractUnitTypes(rawTypicalUnits);
  const propertyTypes = [...new Set(unitTypes.map((u) => u.unitCategory).filter(Boolean))];
  const brRange = bedroomsRange(unitTypes);
  const detectedType = detectPropertyType(project);

  const locationStr = loc
    ? [loc.sector, loc.district, loc.city, loc.region, loc.country]
        .filter(Boolean)
        .join(", ")
    : "Location not specified";

  const minPrice =
    (typeof project.min_price === "object"
      ? project.min_price?.value
      : project.min_price) ?? null;
  const maxPrice =
    (typeof project.max_price === "object"
      ? project.max_price?.value
      : project.max_price) ?? null;

  const cover_image = project.cover_image || null;
  const coverImageUrl = cover_image?.url || null;

  const normalizedProject = {
    id: project.id,
    title: project.name,
    name: project.name,
    developer: project.developer,
    constructionStatus: project.construction_status,
    saleStatus: project.sale_status,
    status: project.status || project.sale_status || null,

    description:
      project.overview ??
      project.description ??
      project.short_description ??
      null,

    updatedAt: project.updated_at,
    completionDate: project.completion_date ?? project.completion_datetime ?? null,

    // LOCATION
    location: locationStr,
    locationObj: loc,
    lat: hasCoords ? lat : null,
    lng: hasCoords ? lng : null,

    // PRICES & SIZE
    minPrice,
    maxPrice,
    minSize: project.min_size ?? null,
    maxSize: project.max_size ?? null,
    priceCurrency: project.price_currency || "AED",
    areaUnit: project.area_unit || "m2",

    // MEDIA
    coverPhoto: coverImageUrl,      // <-- used by PropertyCard
    coverImage: coverImageUrl,
    cover_image: cover_image,       // <-- so PropertyCard.cover_image?.url still works
    architectureImages: project.architecture || [],
    interiorImages: project.interior || [],
    lobbyImages: project.lobby || [],
    generalPlan: project.general_plan || null,
    floorPlans: project.floor_plans || [],

    // AMENITIES & EXTRAS
    amenities: (project.project_amenities || []).map((a) => ({
      id: a.id,
      name: a.amenity?.name || a.name,
      icon: a.icon?.url || a.amenity?.icon?.url,
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
    buildingCount: project.building_count ?? null,
    videoReviews: project.video_reviews || [],

    // developer / flags / timeline
    developerObj: project.developer_obj || project.developer,
    constructionStartDate: project.construction_start_date,
    constructionEndDate: project.construction_end_date,
    isPublished: project.is_published,
    isPartnerProject: project.is_partner_project,

    // DERIVED
    unitTypes,
    propertyTypes,
    propertyType: propertyTypes[0] || detectedType,
    bedroomsRange: brRange,

    // raw
    rawData: project,
  };

  if (process.env.NODE_ENV !== "production") {
    // console.log("✅ Normalized:", normalizedProject.id, normalizedProject.propertyType);
  }

  return normalizedProject;
}