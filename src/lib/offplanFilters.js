// src/lib/offplanFilters.ts
import { prisma } from './prisma.js';

export function parseSearchParamsToFilters(searchParams) {
    const filters = {
        // Strings
        search: searchParams.get('q') || searchParams.get('search') || '',
        currency: searchParams.get('currency') || 'AED',

        // Arrays (comma-separated)
        types: searchParams.get('type') ? searchParams.get('type').split(',').filter(Boolean) : [],
        developers: searchParams.get('developer') ? searchParams.get('developer').split(',').filter(Boolean) : [],
        areas: searchParams.get('area') ? searchParams.get('area').split(',').filter(Boolean) : [],
        districts: searchParams.get('district') ? searchParams.get('district').split(',').filter(Boolean) : [],
        years: searchParams.get('handoverYear') ? searchParams.get('handoverYear').split(',').filter(Boolean) : [],

        // Numbers / Range
        minPrice: searchParams.get('priceMin') || null,
        maxPrice: searchParams.get('priceMax') || null,

        // Booleans
        showMap: searchParams.get('showMap') === 'true',

        // Pagination
        page: parseInt(searchParams.get('page')) || 1,
    };

    return filters;
}

/**
 * Builds a Prisma `where` clause for `ReellyProject`.
 * @param {ReturnType<typeof parseSearchParamsToFilters>} filters
 * @returns {import('@prisma/client').Prisma.ReellyProjectWhereInput}
 */
export function buildWhereClauseFromFilters(filters) {
    const where = {};

    // 1. Text Search (Title only, or broader if needed)
    if (filters.search) {
        where.title = { contains: filters.search, mode: 'insensitive' };
    }

    // 2. Property Type (from relation)
    // Logic: ReellyProject must have AT LEAST ONE propertyType matches the list
    if (filters.types.length > 0) {
        where.propertyTypes = {
            some: {
                type: {
                    in: filters.types,
                    mode: 'insensitive', // optional depends on DB collation
                }
            }
        };
    }

    // 3. Developers
    if (filters.developers.length > 0) {
        where.developerName = {
            in: filters.developers,
            mode: 'insensitive', // Careful: Prisma `in` doesn't always support mode on all DBs, but Postgres usually fine with exact matches.
            // Actually standard `in` is case sensitive usually.
            // Determine distinct values first, then use exact `in` match is safest.
            // For now, let's assume the UI sends exact strings from DB.
        };
    }

    // 4. Areas / Districts
    // If `filters.areas` contains values, we check both `area` and `district` (or just one?)
    // The plan said "Source options from ReellyProject location fields: Distinct district or area".
    // Let's assume the UI sends values that could be in `area` column.
    if (filters.areas.length > 0) {
        where.OR = [
            { area: { in: filters.areas } },
            { district: { in: filters.areas } }
        ];
    }

    // 5. Handover Years (or "Completed")
    // Logic: "Completed" => effectiveDate <= now
    // "YYYY" => effectiveDate between Jan 1 and Dec 31
    // effectiveDate = handoverDate || completionDate
    // Prisma doesn't have a computed column query easily.
    // We have to construct OR conditions.
    if (filters.years.length > 0) {
        const dateConditions = filters.years.map(yearStr => {
            if (yearStr.toLowerCase() === 'completed' || yearStr.toLowerCase() === 'ready') {
                // Date <= Now
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
            if (!where.AND) where.AND = [];
            // Must match AT LEAST one of the selected year logic blocks
            // So wrapping them in a top-level OR for this field
            where.AND.push({ OR: dateConditions });
        }
    }

    // 6. Price
    // Note: we assume the caller handles currency conversion BEFORE calling this,
    // passing minPrice/maxPrice in AED.
    if (filters.minPrice || filters.maxPrice) {
        where.priceFrom = {};
        if (filters.minPrice) where.priceFrom.gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) where.priceFrom.lte = parseFloat(filters.maxPrice);
    }

    return where;
}

export async function getFilterOptions() {
  // 1. Types
  const typesRaw = await prisma.reellyProjectPropertyType.findMany({
    select: { type: true },
    distinct: ['type'],
    // ❌ remove the "where: { type: { not: null } }"
  });

  const types = typesRaw
    .map((t) => t.type)
    .filter((t) => !!t && t.trim().length > 0) // just in case
    .sort();

  // 2. Developers
  const devsRaw = await prisma.reellyProject.findMany({
    select: { developerName: true },
    distinct: ['developerName'],
    where: { developerName: { not: null } },
  });
  const developers = devsRaw
    .map((d) => d.developerName)
    .filter(Boolean)
    .sort();

  // 3. Areas
  const areasRaw = await prisma.reellyProject.findMany({
    select: { area: true },
    distinct: ['area'],
    where: { area: { not: null } },
  });
  const areas = areasRaw.map((a) => a.area).filter(Boolean).sort();

  // 4. Prices
  const priceAgg = await prisma.reellyProject.aggregate({
    _min: { priceFrom: true },
    _max: { priceTo: true },
  });

  return {
    types,
    developers,
    areas,
    prices: {
      min: priceAgg._min.priceFrom ? Number(priceAgg._min.priceFrom) : 0,
      max: priceAgg._max.priceTo ? Number(priceAgg._max.priceTo) : 0,
    },
  };
}

