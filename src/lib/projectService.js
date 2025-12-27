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
    regions, // Array of selected regions
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

  // --- NEW FILTERS START ---
  // 1. Property Types (Array)
  // `filters.propertyTypes` = ['Apartment', 'Villa']
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    where.propertyTypes = {
      some: {
        type: {
          in: filters.propertyTypes,
          mode: 'insensitive',
        }
      }
    };
  }

  // 2. Developers (Array) -- overriding single `developer` string if present
  if (filters.developers && filters.developers.length > 0) {
    where.developerName = { in: filters.developers }; // Exact match preferred for filters
  } else if (developer) {
    // Legacy single fuzzy search
    where.developerName = { contains: developer, mode: "insensitive" };
  }

  // 3. Areas (Array) -- overriding single `area` string if present
  if (filters.areas && filters.areas.length > 0) {
    where.OR = [
      ...(where.OR || []), // preserve existing OR if search used it? 
      // careful: Prisma AND/OR structure. 
      // If `search` made an OR, we can't just push new ORs for Area constraint 
      // because top level valid is distinct fields or AND.
      // Actually where.OR is a top-level "At least one of these". 
      // If we have Search OR ... AND Area OR ... 
      // We need to move the Area constraint to a separate AND block or top level field.
      // But `area` can match `area` OR `district`.
    ];
    // To safely add "Area OR District" constraint AND "Search" constraint:
    const areaConstraint = {
      OR: [
        { area: { in: filters.areas } },
        { district: { in: filters.areas } }
      ]
    };

    if (where.OR) {
      // Using AND to combine Search-OR and Area-OR
      where.AND = [
        ...(where.AND || []),
        { OR: where.OR }, // Wrap the previous Search OR
        areaConstraint
      ];
      delete where.OR; // Move it into AND
    } else {
      // Just set OR? No, if we have other fields set, `where` object keys are implicit implicit AND.
      // But we need `area IN [...] OR district IN [...]`.
      // We can use AND array for this specific constraint.
      where.AND = [
        ...(where.AND || []),
        areaConstraint
      ];
    }
  } else if (area) {
    // Legacy single string match - UPDATED to check distinct & area & district
    // Because some data is in `area` and some in `district`.
    const areaOrDistrict = [
      { area: { contains: area, mode: "insensitive" } },
      { district: { contains: area, mode: "insensitive" } }
    ];

    if (where.OR) {
      // If we already have a wrapper OR (e.g. from generic search),
      // we must preserve it and ADD this new requirement as an AND.
      // But we can't do `where.OR.push` because that makes it "Search OR Area", which is wrong.
      // We want "Search AND (Area OR District)".
      where.AND = [
        ...(where.AND || []),
        { OR: where.OR },
        { OR: areaOrDistrict }
      ];
      delete where.OR;
    } else {
      // Just set keys? specific fields are implicit AND.
      // but we need (A or B).
      // So we use where.OR directly? No, where.OR is for top-level.
      // If we have other top-level fields (like city), those are ANDed with where.OR.
      // So `{ city: 'Dubai', OR: [ {area: X}, {district: X} ] }` works perfectly.
      where.OR = areaOrDistrict;
    }
  }

  // 4. Handover Years
  if (filters.handoverYears && filters.handoverYears.length > 0) {
    const dateConditions = filters.handoverYears.map(yearStr => {
      if (yearStr.toString().toLowerCase() === 'completed') {
        const now = new Date();
        return {
          OR: [
            { handoverDate: { lte: now } },
            { AND: [{ handoverDate: null }, { completionDate: { lte: now } }] }
          ]
        };
      }
      const year = parseInt(yearStr);
      if (!isNaN(year)) {
        const start = new Date(`${year}-01-01T00:00:00.000Z`);
        const end = new Date(`${year}-12-31T23:59:59.999Z`);
        return {
          OR: [
            { handoverDate: { gte: start, lte: end } },
            { AND: [{ handoverDate: null }, { completionDate: { gte: start, lte: end } }] }
          ]
        };
      }
      return null;
    }).filter(Boolean);

    if (dateConditions.length > 0) {
      where.AND = [
        ...(where.AND || []),
        { OR: dateConditions }
      ];
    }
  }
  // --- NEW FILTERS END ---

  // Explicit location filters (used by Areas/AbuDhabi sections & filters panel)
  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }
  if (district) {
    where.district = { contains: district, mode: "insensitive" };
  }

  // REGION logic (supports Array OR String)
  if (regions && regions.length > 0) {
    where.region = { in: regions, mode: 'insensitive' };
  } else if (region) {
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

  // Developer filter (Legacy single) - already handled above in "NEW FILTERS" section
  // but we keep this check for backward compat if "developers" array not passed
  if (developer && !filters.developers) {
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

      // Cast possible Prisma.Decimals to plain numbers
      const priceFromAed =
        pt.priceFrom != null
          ? Number(pt.priceFrom)
          : raw.price_from_aed != null
            ? Number(raw.price_from_aed)
            : null;

      const sizeFromM2 =
        pt.sizeFrom != null
          ? Number(pt.sizeFrom)
          : raw.size_from_m2 != null
            ? Number(raw.size_from_m2)
            : null;

      return {
        ...raw,
        unit_category: unitCategory,
        unit_type: raw.unit_type || unitCategory,
        price_from_aed: priceFromAed,
        size_from_m2: sizeFromM2,
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
    // Price numbers (cast all Decimals to plain numbers)
    const minPriceNum =
      p.priceFrom !== null && p.priceFrom !== undefined
        ? Number(p.priceFrom)
        : null;
    const maxPriceNum =
      p.priceTo !== null && p.priceTo !== undefined
        ? Number(p.priceTo)
        : null;

    // Area numbers (cast all Decimals to plain numbers)
    const minSizeNum =
      p.areaFrom !== null && p.areaFrom !== undefined
        ? Number(p.areaFrom)
        : null;
    const maxSizeNum =
      p.areaTo !== null && p.areaTo !== undefined
        ? Number(p.areaTo)
        : null;

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

      // Developer
      developer: p.developerName || null,
      developerName: p.developerName || null,
      developerObj: { name: p.developerName || null },

      // Prices – all plain numbers now
      price_from: minPriceNum,
      minPrice: minPriceNum,
      maxPrice: maxPriceNum,
      currency: p.currency,
      priceCurrency: p.currency,

      // Bedrooms
      bedrooms: bedroomsLabel,
      bedroomsMin: p.bedroomsMin,
      bedroomsMax: p.bedroomsMax,
      bedroomsRange,

      // Areas – all plain numbers now
      area_min: minSizeNum,
      area_max: maxSizeNum,
      minSize: minSizeNum,
      maxSize: maxSizeNum,
      areaUnit: p.areaUnit,

      // Media
      coverPhoto: p.mainImageUrl || null,
      coverImage: p.mainImageUrl || null,
      cover_image: p.mainImageUrl ? { url: p.mainImageUrl } : null,

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
