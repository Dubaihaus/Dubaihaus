// src/lib/projectService.js
import { prisma } from "./prisma";
import { syncProjects } from "./reellySync";

/**
 * Fetch projects from our cached Prisma DB, with filters,
 * and map them back into (almost) the same shape that the
 * old Reelly + ProjectNormalizer pipeline produced.
 */
export async function getCachedProjects(filters = {}) {
  const {
    page = 1,
    pageSize = 20,
    search,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    minSize,
    maxSize,
    currency,
    status,
    saleStatus,
    completionDateFrom,
    completionDateTo,
    sortBy = "updatedAt",
    sortOrder = "desc",
    isFeatured,
    isComingSoon,
    developer,
    // location–related filters
    area,
    city,
    district,
    region,
    // optional bounding box (from legacy area resolver)
    bbox_sw_lat,
    bbox_sw_lng,
    bbox_ne_lat,
    bbox_ne_lng,
    ids, // for map or specific selection
    limit, // alternative to pagination
  } = filters;

  /* ---------------- WHERE CLAUSE ---------------- */

  const where = {};

  // Free-text search across common text fields
  if (search) {
    where.OR = [
      { city: { contains: search, mode: "insensitive" } },
      { area: { contains: search, mode: "insensitive" } },
      { district: { contains: search, mode: "insensitive" } },
      { region: { contains: search, mode: "insensitive" } },
      { locationString: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { developerName: { contains: search, mode: "insensitive" } },
    ];
  }

  // Explicit location filters (used by Areas/AbuDhabi sections & filters panel)
  if (area) {
    where.area = { contains: area, mode: "insensitive" };
  }
  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }
  if (district) {
    where.district = { contains: district, mode: "insensitive" };
  }
  if (region) {
    where.region = { contains: region, mode: "insensitive" };
  }

  // Bounding box (legacy behaviour from Reelly regions/districts)
  if (bbox_sw_lat && bbox_sw_lng && bbox_ne_lat && bbox_ne_lng) {
    const swLat = parseFloat(bbox_sw_lat);
    const swLng = parseFloat(bbox_sw_lng);
    const neLat = parseFloat(bbox_ne_lat);
    const neLng = parseFloat(bbox_ne_lng);

    if (
      Number.isFinite(swLat) &&
      Number.isFinite(swLng) &&
      Number.isFinite(neLat) &&
      Number.isFinite(neLng)
    ) {
      where.latitude = {
        gte: swLat,
        lte: neLat,
      };
      where.longitude = {
        gte: swLng,
        lte: neLng,
      };
    }
  }

  // Developer filter
  if (developer) {
    where.developerName = { contains: developer, mode: "insensitive" };
  }

  // Price filter (using priceFrom only – same as before)
  if (minPrice || maxPrice) {
    where.priceFrom = {};
    if (minPrice) where.priceFrom.gte = parseFloat(minPrice);
    if (maxPrice) where.priceFrom.lte = parseFloat(maxPrice);
  }

  // Area / size filter (m²)
  if (minSize || maxSize) {
    where.areaFrom = {};
    if (minSize) where.areaFrom.gte = parseFloat(minSize);
    if (maxSize) where.areaFrom.lte = parseFloat(maxSize);
  }

  // Bedrooms filter
  if (minBedrooms !== undefined || maxBedrooms !== undefined) {
    const minB = parseInt(minBedrooms);
    const maxB = parseInt(maxBedrooms);

    if (!Number.isNaN(minB)) {
      // Project must support at least this many bedrooms
      where.bedroomsMax = { gte: minB };
    }
    if (!Number.isNaN(maxB)) {
      // Project must start at or below this many bedrooms
      where.bedroomsMin = { lte: maxB };
    }
  }

  // Status
  if (status) {
    where.status = { contains: status, mode: "insensitive" };
  }

  // Sale status (note: Prisma doesn't support mode on equals)
  if (saleStatus) {
    where.saleStatus = { equals: saleStatus };
  }

  if (isFeatured !== undefined) where.isFeatured = isFeatured;
  if (isComingSoon !== undefined) where.isComingSoon = isComingSoon;

  // Filter by specific IDs (for map / detail prefetch)
  if (ids && ids.length > 0) {
    where.id = { in: ids.map((id) => parseInt(id, 10)) };
  }

  /* ---------------- COUNT & INITIAL SYNC ---------------- */

  const total = await prisma.reellyProject.count({ where });

  // If DB is completely empty, trigger initial sync once
  if (total === 0) {
    const dbCount = await prisma.reellyProject.count();
    if (dbCount === 0) {
      console.log("📭 Database empty. Triggering initial Reelly sync…");
      await syncProjects();
      return {
        results: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        didSync: true,
      };
    }
  }

  /* ---------------- FETCH DATA ---------------- */

  const skip = (page - 1) * pageSize;
  const take = limit ? limit : pageSize;

  const projects = await prisma.reellyProject.findMany({
    where,
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      paymentPlans: true,
      propertyTypes: true,
    },
  });

  /* ---------------- MAP TO FRONTEND SHAPE ---------------- */

  const mappedResults = projects.map((p) => {
    // bedrooms label & range (to match ProjectNormalizer)
    let bedroomsLabel = null;
    let bedroomsRange = null;

    const hasMin = typeof p.bedroomsMin === "number";
    const hasMax = typeof p.bedroomsMax === "number";

    if (hasMin && hasMax) {
      if (p.bedroomsMin === p.bedroomsMax) {
        bedroomsLabel = `${p.bedroomsMin}BR`;
        bedroomsRange = bedroomsLabel;
      } else {
        bedroomsLabel = `${p.bedroomsMin}-${p.bedroomsMax}BR`;
        bedroomsRange = `${p.bedroomsMin}–${p.bedroomsMax}BR`;
      }
    }

    // Normalize unit types & property types from relation table
    const rawPropertyTypes = Array.isArray(p.propertyTypes)
      ? p.propertyTypes
      : [];

    const unitTypes = rawPropertyTypes.map((pt) => {
      const raw = pt.rawData || {};

      const unitCategory =
        pt.type ||
        raw.unit_category ||
        raw.unit_type ||
        raw.name ||
        raw.unitCategory ||
        null;

      return {
        ...raw,
        unit_category: unitCategory,
        unit_type: raw.unit_type || unitCategory,
        price_from_aed: pt.priceFrom ?? raw.price_from_aed ?? null,
        size_from_m2: pt.sizeFrom ?? raw.size_from_m2 ?? null,
      };
    });

    const propertyTypeNames = Array.from(
      new Set(
        unitTypes
          .map((u) => u.unit_category)
          .filter((v) => typeof v === "string" && v.trim())
      )
    );

    // Build location object + string
    const locationObj = {
      sector: p.area || null, // approximate “sector/community”
      district: p.district || null,
      city: p.city || null,
      region: p.region || null,
      country: null, // not stored separately in Prisma model yet
    };

    const locationStr =
      p.locationString ||
      [locationObj.district, locationObj.city, locationObj.region]
        .filter(Boolean)
        .join(", ") ||
      null;

    // Price numbers
    const minPriceNum = p.priceFrom != null ? Number(p.priceFrom) : null;
    const maxPriceNum = p.priceTo != null ? Number(p.priceTo) : null;

    // Area numbers
    const minSizeNum = p.areaFrom != null ? Number(p.areaFrom) : null;
    const maxSizeNum = p.areaTo != null ? Number(p.areaTo) : null;

    return {
      id: p.id,
      title: p.title,
      name: p.title,

      description: p.description,

      status: p.status,
      sale_status: p.saleStatus,
      construction_status: p.constructionStatus,

      // LOCATION (keep both string + object to satisfy fmtLocation etc.)
      location: locationStr || "Location not specified",
      locationObj,
      city: p.city,
      district: p.district,
      area: p.area,
      region: p.region,
      lat: p.latitude,
      lng: p.longitude,
      locationString: p.locationString,

      // Developer – IMPORTANT: keep as string for React text
      developer: p.developerName || null,
      developerName: p.developerName || null,
      developerObj: { name: p.developerName || null },

      // Prices
      price_from: p.priceFrom,
      minPrice: minPriceNum,
      maxPrice: maxPriceNum,
      currency: p.currency,
      priceCurrency: p.currency,

      // Bedrooms
      bedrooms: bedroomsLabel,
      bedroomsMin: p.bedroomsMin,
      bedroomsMax: p.bedroomsMax,
      bedroomsRange,

      // Areas
      area_min: p.areaFrom,
      area_max: p.areaTo,
      minSize: minSizeNum,
      maxSize: maxSizeNum,
      areaUnit: p.areaUnit,

      // Media – IMPORTANT: coverImage must be STRING again
      coverPhoto: p.mainImageUrl || null,
      coverImage: p.mainImageUrl || null, // string for Area cards & PropertyCard
      cover_image: p.mainImageUrl
        ? { url: p.mainImageUrl }
        : null, // keep compatibility with old shape

      // Dates
      completion_date: p.completionDate,
      completionDate: p.completionDate,
      handoverDate: p.handoverDate,

      // Relations
      paymentPlans: Array.isArray(p.paymentPlans)
        ? p.paymentPlans.map((pp) => pp.rawData || pp)
        : [],
      unitTypes,
      propertyTypes: propertyTypeNames,
      propertyType: propertyTypeNames[0] || null,

      updatedAt: p.updatedAt,
      isFeatured: p.isFeatured,
      isComingSoon: p.isComingSoon,
    };
  });

  return {
    results: mappedResults,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
