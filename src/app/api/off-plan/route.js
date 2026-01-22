// // src/app/api/off-plan/route.js
// import { getCachedProjects } from '@/lib/projectService';
// import { applyCurrencyToProjects } from '@/lib/currencyService';

// export const runtime = 'nodejs';

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const filters = {};

//   const currency = (searchParams.get('currency') || 'AED').toUpperCase();

//   // Parse params
//   searchParams.forEach((value, key) => {
//     if (key === 'currency') return;
//     if (value == null || value === '') return;

//     switch (key) {
//       // pagination
//       case 'page':
//         filters.page = parseInt(value, 10) || 1;
//         break;
//       case 'pageSize':
//         filters.pageSize = parseInt(value, 10) || 20;
//         break;

//       // numeric filters (we keep as string; projectService parses)
//       case 'minPrice':
//       case 'maxPrice':
//       case 'minBedrooms':
//       case 'maxBedrooms':
//       case 'minSize':
//       case 'maxSize':
//         filters[key] = value;
//         break;

//       // booleans
//       case 'latest':
//       case 'isFeatured':
//       case 'isComingSoon':
//         filters[key] = value === 'true';
//         break;

//       // map mode
//       case 'forMap':
//       case 'mode':
//         filters[key] = value;
//         break;

//       // location filters (critical for areas sections)
//       case 'area':
//         filters.area = value;
//         filters.areas = value.split(',').filter(Boolean);
//         break;
//       case 'region':
//         if (value.includes(',')) {
//           filters.regions = value.split(',').filter(Boolean);
//         } else {
//           filters.region = value;
//         }
//         break;
//       case 'developer':
//         filters.developer = value;
//         filters.developers = value.split(',').filter(Boolean);
//         break;

//       case 'city':
//       case 'district':
//       case 'country':
//         filters[key] = value;
//         break;

//       // generic search
//       // case 'search':
//       // case 'search_query':
//       //   filters.search = value;
//       //   break;
//       // generic search (free text)
//       case 'search':
//         filters.search = value;
//         break;

//       // legacy semantics: community / area / sector search
//       case 'search_query':
//         filters.area = value;
//         filters.areas = value.split(',').filter(Boolean);
//         break;

//       // legacy status keys
//       case 'sale_status':
//         filters.saleStatus = value;
//         break;
//       case 'construction_status':
//         filters.constructionStatus = value;
//         break;

//       // bounding box (from old region resolver)
//       case 'bbox_sw_lat':
//       case 'bbox_sw_lng':
//       case 'bbox_ne_lat':
//       case 'bbox_ne_lng':
//         filters[key] = value;
//         break;

//       default:
//         filters[key] = value;
//     }
//   });

//   const forMap =
//     filters.mode === 'map' ||
//     filters.forMap === 'true' ||
//     filters.forMap === true;

//   // Specific "latest" logic – presale only
//   if (filters.latest) {
//     filters.saleStatus = 'presale';
//     delete filters.latest;
//   }

//   console.log('🔍 /api/off-plan (Cached) filters:', { ...filters, currency });

//   let data;

//   if (forMap) {
//     // 🌍 Map mode: ignore all filters, get ALL projects and then
//     // filter to those with valid coordinates.
//     data = await getCachedProjects({
//       page: 1,
//       pageSize: 1000, // you currently have ~1010 projects
//       limit: 1000,
//     });

//     if (data?.results) {
//       data.results = data.results.filter(
//         (p) =>
//           typeof p.lat === 'number' &&
//           typeof p.lng === 'number' &&
//           !Number.isNaN(p.lat) &&
//           !Number.isNaN(p.lng)
//       );
//       data.total = data.results.length;
//       data.totalPages = 1;
//     }
//   } else {
//     data = await getCachedProjects(filters);
//   }

//   // 🔹 Enrich with currency
//   data = await applyCurrencyToProjects(data, currency);

//   const responseHeaders = {
//     'Content-Type': 'application/json',
//     'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
//     Vary: 'Accept-Encoding, Cookie, Next-Locale',
//   };

//   return new Response(JSON.stringify(data || { results: [], total: 0 }), {
//     headers: responseHeaders,
//   });
// }
// src/app/api/off-plan/route.js
import { getCachedProjects } from '@/lib/projectService';
import { applyCurrencyToProjects } from '@/lib/currencyService';
import { searchProperties } from '@/lib/reellyApi';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {};

  const currency = (searchParams.get('currency') || 'AED').toUpperCase();

  // Parse params
  searchParams.forEach((value, key) => {
    if (key === 'currency') return;
    if (value == null || value === '') return;

    switch (key) {
      // pagination
      case 'page':
        filters.page = parseInt(value, 10) || 1;
        break;
      case 'pageSize':
        filters.pageSize = parseInt(value, 10) || 20;
        break;

      // numeric filters
      case 'minPrice':
      case 'maxPrice':
      case 'minBedrooms':
      case 'maxBedrooms':
      case 'minSize':
      case 'maxSize':
        filters[key] = value;
        break;

      // booleans
      case 'latest':
      case 'isFeatured':
      case 'isComingSoon':
        filters[key] = value === 'true';
        break;

      // map mode
      case 'forMap':
      case 'mode':
        filters[key] = value;
        break;

      // location filters
      case 'area':
        filters.area = value;
        filters.areas = value.split(',').filter(Boolean);
        break;
      case 'region':
        if (value.includes(',')) {
          filters.regions = value.split(',').filter(Boolean);
        } else {
          filters.region = value;
        }
        break;
      case 'developer':
        filters.developer = value;
        filters.developers = value.split(',').filter(Boolean);
        break;

      case 'city':
      case 'district':
      case 'country':
        filters[key] = value;
        break;

      // generic search
      case 'search':
        filters.search = value;
        break;

      // legacy semantics: community / area / sector search
      case 'search_query':
        filters.area = value;
        filters.areas = value.split(',').filter(Boolean);
        break;

      // legacy status keys
      case 'sale_status':
        filters.saleStatus = value;
        break;
      case 'construction_status':
        filters.constructionStatus = value;
        break;

      // bounding box
      case 'bbox_sw_lat':
      case 'bbox_sw_lng':
      case 'bbox_ne_lat':
      case 'bbox_ne_lng':
        filters[key] = value;
        break;

      default:
        filters[key] = value;
    }
  });

  const forMap =
    filters.mode === 'map' ||
    filters.forMap === 'true' ||
    filters.forMap === true;

  // "latest" = presale only (your existing logic)
  const isLatestRequest = !!filters.latest;

  if (filters.latest) {
    filters.saleStatus = 'presale';
    delete filters.latest;
  }

  console.log('🔍 /api/off-plan filters:', { ...filters, currency, forMap, isLatestRequest });

  let data;

  // 🌍 Map mode: keep current behavior (cached DB, then filter coords)
  if (forMap) {
    data = await getCachedProjects({
      page: 1,
      pageSize: 1000,
      limit: 1000,
    });

    if (data?.results) {
      data.results = data.results.filter(
        (p) =>
          typeof p.lat === 'number' &&
          typeof p.lng === 'number' &&
          !Number.isNaN(p.lat) &&
          !Number.isNaN(p.lng)
      );
      data.total = data.results.length;
      data.totalPages = 1;
    }
  }
  // ✅ LATEST/PRESALE: BYPASS DB and HIT REELLY DIRECTLY
  else if (isLatestRequest || filters.saleStatus === 'start of sales') {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    // Map your API filters into Reelly API filter keys.
    // Your reellyApi.searchProperties expects: region, developer, district(s), search_query, etc.
    const reellyFilters = {
      page,
      pageSize,
      pricedOnly: false,
      currency, // becomes preferred_currency internally via mapping
      sale_status: 'start of sales',
      ordering: '-updated_at',
    };

    // If you passed a region, use it
    if (filters.region) reellyFilters.region = filters.region;
    if (filters.regions?.length) reellyFilters.region = filters.regions.join(',');

    // If user selected developer(s)
    if (filters.developer) reellyFilters.developer = filters.developer;

    // If user used the generic search box (your OffPlan uses search)
    if (filters.search) reellyFilters.search = filters.search;

    // If legacy "search_query" style is used (areas)
    if (filters.area) reellyFilters.search_query = filters.area;

    // Bedrooms/price/size (keep your semantics)
    if (filters.minPrice) reellyFilters.minPrice = filters.minPrice;
    if (filters.maxPrice) reellyFilters.maxPrice = filters.maxPrice;
    if (filters.minBedrooms) reellyFilters.bedrooms = filters.minBedrooms; // simplest mapping
    if (filters.minSize) reellyFilters.minSize = filters.minSize;
    if (filters.maxSize) reellyFilters.maxSize = filters.maxSize;

    const direct = await searchProperties(reellyFilters);

    data = direct || { results: [], total: 0, page, pageSize, totalPages: 1 };
  }
  // ✅ Everything else: keep cached DB
  else {
    data = await getCachedProjects(filters);
  }

  // Currency enrichment (works for both sources)
  data = await applyCurrencyToProjects(data, currency);

  const responseHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    Vary: 'Accept-Encoding, Cookie, Next-Locale',
  };

  return new Response(JSON.stringify(data || { results: [], total: 0 }), {
    headers: responseHeaders,
  });
}
